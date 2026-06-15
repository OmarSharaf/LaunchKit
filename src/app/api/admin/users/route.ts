import { type NextRequest, NextResponse } from 'next/server'
import { handleAdminError, requireAdminApi } from '@/lib/admin-api'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { adminUsersQuerySchema } from '@/lib/validations'
import type { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    await requireAdminApi()

    const { searchParams } = new URL(request.url)
    const { page, limit, search, status, recentDays } =
      adminUsersQuerySchema.parse({
        page: searchParams.get('page') ?? undefined,
        limit: searchParams.get('limit') ?? undefined,
        search: searchParams.get('search') ?? undefined,
        status: searchParams.get('status') ?? undefined,
        recentDays: searchParams.get('recentDays') ?? undefined,
      })

    const where: Prisma.UserWhereInput = {}

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) {
      where.status = status
    }

    if (recentDays) {
      where.createdAt = {
        gte: new Date(Date.now() - recentDays * 24 * 60 * 60 * 1000),
      }
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          status: true,
          suspendedReason: true,
          isPlatformAdmin: true,
          emailVerified: true,
          createdAt: true,
          _count: { select: { memberships: true } },
        },
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      users: users.map(({ _count, ...user }) => ({
        ...user,
        organizationCount: _count.memberships,
        createdAt: user.createdAt.toISOString(),
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

    logger.error('Admin list users failed', {
      message: err instanceof Error ? err.message : 'Unknown error',
    })
    return NextResponse.json({ error: 'Failed to list users' }, { status: 500 })
  }
}
