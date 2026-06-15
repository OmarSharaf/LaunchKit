/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

const mockUnwrapWhopWebhook = jest.fn()
const mockPlanFindFirst = jest.fn()
const mockPlanFindUnique = jest.fn()
const mockSubscriptionUpsert = jest.fn()
const mockSubscriptionUpdate = jest.fn()
const mockOrganizationUpdate = jest.fn()
const mockWhopWebhookFindUnique = jest.fn()
const mockWhopWebhookCreate = jest.fn()

jest.mock('@/lib/whop', () => ({
  unwrapWhopWebhook: (...args: unknown[]) => mockUnwrapWhopWebhook(...args),
  mapWhopMembershipStatus: (status: string) =>
    status === 'trialing' ? 'TRIALING' : 'ACTIVE',
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    plan: {
      findFirst: (...args: unknown[]) => mockPlanFindFirst(...args),
      findUnique: (...args: unknown[]) => mockPlanFindUnique(...args),
    },
    subscription: {
      upsert: (...args: unknown[]) => mockSubscriptionUpsert(...args),
      update: (...args: unknown[]) => mockSubscriptionUpdate(...args),
    },
    organization: {
      update: (...args: unknown[]) => mockOrganizationUpdate(...args),
    },
    whopWebhookEvent: {
      findUnique: (...args: unknown[]) => mockWhopWebhookFindUnique(...args),
      create: (...args: unknown[]) => mockWhopWebhookCreate(...args),
    },
  },
}))

import { POST } from './route'

function createWebhookRequest(body: string) {
  return new NextRequest('http://localhost/api/webhooks/whop', {
    method: 'POST',
    body,
    headers: {
      'webhook-id': 'msg_1',
      'webhook-signature': 'v1,test',
      'webhook-timestamp': '123',
    },
  })
}

const membershipPayload = {
  id: 'mem_123',
  status: 'active',
  cancel_at_period_end: false,
  renewal_period_start: '1700000000',
  renewal_period_end: '1702678400',
  metadata: { organizationId: 'org-1', planId: 'plan-1' },
  plan: { id: 'plan_whop_1' },
  member: { id: 'mber_1' },
}

describe('POST /api/webhooks/whop', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'error').mockImplementation()
    mockWhopWebhookFindUnique.mockResolvedValue(null)
    mockWhopWebhookCreate.mockResolvedValue({})
    mockSubscriptionUpdate.mockResolvedValue({})
    mockSubscriptionUpsert.mockResolvedValue({})
    mockOrganizationUpdate.mockResolvedValue({})
    mockPlanFindUnique.mockResolvedValue({ id: 'plan-1' })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns 400 when signature verification fails', async () => {
    mockUnwrapWhopWebhook.mockImplementation(() => {
      throw new Error('invalid')
    })

    const response = await POST(createWebhookRequest('{}'))
    expect(response.status).toBe(400)
  })

  it('handles membership.activated', async () => {
    mockUnwrapWhopWebhook.mockReturnValue({
      id: 'msg_1',
      type: 'membership.activated',
      data: membershipPayload,
    })

    const response = await POST(createWebhookRequest('{}'))
    expect(response.status).toBe(200)
    expect(mockSubscriptionUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          paymentProvider: 'WHOP',
          whopMembershipId: 'mem_123',
        }),
      })
    )
    expect(mockOrganizationUpdate).toHaveBeenCalled()
    expect(mockWhopWebhookCreate).toHaveBeenCalled()
  })

  it('skips duplicate webhook events', async () => {
    mockWhopWebhookFindUnique.mockResolvedValue({ id: 'msg_1' })
    mockUnwrapWhopWebhook.mockReturnValue({
      id: 'msg_1',
      type: 'membership.activated',
      data: membershipPayload,
    })

    const response = await POST(createWebhookRequest('{}'))
    expect(response.status).toBe(200)
    expect(mockSubscriptionUpsert).not.toHaveBeenCalled()
  })

  it('handles membership.deactivated', async () => {
    mockUnwrapWhopWebhook.mockReturnValue({
      id: 'msg_2',
      type: 'membership.deactivated',
      data: membershipPayload,
    })

    const response = await POST(createWebhookRequest('{}'))
    expect(response.status).toBe(200)
    expect(mockSubscriptionUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'CANCELED' }),
      })
    )
  })

  it('handles payment.failed', async () => {
    mockUnwrapWhopWebhook.mockReturnValue({
      id: 'msg_3',
      type: 'payment.failed',
      data: { membership: { id: 'mem_123' } },
    })

    const response = await POST(createWebhookRequest('{}'))
    expect(response.status).toBe(200)
    expect(mockSubscriptionUpdate).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: 'PAST_DUE' } })
    )
  })

  it('returns 500 when handler throws', async () => {
    mockUnwrapWhopWebhook.mockReturnValue({
      id: 'msg_4',
      type: 'membership.activated',
      data: { ...membershipPayload, metadata: {} },
    })

    const response = await POST(createWebhookRequest('{}'))
    expect(response.status).toBe(500)
  })
})
