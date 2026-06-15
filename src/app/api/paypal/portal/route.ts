import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getPayPalManageUrl, isPayPalEnabled } from '@/lib/paypal'
import { requireAuthApi, requireOrgRole } from '@/lib/auth'
import { AuthError, ForbiddenError } from '@/lib/errors'

const schema = z.object({
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
    const { organizationId } = schema.parse(body)

    const membership = await requireOrgRole(organizationId, user.id)

    if (
      !membership.organization.subscription?.paypalSubscriptionId ||
      membership.organization.subscription.paymentProvider !== 'PAYPAL'
    ) {
      return NextResponse.json(
        { error: 'No PayPal subscription found for this organization' },
        { status: 404 }
      )
    }

    return NextResponse.json({ url: getPayPalManageUrl() })
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

    return NextResponse.json(
      { error: 'Could not open billing portal' },
      { status: 500 }
    )
  }
}
