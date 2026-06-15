/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

const mockVerifyPayPalWebhook = jest.fn()
const mockPlanFindFirst = jest.fn()
const mockPlanFindUnique = jest.fn()
const mockSubscriptionUpsert = jest.fn()
const mockSubscriptionUpdate = jest.fn()
const mockOrganizationUpdate = jest.fn()
const mockPaypalWebhookFindUnique = jest.fn()
const mockPaypalWebhookCreate = jest.fn()

jest.mock('@/lib/paypal', () => ({
  verifyPayPalWebhook: (...args: unknown[]) => mockVerifyPayPalWebhook(...args),
  mapPayPalSubscriptionStatus: (status: string) =>
    status === 'SUSPENDED' ? 'PAST_DUE' : 'ACTIVE',
  getPayPalPeriodDates: () => ({
    currentPeriodStart: new Date('2024-01-01T00:00:00Z'),
    currentPeriodEnd: new Date('2024-02-01T00:00:00Z'),
    trialEnd: null,
  }),
  decodePayPalCustomId: (customId: string) => {
    const [organizationId, planId] = customId.split('|')
    return { organizationId, planId }
  },
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
    paypalWebhookEvent: {
      findUnique: (...args: unknown[]) => mockPaypalWebhookFindUnique(...args),
      create: (...args: unknown[]) => mockPaypalWebhookCreate(...args),
    },
  },
}))

import { POST } from './route'

function createWebhookRequest(body: string) {
  return new NextRequest('http://localhost/api/webhooks/paypal', {
    method: 'POST',
    body,
    headers: {
      'paypal-transmission-id': 'tx_1',
      'paypal-transmission-sig': 'sig',
      'paypal-cert-url': 'https://paypal.com/cert',
      'paypal-auth-algo': 'SHA256withRSA',
      'paypal-transmission-time': '2024-01-01T00:00:00Z',
    },
  })
}

const subscriptionResource = {
  id: 'I-123',
  plan_id: 'P-123',
  status: 'ACTIVE',
  custom_id: 'org-1|plan-1',
  subscriber: { payer_id: 'PAYER123' },
}

describe('POST /api/webhooks/paypal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.spyOn(console, 'log').mockImplementation()
    jest.spyOn(console, 'error').mockImplementation()
    mockPaypalWebhookFindUnique.mockResolvedValue(null)
    mockPaypalWebhookCreate.mockResolvedValue({})
    mockSubscriptionUpdate.mockResolvedValue({})
    mockSubscriptionUpsert.mockResolvedValue({})
    mockOrganizationUpdate.mockResolvedValue({})
    mockPlanFindUnique.mockResolvedValue({ id: 'plan-1' })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('returns 400 when signature verification fails', async () => {
    mockVerifyPayPalWebhook.mockRejectedValue(new Error('invalid'))

    const response = await POST(createWebhookRequest('{}'))
    expect(response.status).toBe(400)
  })

  it('handles BILLING.SUBSCRIPTION.ACTIVATED', async () => {
    mockVerifyPayPalWebhook.mockResolvedValue({
      id: 'WH-1',
      event_type: 'BILLING.SUBSCRIPTION.ACTIVATED',
      resource: subscriptionResource,
    })

    const response = await POST(createWebhookRequest('{}'))
    expect(response.status).toBe(200)
    expect(mockSubscriptionUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({
          paymentProvider: 'PAYPAL',
          paypalSubscriptionId: 'I-123',
        }),
      })
    )
    expect(mockOrganizationUpdate).toHaveBeenCalled()
  })

  it('skips duplicate webhook events', async () => {
    mockPaypalWebhookFindUnique.mockResolvedValue({ id: 'WH-1' })
    mockVerifyPayPalWebhook.mockResolvedValue({
      id: 'WH-1',
      event_type: 'BILLING.SUBSCRIPTION.ACTIVATED',
      resource: subscriptionResource,
    })

    const response = await POST(createWebhookRequest('{}'))
    expect(response.status).toBe(200)
    expect(mockSubscriptionUpsert).not.toHaveBeenCalled()
  })

  it('handles BILLING.SUBSCRIPTION.CANCELLED', async () => {
    mockVerifyPayPalWebhook.mockResolvedValue({
      id: 'WH-2',
      event_type: 'BILLING.SUBSCRIPTION.CANCELLED',
      resource: subscriptionResource,
    })

    const response = await POST(createWebhookRequest('{}'))
    expect(response.status).toBe(200)
    expect(mockSubscriptionUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'CANCELED' }),
      })
    )
  })

  it('returns 500 when handler throws', async () => {
    mockVerifyPayPalWebhook.mockResolvedValue({
      id: 'WH-3',
      event_type: 'BILLING.SUBSCRIPTION.ACTIVATED',
      resource: { ...subscriptionResource, custom_id: '' },
    })

    const response = await POST(createWebhookRequest('{}'))
    expect(response.status).toBe(500)
  })
})
