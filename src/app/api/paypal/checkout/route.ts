import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createPayPalSubscription, isPayPalEnabled } from '@/lib/paypal'
import { prisma } from '@/lib/prisma'
import { requireAuthApi, requireOrgRole } from '@/lib/auth'
import { AuthError, ForbiddenError } from '@/lib/errors'
import { logger } from '@/lib/logger'

const schema = z.object({
  planId: z.string().min(1),
  organizationId: z.string().min(1),
})

export async function POST(request: NextRequest) {
  if (!isPayPalEnabled()) {
    return NextResponse.json(
      { error: 'PayPal payments are not configured' },
      { status: 503 }
    )
  }

  try {
    const user = await requireAuthApi()
    const body = await request.json()
    const { planId, organizationId } = schema.parse(body)

    await requireOrgRole(organizationId, user.id)

    const plan = await prisma.plan.findFirst({
      where: { id: planId, isActive: true },
    })

    if (!plan?.paypalPlanId) {
      return NextResponse.json(
        { error: 'PayPal plan not configured for this tier' },
        { status: 404 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!
    const session = await createPayPalSubscription({
      paypalPlanId: plan.paypalPlanId,
      organizationId,
      planId: plan.id,
      successUrl: `${appUrl}/dashboard/billing?success=true`,
      cancelUrl: `${appUrl}/dashboard/billing?canceled=true`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: err.message }, { status: 403 })
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    logger.error('PayPal checkout failed', {
      message: err instanceof Error ? err.message : 'Unknown error',
    })
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
  }
}
