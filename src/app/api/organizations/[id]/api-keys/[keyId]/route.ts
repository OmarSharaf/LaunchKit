import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuthApi, requireOrgRole } from '@/lib/auth'
import { AuthError, ForbiddenError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { logger } from '@/lib/logger'

const paramsSchema = z.object({
  id: z.string().min(1),
  keyId: z.string().min(1),
})

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string; keyId: string }> }
) {
  if (!isFeatureEnabled('API_KEYS')) {
    return NextResponse.json({ error: 'Feature disabled' }, { status: 404 })
  }

  try {
    const user = await requireAuthApi()
    const { id: organizationId, keyId } = paramsSchema.parse(
      await context.params
    )

    await requireOrgRole(organizationId, user.id)

    const existing = await prisma.apiKey.findFirst({
      where: { id: keyId, organizationId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await prisma.apiKey.delete({ where: { id: keyId } })

    await createAuditLog({
      action: 'api_key.revoked',
      entity: 'api_key',
      entityId: keyId,
      userId: user.id,
      organizationId,
      metadata: { name: existing.name, prefix: existing.prefix },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors }, { status: 400 })
    }
    logger.error('Delete API key failed', {
      message: err instanceof Error ? err.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Failed to delete API key' },
      { status: 500 }
    )
  }
}
