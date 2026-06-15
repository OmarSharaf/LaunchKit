import { randomUUID } from 'crypto'
import type { SubscriptionStatus } from '@prisma/client'

// PayPal subscriptions REST API (plain fetch, no SDK)

export type PayPalSubscriptionStatus =
  | 'APPROVAL_PENDING'
  | 'APPROVED'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'CANCELLED'
  | 'EXPIRED'

export interface PayPalSubscriptionResource {
  id: string
  plan_id: string
  status: PayPalSubscriptionStatus
  custom_id?: string | null
  start_time?: string | null
  billing_info?: {
    next_billing_time?: string | null
    last_payment?: { time?: string | null } | null
    cycle_executions?: Array<{
      tenure_type?: string
      cycles_completed?: number
    }>
  } | null
  subscriber?: {
    payer_id?: string | null
    email_address?: string | null
  } | null
}

export interface PayPalWebhookEvent {
  id: string
  event_type: string
  resource: PayPalSubscriptionResource
}

let cachedAccessToken: { token: string; expiresAt: number } | null = null

// tests reset this between cases
export function resetPayPalAccessTokenCache() {
  cachedAccessToken = null
}

export function isPayPalEnabled(): boolean {
  return Boolean(
    process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET
  )
}

export function getPayPalApiBaseUrl(): string {
  if (process.env.PAYPAL_API_BASE_URL) {
    return process.env.PAYPAL_API_BASE_URL.replace(/\/$/, '')
  }

  return process.env.PAYPAL_MODE === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
}

export function getPayPalManageUrl(): string {
  if (process.env.PAYPAL_MANAGE_URL) {
    return process.env.PAYPAL_MANAGE_URL
  }

  return process.env.PAYPAL_MODE === 'live'
    ? 'https://www.paypal.com/myaccount/autopay/'
    : 'https://www.sandbox.paypal.com/myaccount/autopay/'
}

const PAYPAL_TO_SUBSCRIPTION_STATUS: Record<
  PayPalSubscriptionStatus,
  SubscriptionStatus
> = {
  APPROVAL_PENDING: 'INCOMPLETE',
  APPROVED: 'INCOMPLETE',
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'PAST_DUE',
  CANCELLED: 'CANCELED',
  EXPIRED: 'CANCELED',
}

export function mapPayPalSubscriptionStatus(
  status: PayPalSubscriptionStatus
): SubscriptionStatus {
  return PAYPAL_TO_SUBSCRIPTION_STATUS[status]
}

export function encodePayPalCustomId(
  organizationId: string,
  planId: string
): string {
  return `${organizationId}|${planId}`
}

export function decodePayPalCustomId(customId: string | null | undefined): {
  organizationId: string | null
  planId: string | null
} {
  if (!customId) {
    return { organizationId: null, planId: null }
  }

  const [organizationId, planId] = customId.split('|')
  return {
    organizationId: organizationId || null,
    planId: planId || null,
  }
}

export async function getPayPalAccessToken(): Promise<string> {
  const now = Date.now()
  if (cachedAccessToken && cachedAccessToken.expiresAt > now + 60_000) {
    return cachedAccessToken.token
  }

  const clientId = process.env.PAYPAL_CLIENT_ID!
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET!
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    'base64'
  )

  const response = await fetch(`${getPayPalApiBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    throw new Error('Failed to obtain PayPal access token')
  }

  const data = (await response.json()) as {
    access_token: string
    expires_in: number
  }

  cachedAccessToken = {
    token: data.access_token,
    expiresAt: now + data.expires_in * 1000,
  }

  return data.access_token
}

export async function createPayPalSubscription({
  paypalPlanId,
  organizationId,
  planId,
  successUrl,
  cancelUrl,
}: {
  paypalPlanId: string
  organizationId: string
  planId: string
  successUrl: string
  cancelUrl: string
}) {
  const accessToken = await getPayPalAccessToken()

  const response = await fetch(
    `${getPayPalApiBaseUrl()}/v1/billing/subscriptions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': randomUUID(),
      },
      body: JSON.stringify({
        plan_id: paypalPlanId,
        custom_id: encodePayPalCustomId(organizationId, planId),
        application_context: {
          brand_name: process.env.NEXT_PUBLIC_APP_NAME ?? 'Launch Kit',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'SUBSCRIBE_NOW',
          return_url: successUrl,
          cancel_url: cancelUrl,
        },
      }),
    }
  )

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`PayPal subscription creation failed: ${errorBody}`)
  }

  const subscription = (await response.json()) as {
    id: string
    links?: Array<{ rel: string; href: string }>
  }

  const approveLink = subscription.links?.find((link) => link.rel === 'approve')

  if (!approveLink?.href) {
    throw new Error('PayPal approval URL missing from subscription response')
  }

  return {
    url: approveLink.href,
    subscriptionId: subscription.id,
  }
}

export async function retrievePayPalSubscription(
  subscriptionId: string
): Promise<PayPalSubscriptionResource> {
  const accessToken = await getPayPalAccessToken()

  const response = await fetch(
    `${getPayPalApiBaseUrl()}/v1/billing/subscriptions/${subscriptionId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to retrieve PayPal subscription')
  }

  return response.json() as Promise<PayPalSubscriptionResource>
}

export async function verifyPayPalWebhook(
  headers: Record<string, string>,
  body: string
): Promise<PayPalWebhookEvent> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID
  const event = JSON.parse(body) as PayPalWebhookEvent

  if (!webhookId) {
    return event
  }

  const accessToken = await getPayPalAccessToken()
  const response = await fetch(
    `${getPayPalApiBaseUrl()}/v1/notifications/verify-webhook-signature`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: webhookId,
        webhook_event: event,
      }),
    }
  )

  if (!response.ok) {
    throw new Error('PayPal webhook verification request failed')
  }

  const verification = (await response.json()) as {
    verification_status: string
  }

  if (verification.verification_status !== 'SUCCESS') {
    throw new Error('Invalid PayPal webhook signature')
  }

  return event
}

export function getPayPalPeriodDates(resource: PayPalSubscriptionResource): {
  currentPeriodStart: Date
  currentPeriodEnd: Date
  trialEnd: Date | null
} {
  const now = new Date()
  const periodEnd = resource.billing_info?.next_billing_time
    ? new Date(resource.billing_info.next_billing_time)
    : now
  const periodStart = resource.billing_info?.last_payment?.time
    ? new Date(resource.billing_info.last_payment.time)
    : resource.start_time
      ? new Date(resource.start_time)
      : now

  const hasTrialCycle = resource.billing_info?.cycle_executions?.some(
    (cycle) => cycle.tenure_type === 'TRIAL'
  )

  return {
    currentPeriodStart: periodStart,
    currentPeriodEnd: periodEnd,
    trialEnd: hasTrialCycle ? periodEnd : null,
  }
}
