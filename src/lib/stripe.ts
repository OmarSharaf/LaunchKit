import Stripe from 'stripe'

// server-only Stripe SDK
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
})

export async function createCheckoutSession({
  priceId,
  customerId,
  organizationId,
  successUrl,
  cancelUrl,
  trialDays,
}: {
  priceId: string
  customerId?: string
  organizationId: string
  successUrl: string
  cancelUrl: string
  trialDays?: number
}) {
  return stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    subscription_data: {
      trial_period_days: trialDays,
      metadata: { organizationId },
    },
    metadata: { organizationId },
  })
}

export async function createBillingPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string
  returnUrl: string
}) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

export async function getOrCreateStripeCustomer({
  organizationId,
  organizationName,
  email,
  existingCustomerId,
}: {
  organizationId: string
  organizationName: string
  email: string
  existingCustomerId?: string | null
}) {
  if (existingCustomerId) {
    return stripe.customers.retrieve(existingCustomerId)
  }

  return stripe.customers.create({
    email,
    name: organizationName,
    metadata: { organizationId },
  })
}

export function constructStripeEvent(
  payload: string | Buffer,
  signature: string
) {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  )
}

export function formatPrice(
  amount: number,
  currency = 'usd',
  locale = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: amount % 100 === 0 ? 0 : 2,
  }).format(amount / 100)
}
