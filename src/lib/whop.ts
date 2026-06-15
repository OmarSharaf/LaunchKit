import Whop from '@whop/sdk'
import type { MembershipStatus } from '@whop/sdk/resources/shared.js'
import type { SubscriptionStatus } from '@prisma/client'

// server-only Whop SDK — lazy init so builds work without WHOP_* env vars
let whopClient: Whop | null = null

function getWebhookKey(): string | undefined {
  const secret = process.env.WHOP_WEBHOOK_SECRET
  if (!secret) return undefined
  return Buffer.from(secret).toString('base64')
}

export function getWhopClient(): Whop {
  if (!whopClient) {
    const apiKey = process.env.WHOP_API_KEY
    if (!apiKey) {
      throw new Error('WHOP_API_KEY is not configured')
    }
    whopClient = new Whop({
      apiKey,
      webhookKey: getWebhookKey(),
      baseURL: process.env.WHOP_API_BASE_URL,
    })
  }
  return whopClient
}

export function resetWhopClient() {
  whopClient = null
}

export function isWhopEnabled(): boolean {
  return Boolean(process.env.WHOP_API_KEY && process.env.WHOP_COMPANY_ID)
}

const WHOP_TO_SUBSCRIPTION_STATUS: Record<
  MembershipStatus,
  SubscriptionStatus
> = {
  trialing: 'TRIALING',
  active: 'ACTIVE',
  past_due: 'PAST_DUE',
  canceled: 'CANCELED',
  expired: 'CANCELED',
  completed: 'CANCELED',
  unresolved: 'INCOMPLETE',
  drafted: 'INCOMPLETE',
  canceling: 'ACTIVE',
}

export function mapWhopMembershipStatus(
  status: MembershipStatus
): SubscriptionStatus {
  return WHOP_TO_SUBSCRIPTION_STATUS[status]
}

export function resolveWhopCheckoutUrl(purchaseUrl: string): string {
  if (purchaseUrl.startsWith('http://') || purchaseUrl.startsWith('https://')) {
    return purchaseUrl
  }

  const base =
    process.env.WHOP_CHECKOUT_BASE_URL?.replace(/\/$/, '') ?? 'https://whop.com'
  return `${base}${purchaseUrl.startsWith('/') ? purchaseUrl : `/${purchaseUrl}`}`
}

export async function createWhopCheckout({
  organizationId,
  planId,
  whopPlanId,
  planName,
  amountCents,
  successUrl,
  cancelUrl,
}: {
  organizationId: string
  planId: string
  whopPlanId?: string | null
  planName: string
  amountCents: number
  successUrl: string
  cancelUrl: string
}) {
  const whop = getWhopClient()
  const companyId = process.env.WHOP_COMPANY_ID!
  const metadata = { organizationId, planId }

  const checkoutConfig = whopPlanId
    ? await whop.checkoutConfigurations.create({
        plan_id: whopPlanId,
        metadata,
        redirect_url: successUrl,
        source_url: cancelUrl,
        allow_promo_codes: true,
      })
    : await whop.checkoutConfigurations.create({
        // fallback when seed didn't set whopPlanId — needs WHOP_PRODUCT_ID
        plan: {
          company_id: companyId,
          currency: 'usd',
          title: planName,
          plan_type: 'renewal',
          renewal_price: amountCents / 100,
          billing_period: 30,
          trial_period_days: 14,
          product_id: process.env.WHOP_PRODUCT_ID ?? undefined,
        },
        metadata,
        redirect_url: successUrl,
        source_url: cancelUrl,
        allow_promo_codes: true,
      })

  return {
    url: resolveWhopCheckoutUrl(checkoutConfig.purchase_url),
    sessionId: checkoutConfig.id,
  }
}

export function unwrapWhopWebhook(
  payload: string,
  headers: Record<string, string>
) {
  return getWhopClient().webhooks.unwrap(payload, { headers })
}
