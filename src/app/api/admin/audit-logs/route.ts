import { type NextRequest, NextResponse } from 'next/server'
import { handleAdminError, requireAdminApi } from '@/lib/admin-api'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { adminListQuerySchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    await requireAdminApi()

    const { searchParams } = new URL(request.url)
    const { page, limit } = adminListQuerySchema.parse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    })

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { email: true, name: true } },
          organization: { select: { name: true } },
        },
      }),
      prisma.auditLog.count(),
    ])

    return NextResponse.json({
      logs: logs.map((log) => ({
        id: log.id,
        action: log.action,
        entity: log.entity,
        entityId: log.entityId,
        metadata: log.metadata,
        userEmail: log.user?.email ?? null,
        organizationName: log.organization?.name ?? null,
        createdAt: log.createdAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (err) {
    const handled = handleAdminError(err)
    if (handled) return handled

    logger.error('Admin audit logs failed', {
      message: err instanceof Error ? err.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}
