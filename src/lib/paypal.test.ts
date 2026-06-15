const mockFetch = jest.fn()

global.fetch = mockFetch as unknown as typeof fetch

import {
  createPayPalSubscription,
  decodePayPalCustomId,
  encodePayPalCustomId,
  getPayPalApiBaseUrl,
  getPayPalManageUrl,
  getPayPalPeriodDates,
  isPayPalEnabled,
  mapPayPalSubscriptionStatus,
  resetPayPalAccessTokenCache,
  retrievePayPalSubscription,
  verifyPayPalWebhook,
} from './paypal'

describe('paypal helpers', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    resetPayPalAccessTokenCache()
    process.env = { ...originalEnv }
    process.env.PAYPAL_CLIENT_ID = 'client_test'
    process.env.PAYPAL_CLIENT_SECRET = 'secret_test'
    process.env.PAYPAL_MODE = 'sandbox'
    process.env.NEXT_PUBLIC_APP_NAME = 'Launch Kit'
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('isPayPalEnabled', () => {
    it('returns true when credentials are set', () => {
      expect(isPayPalEnabled()).toBe(true)
    })

    it('returns false when client id is missing', () => {
      delete process.env.PAYPAL_CLIENT_ID
      expect(isPayPalEnabled()).toBe(false)
    })
  })

  describe('custom id helpers', () => {
    it('encodes and decodes organization and plan ids', () => {
      const encoded = encodePayPalCustomId('org_1', 'plan_1')
      expect(encoded).toBe('org_1|plan_1')
      expect(decodePayPalCustomId(encoded)).toEqual({
        organizationId: 'org_1',
        planId: 'plan_1',
      })
    })
  })

  describe('mapPayPalSubscriptionStatus', () => {
    it('maps active subscriptions', () => {
      expect(mapPayPalSubscriptionStatus('ACTIVE')).toBe('ACTIVE')
    })

    it('maps suspended subscriptions', () => {
      expect(mapPayPalSubscriptionStatus('SUSPENDED')).toBe('PAST_DUE')
    })
  })

  describe('getPayPalApiBaseUrl', () => {
    it('uses sandbox by default', () => {
      expect(getPayPalApiBaseUrl()).toBe('https://api-m.sandbox.paypal.com')
    })

    it('uses live mode when configured', () => {
      process.env.PAYPAL_MODE = 'live'
      expect(getPayPalApiBaseUrl()).toBe('https://api-m.paypal.com')
    })
  })

  describe('getPayPalManageUrl', () => {
    it('returns sandbox manage URL by default', () => {
      expect(getPayPalManageUrl()).toBe(
        'https://www.sandbox.paypal.com/myaccount/autopay/'
      )
    })
  })

  describe('getPayPalPeriodDates', () => {
    it('derives billing period dates from resource', () => {
      const dates = getPayPalPeriodDates({
        id: 'I-123',
        plan_id: 'P-123',
        status: 'ACTIVE',
        start_time: '2024-01-01T00:00:00Z',
        billing_info: {
          next_billing_time: '2024-02-01T00:00:00Z',
          last_payment: { time: '2024-01-01T00:00:00Z' },
        },
      })

      expect(dates.currentPeriodStart.toISOString()).toBe(
        '2024-01-01T00:00:00.000Z'
      )
      expect(dates.currentPeriodEnd.toISOString()).toBe(
        '2024-02-01T00:00:00.000Z'
      )
    })
  })

  describe('createPayPalSubscription', () => {
    it('creates a subscription and returns approval URL', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            access_token: 'token_123',
            expires_in: 3600,
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id: 'I-123',
            links: [{ rel: 'approve', href: 'https://paypal.com/approve' }],
          }),
        })

      const result = await createPayPalSubscription({
        paypalPlanId: 'P-123',
        organizationId: 'org_1',
        planId: 'plan_1',
        successUrl: 'http://localhost/success',
        cancelUrl: 'http://localhost/cancel',
      })

      expect(result.url).toBe('https://paypal.com/approve')
      expect(result.subscriptionId).toBe('I-123')
      expect(mockFetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('retrievePayPalSubscription', () => {
    it('fetches subscription details', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            access_token: 'token_123',
            expires_in: 3600,
          }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            id: 'I-123',
            plan_id: 'P-123',
            status: 'ACTIVE',
          }),
        })

      const subscription = await retrievePayPalSubscription('I-123')
      expect(subscription.id).toBe('I-123')
    })
  })

  describe('verifyPayPalWebhook', () => {
    it('returns parsed event when webhook id is not configured', async () => {
      delete process.env.PAYPAL_WEBHOOK_ID
      const body = JSON.stringify({
        id: 'WH-123',
        event_type: 'BILLING.SUBSCRIPTION.ACTIVATED',
        resource: { id: 'I-123', plan_id: 'P-123', status: 'ACTIVE' },
      })

      const event = await verifyPayPalWebhook({}, body)
      expect(event.event_type).toBe('BILLING.SUBSCRIPTION.ACTIVATED')
    })
  })
})
