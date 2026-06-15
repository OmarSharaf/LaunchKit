import { type NextRequest, NextResponse } from 'next/server'
import { requireAuthApi, requireOrgMember } from '@/lib/auth'
import { AuthError, ForbiddenError } from '@/lib/errors'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit'
import { logger } from '@/lib/logger'
import { isPlatformAdmin } from '@/lib/platform-admin'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuthApi()
    const { id } = await params

    await requireOrgMember(id, user.id)

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        subscription: { include: { plan: true } },
      },
    })

    if (!organization) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(organization)
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    logger.error('Fetch organization failed', {
      message: err instanceof Error ? err.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await requireAuthApi()
    const { id } = await params

    const platformAdmin = await isPlatformAdmin(user.id, user.email)

    let organizationName: string
    if (platformAdmin) {
      const organization = await prisma.organization.findUnique({
        where: { id },
      })
      if (!organization) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
      organizationName = organization.name
    } else {
      const membership = await prisma.organizationMember.findFirst({
        where: {
          userId: user.id,
          organizationId: id,
          role: 'SUPER_ADMIN',
        },
        include: { organization: true },
      })

      if (!membership) {
        return NextResponse.json(
          { error: 'Super admin access required' },
          { status: 403 }
        )
      }
      organizationName = membership.organization.name
    }

    await createAuditLog({
      action: 'organization.deleted',
      entity: 'organization',
      entityId: id,
      userId: user.id,
      organizationId: id,
      metadata: { name: organizationName },
    })

    await prisma.organization.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    logger.error('Delete organization failed', {
      message: err instanceof Error ? err.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Failed to delete organization' },
      { status: 500 }
    )
  }
}
