jest.mock('@whop/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    checkoutConfigurations: {
      create: jest.fn().mockResolvedValue({
        id: 'ch_test',
        purchase_url: '/checkout/plan_test?session=ch_test',
      }),
    },
    memberships: {
      retrieve: jest.fn().mockResolvedValue({
        id: 'mem_test',
        manage_url: 'https://whop.com/billing/manage/mem_test',
      }),
    },
    webhooks: {
      unwrap: jest.fn().mockReturnValue({ type: 'test.event', id: 'msg_test' }),
    },
  }))
})

import { whop } from './whop'
import {
  createWhopCheckout,
  isWhopEnabled,
  mapWhopMembershipStatus,
  resolveWhopCheckoutUrl,
  unwrapWhopWebhook,
} from './whop'

describe('whop helpers', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.clearAllMocks()
    process.env = { ...originalEnv }
    process.env.WHOP_API_KEY = 'whop_test'
    process.env.WHOP_COMPANY_ID = 'biz_test'
    process.env.WHOP_WEBHOOK_SECRET = 'secret'
    ;(whop.checkoutConfigurations.create as jest.Mock).mockResolvedValue({
      id: 'ch_test',
      purchase_url: '/checkout/plan_test?session=ch_test',
    })
    ;(whop.webhooks.unwrap as jest.Mock).mockReturnValue({
      type: 'test.event',
      id: 'msg_test',
    })
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('isWhopEnabled', () => {
    it('returns true when required env vars are set', () => {
      expect(isWhopEnabled()).toBe(true)
    })

    it('returns false when API key is missing', () => {
      delete process.env.WHOP_API_KEY
      expect(isWhopEnabled()).toBe(false)
    })
  })

  describe('mapWhopMembershipStatus', () => {
    it('maps active memberships', () => {
      expect(mapWhopMembershipStatus('active')).toBe('ACTIVE')
    })

    it('maps trialing memberships', () => {
      expect(mapWhopMembershipStatus('trialing')).toBe('TRIALING')
    })
  })

  describe('resolveWhopCheckoutUrl', () => {
    it('returns absolute URLs unchanged', () => {
      expect(resolveWhopCheckoutUrl('https://whop.com/checkout')).toBe(
        'https://whop.com/checkout'
      )
    })

    it('prefixes relative checkout URLs', () => {
      expect(resolveWhopCheckoutUrl('/checkout/plan_test')).toBe(
        'https://whop.com/checkout/plan_test'
      )
    })
  })

  describe('createWhopCheckout', () => {
    it('creates checkout with an existing Whop plan', async () => {
      const result = await createWhopCheckout({
        organizationId: 'org_1',
        planId: 'plan-db-1',
        whopPlanId: 'plan_whop_1',
        planName: 'Pro',
        amountCents: 2900,
        successUrl: 'http://localhost/success',
        cancelUrl: 'http://localhost/cancel',
      })

      expect(whop.checkoutConfigurations.create).toHaveBeenCalledWith(
        expect.objectContaining({
          plan_id: 'plan_whop_1',
          metadata: { organizationId: 'org_1', planId: 'plan-db-1' },
        })
      )
      expect(result.url).toBe(
        'https://whop.com/checkout/plan_test?session=ch_test'
      )
    })

    it('creates inline renewal plans when no Whop plan ID exists', async () => {
      await createWhopCheckout({
        organizationId: 'org_1',
        planId: 'plan-db-1',
        whopPlanId: null,
        planName: 'Pro',
        amountCents: 2900,
        successUrl: 'http://localhost/success',
        cancelUrl: 'http://localhost/cancel',
      })

      expect(whop.checkoutConfigurations.create).toHaveBeenCalledWith(
        expect.objectContaining({
          plan: expect.objectContaining({
            company_id: 'biz_test',
            plan_type: 'renewal',
            renewal_price: 29,
            trial_period_days: 14,
          }),
        })
      )
    })
  })

  describe('unwrapWhopWebhook', () => {
    it('verifies webhook signatures via the SDK', () => {
      const event = unwrapWhopWebhook('payload', { 'webhook-id': 'msg_1' })
      expect(whop.webhooks.unwrap).toHaveBeenCalled()
      expect(event.type).toBe('test.event')
    })
  })
})
