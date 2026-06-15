import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { isWhopEnabled, whop } from '@/lib/whop'
import { requireAuthApi, requireOrgRole } from '@/lib/auth'
import { AuthError, ForbiddenError } from '@/lib/errors'
import { logger } from '@/lib/logger'

const schema = z.object({
  organizationId: z.string().min(1),
})

export async function POST(request: NextRequest) {
  if (!isWhopEnabled()) {
    return NextResponse.json(
      { error: 'Whop payments are not configured' },
      { status: 503 }
    )
  }

  try {
    const user = await requireAuthApi()
    const body = await request.json()
    const { organizationId } = schema.parse(body)

    const membership = await requireOrgRole(organizationId, user.id)

    const whopMembershipId =
      membership.organization.subscription?.whopMembershipId

    if (!whopMembershipId) {
      return NextResponse.json(
        { error: 'No Whop subscription found for this organization' },
        { status: 404 }
      )
    }

    const whopMembership = await whop.memberships.retrieve(whopMembershipId)

    if (!whopMembership.manage_url) {
      return NextResponse.json(
        { error: 'Whop billing portal is unavailable' },
        { status: 404 }
      )
    }

    return NextResponse.json({ url: whopMembership.manage_url })
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

    logger.error('Whop portal failed', {
      message: err instanceof Error ? err.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Could not open billing portal' },
      { status: 500 }
    )
  }
}
