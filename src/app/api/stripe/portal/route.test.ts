/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { mockUser } from '@/test-utils'
import { AuthError, ForbiddenError } from '@/lib/errors'

const mockRequireAuth = jest.fn()
const mockRequireOrgRole = jest.fn()
const mockCreateBillingPortalSession = jest.fn()
const mockCreateAuditLog = jest.fn()

jest.mock('@/lib/auth', () => ({
  requireAuthApi: () => mockRequireAuth(),
  requireOrgRole: (...args: unknown[]) => mockRequireOrgRole(...args),
}))

jest.mock('@/lib/audit', () => ({
  createAuditLog: (...args: unknown[]) => mockCreateAuditLog(...args),
}))

jest.mock('@/lib/stripe', () => ({
  createBillingPortalSession: (...args: unknown[]) =>
    mockCreateBillingPortalSession(...args),
}))

import { POST } from './route'

describe('POST /api/stripe/portal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAuth.mockResolvedValue(mockUser)
    mockRequireOrgRole.mockResolvedValue({
      organization: { stripeCustomerId: 'cus_123' },
    })
    mockCreateBillingPortalSession.mockResolvedValue({
      url: 'https://billing.stripe.com',
    })
    mockCreateAuditLog.mockResolvedValue({})
  })

  it('creates billing portal session', async () => {
    const request = new NextRequest('http://localhost/api/stripe/portal', {
      method: 'POST',
      body: JSON.stringify({ organizationId: 'org-123' }),
    })

    const response = await POST(request)
    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.url).toBe('https://billing.stripe.com')
  })

  it('returns 400 without stripe customer', async () => {
    mockRequireOrgRole.mockResolvedValue({
      organization: { stripeCustomerId: null },
    })

    const request = new NextRequest('http://localhost/api/stripe/portal', {
      method: 'POST',
      body: JSON.stringify({ organizationId: 'org-123' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('returns 403 when not admin', async () => {
    mockRequireOrgRole.mockRejectedValue(new ForbiddenError())
    const request = new NextRequest('http://localhost/api/stripe/portal', {
      method: 'POST',
      body: JSON.stringify({ organizationId: 'org-123' }),
    })
    const response = await POST(request)
    expect(response.status).toBe(403)
  })

  it('returns 401 when unauthenticated', async () => {
    mockRequireAuth.mockRejectedValue(new AuthError())
    const request = new NextRequest('http://localhost/api/stripe/portal', {
      method: 'POST',
      body: JSON.stringify({ organizationId: 'org-123' }),
    })
    const response = await POST(request)
    expect(response.status).toBe(401)
  })
})
