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

    const invitation = await prisma.invitation.findUnique({
      where: { id },
      include: { organization: true },
    })

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      )
    }

    await prisma.invitation.update({
      where: { id },
      data: { status: 'EXPIRED' },
    })

    await createAuditLog({
      action: 'admin.invitation.revoked',
      entity: 'invitation',
      entityId: id,
      userId: admin.id,
      organizationId: invitation.organizationId,
      metadata: {
        email: invitation.email,
        organizationName: invitation.organization.name,
      },
    })

    return NextResponse.json({ success: true })
  } catch (err) {
    const handled = handleAdminError(err)
    if (handled) return handled

    logger.error('Admin revoke invitation failed', {
      message: err instanceof Error ? err.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Failed to revoke invitation' },
      { status: 500 }
    )
  }
}
