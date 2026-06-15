import { type NextRequest, NextResponse } from 'next/server'
import type { SubscriptionStatus } from '@prisma/client'
import type Stripe from 'stripe'
import { constructStripeEvent } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { WebhookError } from '@/lib/errors'
import { createAuditLog } from '@/lib/audit'
import { logger } from '@/lib/logger'

const STRIPE_TO_SUBSCRIPTION_STATUS: Record<
  Stripe.Subscription.Status,
  SubscriptionStatus
> = {
  active: 'ACTIVE',
  canceled: 'CANCELED',
  incomplete: 'INCOMPLETE',
  incomplete_expired: 'INCOMPLETE_EXPIRED',
  past_due: 'PAST_DUE',
  paused: 'PAUSED',
  trialing: 'TRIALING',
  unpaid: 'UNPAID',
}

function mapStripeSubscriptionStatus(
  status: Stripe.Subscription.Status
): SubscriptionStatus {
  return STRIPE_TO_SUBSCRIPTION_STATUS[status]
}

async function isEventProcessed(eventId: string): Promise<boolean> {
  // Stripe retries — don't double-apply subscription updates
  const existing = await prisma.stripeWebhookEvent.findUnique({
    where: { id: eventId },
  })
  return Boolean(existing)
}

async function markEventProcessed(event: Stripe.Event) {
  await prisma.stripeWebhookEvent.create({
    data: { id: event.id, type: event.type },
  })
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = constructStripeEvent(body, signature)
  } catch (err) {
    logger.error('Webhook signature verification failed', {
      message: err instanceof Error ? err.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 }
    )
  }

  if (await isEventProcessed(event.id)) {
    logger.info('Stripe webhook duplicate skipped', { id: event.id })
    return NextResponse.json({ received: true, duplicate: true })
  }

  logger.info('Stripe webhook received', { type: event.type })

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(
          event.data.object as Stripe.Checkout.Session
        )
        break
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(
          event.data.object as Stripe.Subscription
        )
        break
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(
          event.data.object as Stripe.Subscription
        )
        break
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break
      default:
        logger.info('Unhandled Stripe event type', { type: event.type })
    }

    await markEventProcessed(event)
  } catch (err) {
    logger.error('Webhook handler failed', {
      type: event.type,
      message: err instanceof Error ? err.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true })
}

async function handleCheckoutSessionCompleted(
  session: Stripe.Checkout.Session
) {
  if (session.mode !== 'subscription') return

  const organizationId = session.metadata?.organizationId
  if (!organizationId) {
    throw new WebhookError(
      'Missing organizationId in checkout session metadata'
    )
  }

  const subscription = await import('@/lib/stripe').then(({ stripe }) =>
    stripe.subscriptions.retrieve(session.subscription as string, {
      expand: ['items.data.price.product'],
    })
  )

  const priceId = subscription.items.data[0].price.id

  const plan = await prisma.plan.findFirst({
    where: {
      OR: [{ stripePriceIdMonth: priceId }, { stripePriceIdYear: priceId }],
    },
  })

  if (!plan) {
    throw new WebhookError(`No plan found for Stripe price: ${priceId}`)
  }

  await prisma.subscription.upsert({
    where: { organizationId },
    create: {
      organizationId,
      planId: plan.id,
      paymentProvider: 'STRIPE',
      stripeSubscriptionId: subscription.id,
      status: mapStripeSubscriptionStatus(subscription.status),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
    },
    update: {
      planId: plan.id,
      paymentProvider: 'STRIPE',
      stripeSubscriptionId: subscription.id,
      status: mapStripeSubscriptionStatus(subscription.status),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
    },
  })

  await createAuditLog({
    action: 'billing.subscription_created',
    entity: 'subscription',
    entityId: subscription.id,
    organizationId,
    metadata: { planId: plan.id, status: subscription.status },
  })

  logger.info('Subscription synced from checkout', { organizationId })
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const updated = await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: mapStripeSubscriptionStatus(subscription.status),
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
      trialEnd: subscription.trial_end
        ? new Date(subscription.trial_end * 1000)
        : null,
    },
  })

  await createAuditLog({
    action: 'billing.subscription_updated',
    entity: 'subscription',
    entityId: subscription.id,
    organizationId: updated.organizationId,
    metadata: { status: subscription.status },
  })

  logger.info('Subscription updated', { subscriptionId: subscription.id })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const updated = await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: 'CANCELED',
      cancelAtPeriodEnd: false,
    },
  })

  await createAuditLog({
    action: 'billing.subscription_canceled',
    entity: 'subscription',
    entityId: subscription.id,
    organizationId: updated.organizationId,
  })

  logger.info('Subscription canceled', { subscriptionId: subscription.id })
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  if (!invoice.subscription) return

  const updated = await prisma.subscription.update({
    where: { stripeSubscriptionId: invoice.subscription as string },
    data: { status: 'PAST_DUE' },
  })

  await createAuditLog({
    action: 'billing.payment_failed',
    entity: 'subscription',
    entityId: String(invoice.subscription),
    organizationId: updated.organizationId,
  })

  logger.warn('Subscription payment failed', {
    subscriptionId: String(invoice.subscription),
  })
}
