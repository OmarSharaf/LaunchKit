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

    const status = searchParams.get('status') ?? 'PENDING'

    const [invitations, total] = await Promise.all([
      prisma.invitation.findMany({
        where: { status: status as 'PENDING' | 'ACCEPTED' | 'EXPIRED' },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          organization: { select: { name: true, slug: true } },
          invitedBy: { select: { email: true, name: true } },
        },
      }),
      prisma.invitation.count({
        where: { status: status as 'PENDING' | 'ACCEPTED' | 'EXPIRED' },
      }),
    ])

    return NextResponse.json({
      invitations: invitations.map((inv) => ({
        id: inv.id,
        email: inv.email,
        role: inv.role,
        status: inv.status,
        expiresAt: inv.expiresAt.toISOString(),
        createdAt: inv.createdAt.toISOString(),
        organizationName: inv.organization.name,
        organizationSlug: inv.organization.slug,
        invitedByEmail: inv.invitedBy.email,
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

    logger.error('Admin list invitations failed', {
      message: err instanceof Error ? err.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Failed to list invitations' },
      { status: 500 }
    )
  }
}
