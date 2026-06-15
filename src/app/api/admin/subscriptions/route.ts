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

    const statusFilter = searchParams.get('status')

    const where = statusFilter
      ? { status: statusFilter as 'ACTIVE' | 'CANCELED' | 'PAST_DUE' }
      : {}

    const [subscriptions, total, mrrAgg] = await Promise.all([
      prisma.subscription.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          plan: { select: { name: true, amount: true } },
          organization: {
            select: {
              id: true,
              name: true,
              slug: true,
              _count: { select: { members: true } },
            },
          },
        },
      }),
      prisma.subscription.count({ where }),
      prisma.subscription.findMany({
        where: { status: 'ACTIVE' },
        include: { plan: { select: { amount: true } } },
      }),
    ])

    const mrrCents = mrrAgg.reduce(
      (sum, sub) => sum + (sub.plan?.amount ?? 0),
      0
    )

    return NextResponse.json({
      summary: {
        mrrCents,
        mrrFormatted: `$${(mrrCents / 100).toFixed(2)}`,
        activeCount: mrrAgg.length,
      },
      subscriptions: subscriptions.map((sub) => ({
        id: sub.id,
        status: sub.status,
        paymentProvider: sub.paymentProvider,
        cancelAtPeriodEnd: sub.cancelAtPeriodEnd,
        currentPeriodEnd: sub.currentPeriodEnd.toISOString(),
        planName: sub.plan.name,
        planAmount: sub.plan.amount,
        organization: {
          id: sub.organization.id,
          name: sub.organization.name,
          slug: sub.organization.slug,
          memberCount: sub.organization._count.members,
        },
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

    logger.error('Admin list subscriptions failed', {
      message: err instanceof Error ? err.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Failed to list subscriptions' },
      { status: 500 }
    )
  }
}
