/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { mockUser } from '@/test-utils'

const mockRequireAuth = jest.fn()
const mockRequireOrgRole = jest.fn()
const mockPlanFindFirst = jest.fn()
const mockIsPayPalEnabled = jest.fn()
const mockCreatePayPalSubscription = jest.fn()

jest.mock('@/lib/auth', () => ({
  requireAuthApi: () => mockRequireAuth(),
  requireOrgRole: (...args: unknown[]) => mockRequireOrgRole(...args),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    plan: { findFirst: (...args: unknown[]) => mockPlanFindFirst(...args) },
  },
}))

jest.mock('@/lib/paypal', () => ({
  isPayPalEnabled: () => mockIsPayPalEnabled(),
  createPayPalSubscription: (...args: unknown[]) =>
    mockCreatePayPalSubscription(...args),
}))

import { POST } from './route'

describe('POST /api/paypal/checkout', () => {
  const membership = {
    organization: {
      id: 'org-123',
      name: 'Acme',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockIsPayPalEnabled.mockReturnValue(true)
    mockRequireAuth.mockResolvedValue(mockUser)
    mockRequireOrgRole.mockResolvedValue(membership)
    mockPlanFindFirst.mockResolvedValue({
      id: 'plan-1',
      name: 'Pro',
      amount: 2900,
      paypalPlanId: 'P-123',
    })
    mockCreatePayPalSubscription.mockResolvedValue({
      url: 'https://paypal.com/approve',
    })
  })

  it('creates PayPal checkout for admin', async () => {
    const request = new NextRequest('http://localhost/api/paypal/checkout', {
      method: 'POST',
      body: JSON.stringify({ planId: 'plan-1', organizationId: 'org-123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.url).toBe('https://paypal.com/approve')
    expect(mockCreatePayPalSubscription).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: 'org-123',
        planId: 'plan-1',
        paypalPlanId: 'P-123',
      })
    )
  })

  it('returns 503 when PayPal is not configured', async () => {
    mockIsPayPalEnabled.mockReturnValue(false)

    const request = new NextRequest('http://localhost/api/paypal/checkout', {
      method: 'POST',
      body: JSON.stringify({ planId: 'plan-1', organizationId: 'org-123' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(503)
  })

  it('returns 404 when PayPal plan is missing', async () => {
    mockPlanFindFirst.mockResolvedValue({
      id: 'plan-1',
      paypalPlanId: null,
    })

    const request = new NextRequest('http://localhost/api/paypal/checkout', {
      method: 'POST',
      body: JSON.stringify({ planId: 'plan-1', organizationId: 'org-123' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(404)
  })

  it('returns 403 when user is not admin', async () => {
    const { ForbiddenError } = await import('@/lib/errors')
    mockRequireOrgRole.mockRejectedValue(
      new ForbiddenError('Admin access required')
    )

    const request = new NextRequest('http://localhost/api/paypal/checkout', {
      method: 'POST',
      body: JSON.stringify({ planId: 'plan-1', organizationId: 'org-123' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(403)
  })
})
