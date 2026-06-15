import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createCheckoutSession, getOrCreateStripeCustomer } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { requireAuthApi, requireOrgRole } from '@/lib/auth'
import { AuthError, ForbiddenError } from '@/lib/errors'
import { createAuditLog } from '@/lib/audit'
import { logger } from '@/lib/logger'

const schema = z.object({
  priceId: z.string().min(1),
  organizationId: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthApi()
    const body = await request.json()
    const { priceId, organizationId } = schema.parse(body)

    const membership = await requireOrgRole(organizationId, user.id)

    const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
    const customer = await getOrCreateStripeCustomer({
      organizationId,
      organizationName: membership.organization.name,
      email: dbUser?.email ?? user.email!,
      existingCustomerId: membership.organization.stripeCustomerId,
    })

    if (!membership.organization.stripeCustomerId) {
      await prisma.organization.update({
        where: { id: organizationId },
        data: { stripeCustomerId: customer.id },
      })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!
    const session = await createCheckoutSession({
      priceId,
      customerId: customer.id,
      organizationId,
      successUrl: `${appUrl}/dashboard/billing?success=true`,
      cancelUrl: `${appUrl}/dashboard/billing?canceled=true`,
      trialDays: 14,
    })

    await createAuditLog({
      action: 'billing.checkout_started',
      entity: 'subscription',
      userId: user.id,
      organizationId,
      metadata: { priceId },
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 })
    }
    logger.error('Checkout session error', {
      message: err instanceof Error ? err.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
