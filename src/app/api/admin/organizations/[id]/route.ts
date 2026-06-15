import { type NextRequest, NextResponse } from 'next/server'
import { handleAdminError, requireAdminApi } from '@/lib/admin-api'
import { createAuditLog } from '@/lib/audit'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const admin = await requireAdminApi()
    const { id } = await params

    const organization = await prisma.organization.findUnique({ where: { id } })
    if (!organization) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      )
    }

    await createAuditLog({
      action: 'admin.organization.deleted',
      entity: 'organization',
      entityId: id,
      userId: admin.id,
      metadata: { name: organization.name, slug: organization.slug },
    })

    await prisma.organization.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    const handled = handleAdminError(err)
    if (handled) return handled

    logger.error('Admin delete organization failed', {
      message: err instanceof Error ? err.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Failed to delete organization' },
      { status: 500 }
    )
  }
}
