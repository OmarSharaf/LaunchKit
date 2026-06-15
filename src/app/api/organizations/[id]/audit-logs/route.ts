import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuthApi, requireOrgMember } from '@/lib/auth'
import { AuthError, ForbiddenError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { logger } from '@/lib/logger'

const paramsSchema = z.object({ id: z.string().min(1) })

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!isFeatureEnabled('AUDIT_LOG')) {
    return NextResponse.json({ error: 'Feature disabled' }, { status: 404 })
  }

  try {
    const user = await requireAuthApi()
    const { id: organizationId } = paramsSchema.parse(await context.params)

    await requireOrgMember(organizationId, user.id)

    const logs = await prisma.auditLog.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({ logs })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 })
    }
    logger.error('Fetch audit logs failed', {
      message: err instanceof Error ? err.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}
