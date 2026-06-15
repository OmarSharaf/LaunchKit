import { type NextRequest, NextResponse } from 'next/server'
import { handleAdminError, requireAdminApi } from '@/lib/admin-api'
import { createAuditLog } from '@/lib/audit'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { createAdminClient } from '@/lib/supabase/server'
import { adminUpdateUserSchema } from '@/lib/validations'
import type { Prisma } from '@prisma/client'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdminApi()
    const { id } = await params

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        suspendedReason: true,
        isPlatformAdmin: true,
        emailVerified: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        memberships: {
          include: {
            organization: {
              select: {
                id: true,
                name: true,
                slug: true,
                subscription: {
                  select: {
                    status: true,
                    plan: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            auditLogs: true,
            apiKeys: true,
            invitations: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { _count, memberships, ...rest } = user

    return NextResponse.json({
      user: {
        ...rest,
        createdAt: rest.createdAt.toISOString(),
        updatedAt: rest.updatedAt.toISOString(),
        stats: _count,
        memberships: memberships.map((m) => ({
          role: m.role,
          joinedAt: m.joinedAt.toISOString(),
          organization: {
            id: m.organization.id,
            name: m.organization.name,
            slug: m.organization.slug,
            planName: m.organization.subscription?.plan?.name ?? null,
            subscriptionStatus: m.organization.subscription?.status ?? null,
          },
        })),
      },
    })
  } catch (err) {
    const handled = handleAdminError(err)
    if (handled) return handled

    logger.error('Admin get user failed', {
      message: err instanceof Error ? err.message : 'Unknown error',
    })
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireAdminApi()
    const { id } = await params

    if (id === admin.id) {
      return NextResponse.json(
        { error: 'You cannot modify your own account via admin API' },
        { status: 400 }
      )
    }

    const body = adminUpdateUserSchema.parse(await request.json())

    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(body.status !== undefined ? { status: body.status } : {}),
        ...(body.suspendedReason !== undefined
          ? { suspendedReason: body.suspendedReason }
          : {}),
        ...(body.isPlatformAdmin !== undefined
          ? { isPlatformAdmin: body.isPlatformAdmin }
          : {}),
      } satisfies Prisma.UserUpdateInput,
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        suspendedReason: true,
        isPlatformAdmin: true,
        createdAt: true,
      },
    })

    await createAuditLog({
      action: 'admin.user.updated',
      entity: 'user',
      entityId: id,
      userId: admin.id,
      metadata: body,
    })

    return NextResponse.json({
      user: { ...updated, createdAt: updated.createdAt.toISOString() },
    })
  } catch (err) {
    const handled = handleAdminError(err)
    if (handled) return handled

    if (err instanceof Error && err.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    logger.error('Admin update user failed', {
      message: err instanceof Error ? err.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireAdminApi()
    const { id } = await params

    if (id === admin.id) {
      return NextResponse.json(
        { error: 'You cannot delete your own account' },
        { status: 400 }
      )
    }

    const existing = await prisma.user.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    await createAuditLog({
      action: 'admin.user.deleted',
      entity: 'user',
      entityId: id,
      userId: admin.id,
      metadata: { email: existing.email },
    })

    await prisma.user.delete({ where: { id } })

    try {
      const supabaseAdmin = createAdminClient()
      await supabaseAdmin.auth.admin.deleteUser(id)
    } catch (authErr) {
      logger.error('Supabase user delete failed', {
        userId: id,
        message: authErr instanceof Error ? authErr.message : 'Unknown error',
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const handled = handleAdminError(err)
    if (handled) return handled

    logger.error('Admin delete user failed', {
      message: err instanceof Error ? err.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    )
  }
}
