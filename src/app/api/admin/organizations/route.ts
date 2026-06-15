import { type NextRequest, NextResponse } from 'next/server'
import { handleAdminError, requireAdminApi } from '@/lib/admin-api'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { adminListQuerySchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    await requireAdminApi()

    const { searchParams } = new URL(request.url)
    const { page, limit, search } = adminListQuerySchema.parse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      search: searchParams.get('search') ?? undefined,
    })

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { slug: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [organizations, total] = await Promise.all([
      prisma.organization.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          subscription: { include: { plan: true } },
          _count: { select: { members: true } },
        },
      }),
      prisma.organization.count({ where }),
    ])

    return NextResponse.json({
      organizations: organizations.map((org) => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        memberCount: org._count.members,
        planName: org.subscription?.plan?.name ?? null,
        subscriptionStatus: org.subscription?.status ?? null,
        createdAt: org.createdAt.toISOString(),
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

    logger.error('Admin list organizations failed', {
      message: err instanceof Error ? err.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Failed to list organizations' },
      { status: 500 }
    )
  }
}
