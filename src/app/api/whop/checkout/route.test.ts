/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { mockUser } from '@/test-utils'
import { ZodError } from 'zod'

const mockRequireAuth = jest.fn()
const mockRequireOrgRole = jest.fn()
const mockPlanFindFirst = jest.fn()
const mockIsWhopEnabled = jest.fn()
const mockCreateWhopCheckout = jest.fn()

jest.mock('@/lib/auth', () => ({
  requireAuthApi: () => mockRequireAuth(),
  requireOrgRole: (...args: unknown[]) => mockRequireOrgRole(...args),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    plan: { findFirst: (...args: unknown[]) => mockPlanFindFirst(...args) },
  },
}))

jest.mock('@/lib/whop', () => ({
  isWhopEnabled: () => mockIsWhopEnabled(),
  createWhopCheckout: (...args: unknown[]) => mockCreateWhopCheckout(...args),
}))

import { POST } from './route'

describe('POST /api/whop/checkout', () => {
  const membership = {
    organization: {
      id: 'org-123',
      name: 'Acme',
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockIsWhopEnabled.mockReturnValue(true)
    mockRequireAuth.mockResolvedValue(mockUser)
    mockRequireOrgRole.mockResolvedValue(membership)
    mockPlanFindFirst.mockResolvedValue({
      id: 'plan-1',
      name: 'Pro',
      amount: 2900,
      whopPlanId: 'plan_whop_1',
    })
    mockCreateWhopCheckout.mockResolvedValue({
      url: 'https://whop.com/checkout/plan_test',
    })
  })

  it('creates Whop checkout for admin', async () => {
    const request = new NextRequest('http://localhost/api/whop/checkout', {
      method: 'POST',
      body: JSON.stringify({ planId: 'plan-1', organizationId: 'org-123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.url).toBe('https://whop.com/checkout/plan_test')
    expect(mockCreateWhopCheckout).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: 'org-123',
        planId: 'plan-1',
        whopPlanId: 'plan_whop_1',
      })
    )
  })

  it('returns 503 when Whop is not configured', async () => {
    mockIsWhopEnabled.mockReturnValue(false)

    const request = new NextRequest('http://localhost/api/whop/checkout', {
      method: 'POST',
      body: JSON.stringify({ planId: 'plan-1', organizationId: 'org-123' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(503)
  })

  it('returns 403 when user is not admin', async () => {
    const { ForbiddenError } = await import('@/lib/errors')
    mockRequireOrgRole.mockRejectedValue(
      new ForbiddenError('Admin access required')
    )

    const request = new NextRequest('http://localhost/api/whop/checkout', {
      method: 'POST',
      body: JSON.stringify({ planId: 'plan-1', organizationId: 'org-123' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(403)
  })

  it('returns 404 when plan is missing', async () => {
    mockPlanFindFirst.mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/whop/checkout', {
      method: 'POST',
      body: JSON.stringify({ planId: 'plan-1', organizationId: 'org-123' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(404)
  })

  it('returns 400 for invalid body', async () => {
    const request = new NextRequest('http://localhost/api/whop/checkout', {
      method: 'POST',
      body: JSON.stringify({ planId: 123 }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('returns 401 when unauthenticated', async () => {
    const { AuthError } = await import('@/lib/errors')
    mockRequireAuth.mockRejectedValue(new AuthError())

    const request = new NextRequest('http://localhost/api/whop/checkout', {
      method: 'POST',
      body: JSON.stringify({ planId: 'plan-1', organizationId: 'org-123' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it('returns 500 on unexpected errors', async () => {
    mockRequireAuth.mockRejectedValue(new Error('auth failed'))

    const request = new NextRequest('http://localhost/api/whop/checkout', {
      method: 'POST',
      body: JSON.stringify({ planId: 'plan-1', organizationId: 'org-123' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(500)
  })
})
