import { type NextRequest, NextResponse } from 'next/server'
import type { Membership } from '@whop/sdk/resources/shared.js'
import { mapWhopMembershipStatus, unwrapWhopWebhook } from '@/lib/whop'
import { prisma } from '@/lib/prisma'
import { WebhookError } from '@/lib/errors'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const headers = Object.fromEntries(request.headers.entries())

  let event

  try {
    event = unwrapWhopWebhook(body, headers)
  } catch (err) {
    logger.error('Whop webhook signature verification failed', {
      message: err instanceof Error ? err.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 }
    )
  }

  logger.info('Whop webhook received', { type: event.type })

  try {
    const existing = await prisma.whopWebhookEvent.findUnique({
      where: { id: event.id },
    })

    if (existing) {
      logger.info('Duplicate Whop webhook skipped', { id: event.id })
      return NextResponse.json({ received: true })
    }

    switch (event.type) {
      case 'membership.activated':
        await handleMembershipActivated(event.data)
        break
      case 'membership.deactivated':
        await handleMembershipDeactivated(event.data)
        break
      case 'membership.cancel_at_period_end_changed':
        await handleMembershipCancelAtPeriodEndChanged(event.data)
        break
      case 'payment.failed':
        await handlePaymentFailed(event.data)
        break
      default:
        logger.info('Unhandled Whop event type', { type: event.type })
    }

    await prisma.whopWebhookEvent.create({
      data: { id: event.id, type: event.type },
    })
  } catch (err) {
    logger.error('Whop webhook handler failed', {
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

async function resolveInternalPlan(membership: Membership) {
  const metadataPlanId =
    typeof membership.metadata?.planId === 'string'
      ? membership.metadata.planId
      : null

  if (metadataPlanId) {
    const plan = await prisma.plan.findUnique({ where: { id: metadataPlanId } })
    if (plan) return plan
  }

  return prisma.plan.findFirst({
    where: { whopPlanId: membership.plan.id },
  })
}

function parseWhopTimestamp(value: string | null | undefined): Date | null {
  if (!value) return null
  const numeric = Number(value)
  if (!Number.isNaN(numeric) && numeric > 0) {
    return new Date(numeric * 1000)
  }
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

async function syncWhopMembership(membership: Membership) {
  const organizationId =
    typeof membership.metadata?.organizationId === 'string'
      ? membership.metadata.organizationId
      : null

  if (!organizationId) {
    throw new WebhookError('Missing organizationId in Whop membership metadata')
  }

  const plan = await resolveInternalPlan(membership)
  if (!plan) {
    throw new WebhookError(`No plan found for Whop plan: ${membership.plan.id}`)
  }

  const periodStart = parseWhopTimestamp(membership.renewal_period_start)
  const periodEnd = parseWhopTimestamp(membership.renewal_period_end)
  const now = new Date()

  await prisma.subscription.upsert({
    where: { organizationId },
    create: {
      organizationId,
      planId: plan.id,
      paymentProvider: 'WHOP',
      whopMembershipId: membership.id,
      status: mapWhopMembershipStatus(membership.status),
      currentPeriodStart: periodStart ?? now,
      currentPeriodEnd: periodEnd ?? now,
      cancelAtPeriodEnd: membership.cancel_at_period_end,
      trialEnd: membership.status === 'trialing' ? (periodEnd ?? null) : null,
    },
    update: {
      planId: plan.id,
      paymentProvider: 'WHOP',
      whopMembershipId: membership.id,
      status: mapWhopMembershipStatus(membership.status),
      currentPeriodStart: periodStart ?? undefined,
      currentPeriodEnd: periodEnd ?? undefined,
      cancelAtPeriodEnd: membership.cancel_at_period_end,
      trialEnd: membership.status === 'trialing' ? (periodEnd ?? null) : null,
    },
  })

  if (membership.member?.id) {
    await prisma.organization.update({
      where: { id: organizationId },
      data: { whopMemberId: membership.member.id },
    })
  }

  logger.info('Whop membership synced', {
    organizationId,
    membershipId: membership.id,
  })
}

async function handleMembershipActivated(membership: Membership) {
  await syncWhopMembership(membership)
}

async function handleMembershipDeactivated(membership: Membership) {
  await prisma.subscription.update({
    where: { whopMembershipId: membership.id },
    data: {
      status: 'CANCELED',
      cancelAtPeriodEnd: false,
    },
  })
  logger.info('Whop membership deactivated', { membershipId: membership.id })
}

async function handleMembershipCancelAtPeriodEndChanged(
  membership: Membership
) {
  await prisma.subscription.update({
    where: { whopMembershipId: membership.id },
    data: { cancelAtPeriodEnd: membership.cancel_at_period_end },
  })
  logger.info('Whop cancel-at-period-end updated', {
    membershipId: membership.id,
  })
}

async function handlePaymentFailed(payment: {
  membership?: { id: string } | null
}) {
  const membershipId = payment.membership?.id
  if (!membershipId) return

  await prisma.subscription.update({
    where: { whopMembershipId: membershipId },
    data: { status: 'PAST_DUE' },
  })
  logger.warn('Whop payment failed', { membershipId })
}
