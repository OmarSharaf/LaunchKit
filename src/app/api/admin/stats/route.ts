import { NextResponse } from 'next/server'
import { handleAdminError, requireAdminApi } from '@/lib/admin-api'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    await requireAdminApi()

    const [
      organizations,
      users,
      activeSubscriptions,
      auditLogs,
      recentSignups,
    ] = await Promise.all([
      prisma.organization.count(),
      prisma.user.count(),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
      prisma.auditLog.count(),
      prisma.user.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ])

    return NextResponse.json({
      organizations,
      users,
      activeSubscriptions,
      auditLogEntries: auditLogs,
      signupsLast7Days: recentSignups,
    })
  } catch (err) {
    const handled = handleAdminError(err)
    if (handled) return handled

    logger.error('Admin stats failed', {
      message: err instanceof Error ? err.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Failed to fetch admin stats' },
      { status: 500 }
    )
  }
}
