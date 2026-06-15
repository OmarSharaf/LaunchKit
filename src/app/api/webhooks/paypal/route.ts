import { type NextRequest, NextResponse } from 'next/server'
import {
  decodePayPalCustomId,
  getPayPalPeriodDates,
  mapPayPalSubscriptionStatus,
  type PayPalSubscriptionResource,
  verifyPayPalWebhook,
} from '@/lib/paypal'
import { prisma } from '@/lib/prisma'
import { WebhookError } from '@/lib/errors'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headers = Object.fromEntries(request.headers.entries())

  let event

  try {
    event = await verifyPayPalWebhook(headers, body)
  } catch (err) {
    logger.error('PayPal webhook verification failed', {
      message: err instanceof Error ? err.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 }
    )
  }

  logger.info('PayPal webhook received', { type: event.event_type })

  try {
    const existing = await prisma.paypalWebhookEvent.findUnique({
      where: { id: event.id },
    })

    if (existing) {
      logger.info('Duplicate PayPal webhook skipped', { id: event.id })
      return NextResponse.json({ received: true })
    }

    switch (event.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
      case 'BILLING.SUBSCRIPTION.UPDATED':
        await syncPayPalSubscription(event.resource)
        break
      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.EXPIRED':
        await handlePayPalSubscriptionCanceled(event.resource)
        break
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        await handlePayPalSubscriptionSuspended(event.resource)
        break
      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
        await handlePayPalPaymentFailed(event.resource)
        break
      default:
        logger.info('Unhandled PayPal event type', { type: event.event_type })
    }

    await prisma.paypalWebhookEvent.create({
      data: { id: event.id, type: event.event_type },
    })
  } catch (err) {
    logger.error('PayPal webhook handler failed', {
      type: event.event_type,
      message: err instanceof Error ? err.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }

  return NextResponse.json({ received: true })
}

async function resolveInternalPlan(resource: PayPalSubscriptionResource) {
  const { planId } = decodePayPalCustomId(resource.custom_id)

  if (planId) {
    const plan = await prisma.plan.findUnique({ where: { id: planId } })
    if (plan) return plan
  }

  return prisma.plan.findFirst({
    where: { paypalPlanId: resource.plan_id },
  })
}

async function syncPayPalSubscription(resource: PayPalSubscriptionResource) {
  const { organizationId } = decodePayPalCustomId(resource.custom_id)

  if (!organizationId) {
    throw new WebhookError(
      'Missing organizationId in PayPal subscription custom_id'
    )
  }

  const plan = await resolveInternalPlan(resource)
  if (!plan) {
    throw new WebhookError(`No plan found for PayPal plan: ${resource.plan_id}`)
  }

  const { currentPeriodStart, currentPeriodEnd, trialEnd } =
    getPayPalPeriodDates(resource)

  await prisma.subscription.upsert({
    where: { organizationId },
    create: {
      organizationId,
      planId: plan.id,
      paymentProvider: 'PAYPAL',
      paypalSubscriptionId: resource.id,
      status: mapPayPalSubscriptionStatus(resource.status),
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
      trialEnd,
    },
    update: {
      planId: plan.id,
      paymentProvider: 'PAYPAL',
      paypalSubscriptionId: resource.id,
      status: mapPayPalSubscriptionStatus(resource.status),
      currentPeriodStart,
      currentPeriodEnd,
      trialEnd,
    },
  })

  if (resource.subscriber?.payer_id) {
    await prisma.organization.update({
      where: { id: organizationId },
      data: { paypalPayerId: resource.subscriber.payer_id },
    })
  }

  logger.info('PayPal subscription synced', {
    organizationId,
    subscriptionId: resource.id,
  })
}

async function handlePayPalSubscriptionCanceled(
  resource: PayPalSubscriptionResource
) {
  await prisma.subscription.update({
    where: { paypalSubscriptionId: resource.id },
    data: {
      status: 'CANCELED',
      cancelAtPeriodEnd: false,
    },
  })
  logger.info('PayPal subscription canceled', { subscriptionId: resource.id })
}

async function handlePayPalSubscriptionSuspended(
  resource: PayPalSubscriptionResource
) {
  await prisma.subscription.update({
    where: { paypalSubscriptionId: resource.id },
    data: { status: 'PAST_DUE' },
  })
  logger.warn('PayPal subscription suspended', {
    subscriptionId: resource.id,
  })
}

async function handlePayPalPaymentFailed(resource: PayPalSubscriptionResource) {
  await prisma.subscription.update({
    where: { paypalSubscriptionId: resource.id },
    data: { status: 'PAST_DUE' },
  })
  logger.warn('PayPal subscription payment failed', {
    subscriptionId: resource.id,
  })
}
