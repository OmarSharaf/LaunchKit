/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { mockUser } from '@/test-utils'
import { ZodError } from 'zod'

const mockRequireAuth = jest.fn()
const mockRequireOrgRole = jest.fn()
const mockFindUnique = jest.fn()
const mockOrgUpdate = jest.fn()
const mockGetOrCreateStripeCustomer = jest.fn()
const mockCreateCheckoutSession = jest.fn()
const mockCreateAuditLog = jest.fn()

jest.mock('@/lib/auth', () => ({
  requireAuthApi: () => mockRequireAuth(),
  requireOrgRole: (...args: unknown[]) => mockRequireOrgRole(...args),
}))

jest.mock('@/lib/audit', () => ({
  createAuditLog: (...args: unknown[]) => mockCreateAuditLog(...args),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: (...args: unknown[]) => mockFindUnique(...args) },
    organization: { update: (...args: unknown[]) => mockOrgUpdate(...args) },
  },
}))

jest.mock('@/lib/stripe', () => ({
  getOrCreateStripeCustomer: (...args: unknown[]) =>
    mockGetOrCreateStripeCustomer(...args),
  createCheckoutSession: (...args: unknown[]) =>
    mockCreateCheckoutSession(...args),
}))

import { POST } from './route'

describe('POST /api/stripe/checkout', () => {
  const membership = {
    organization: {
      id: 'org-123',
      name: 'Acme',
      stripeCustomerId: null,
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAuth.mockResolvedValue(mockUser)
    mockRequireOrgRole.mockResolvedValue(membership)
    mockFindUnique.mockResolvedValue({ email: 'db@example.com' })
    mockGetOrCreateStripeCustomer.mockResolvedValue({ id: 'cus_new' })
    mockCreateCheckoutSession.mockResolvedValue({
      url: 'https://checkout.stripe.com',
    })
    mockOrgUpdate.mockResolvedValue({})
    mockCreateAuditLog.mockResolvedValue({})
  })

  it('creates checkout session for admin', async () => {
    const request = new NextRequest('http://localhost/api/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify({ priceId: 'price_1', organizationId: 'org-123' }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.url).toBe('https://checkout.stripe.com')
    expect(mockOrgUpdate).toHaveBeenCalledWith({
      where: { id: 'org-123' },
      data: { stripeCustomerId: 'cus_new' },
    })
  })

  it('skips org update when customer already exists', async () => {
    mockRequireOrgRole.mockResolvedValue({
      organization: {
        ...membership.organization,
        stripeCustomerId: 'cus_existing',
      },
    })
    mockGetOrCreateStripeCustomer.mockResolvedValue({ id: 'cus_existing' })

    const request = new NextRequest('http://localhost/api/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify({ priceId: 'price_1', organizationId: 'org-123' }),
    })

    await POST(request)
    expect(mockOrgUpdate).not.toHaveBeenCalled()
  })

  it('falls back to auth email when db user is missing', async () => {
    mockFindUnique.mockResolvedValue(null)

    const request = new NextRequest('http://localhost/api/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify({ priceId: 'price_1', organizationId: 'org-123' }),
    })

    await POST(request)

    expect(mockGetOrCreateStripeCustomer).toHaveBeenCalledWith(
      expect.objectContaining({ email: mockUser.email })
    )
  })

  it('returns 403 when user is not admin', async () => {
    const { ForbiddenError } = await import('@/lib/errors')
    mockRequireOrgRole.mockRejectedValue(new ForbiddenError())

    const request = new NextRequest('http://localhost/api/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify({ priceId: 'price_1', organizationId: 'org-123' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(403)
  })

  it('returns 400 for invalid body', async () => {
    const request = new NextRequest('http://localhost/api/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify({ priceId: 123 }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })

  it('returns 401 when unauthenticated', async () => {
    const { AuthError } = await import('@/lib/errors')
    mockRequireAuth.mockRejectedValue(new AuthError())

    const request = new NextRequest('http://localhost/api/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify({ priceId: 'price_1', organizationId: 'org-123' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(401)
  })

  it('returns 500 on unexpected errors', async () => {
    mockRequireAuth.mockRejectedValue(new Error('auth failed'))

    const request = new NextRequest('http://localhost/api/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify({ priceId: 'price_1', organizationId: 'org-123' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(500)
  })
})
