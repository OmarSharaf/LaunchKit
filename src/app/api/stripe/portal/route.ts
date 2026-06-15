import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createBillingPortalSession } from '@/lib/stripe'
import { requireAuthApi, requireOrgRole } from '@/lib/auth'
import { AuthError, ForbiddenError } from '@/lib/errors'
import { createAuditLog } from '@/lib/audit'
import { logger } from '@/lib/logger'

const schema = z.object({
  organizationId: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuthApi()
    const body = await request.json()
    const { organizationId } = schema.parse(body)

    const membership = await requireOrgRole(organizationId, user.id)

    if (!membership.organization.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No billing account found. Subscribe to a plan first.' },
        { status: 400 }
      )
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL!
    const session = await createBillingPortalSession({
      customerId: membership.organization.stripeCustomerId,
      returnUrl: `${appUrl}/dashboard/billing`,
    })

    await createAuditLog({
      action: 'billing.portal_opened',
      entity: 'subscription',
      userId: user.id,
      organizationId,
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
    logger.error('Billing portal error', {
      message: err instanceof Error ? err.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Failed to create billing portal session' },
      { status: 500 }
    )
  }
}
