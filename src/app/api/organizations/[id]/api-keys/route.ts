import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireAuthApi, requireOrgRole } from '@/lib/auth'
import { AuthError, ForbiddenError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { generateApiKey } from '@/lib/api-keys'
import { createAuditLog } from '@/lib/audit'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { logger } from '@/lib/logger'

const paramsSchema = z.object({ id: z.string().min(1) })
const createSchema = z.object({
  name: z.string().min(1).max(100),
})

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!isFeatureEnabled('API_KEYS')) {
    return NextResponse.json({ error: 'Feature disabled' }, { status: 404 })
  }

  try {
    const user = await requireAuthApi()
    const { id: organizationId } = paramsSchema.parse(await context.params)

    await requireOrgRole(organizationId, user.id)

    const keys = await prisma.apiKey.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        prefix: true,
        lastUsedAt: true,
        expiresAt: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ keys })
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
    logger.error('List API keys failed', {
      message: err instanceof Error ? err.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Failed to list API keys' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!isFeatureEnabled('API_KEYS')) {
    return NextResponse.json({ error: 'Feature disabled' }, { status: 404 })
  }

  try {
    const user = await requireAuthApi()
    const { id: organizationId } = paramsSchema.parse(await context.params)
    const body = await request.json()
    const input = createSchema.parse(body)

    await requireOrgRole(organizationId, user.id)

    const { rawKey, keyHash, prefix } = generateApiKey()

    const apiKey = await prisma.apiKey.create({
      data: {
        name: input.name,
        keyHash,
        prefix,
        organizationId,
        createdById: user.id,
      },
      select: {
        id: true,
        name: true,
        prefix: true,
        createdAt: true,
      },
    })

    await createAuditLog({
      action: 'api_key.created',
      entity: 'api_key',
      entityId: apiKey.id,
      userId: user.id,
      organizationId,
      metadata: { name: input.name, prefix },
    })

    return NextResponse.json(
      { apiKey: { ...apiKey, key: rawKey } },
      { status: 201 }
    )
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
    logger.error('Create API key failed', {
      message: err instanceof Error ? err.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Failed to create API key' },
      { status: 500 }
    )
  }
}
