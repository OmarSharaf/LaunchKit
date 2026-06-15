import { type NextRequest, NextResponse } from 'next/server'
import { handleAdminError, requireAdminApi } from '@/lib/admin-api'
import { createAuditLog } from '@/lib/audit'
import {
  getPlatformSettings,
  updatePlatformSettings,
} from '@/lib/platform-settings'
import { logger } from '@/lib/logger'
import { adminUpdateSettingsSchema } from '@/lib/validations'

export async function GET() {
  try {
    await requireAdminApi()
    const settings = await getPlatformSettings()
    return NextResponse.json({
      signupsEnabled: settings.signupsEnabled,
      updatedAt: settings.updatedAt.toISOString(),
    })
  } catch (err) {
    const handled = handleAdminError(err)
    if (handled) return handled

    logger.error('Admin get settings failed', {
      message: err instanceof Error ? err.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const admin = await requireAdminApi()
    const body = adminUpdateSettingsSchema.parse(await request.json())

    const settings = await updatePlatformSettings({
      signupsEnabled: body.signupsEnabled,
    })

    await createAuditLog({
      action: 'admin.settings.updated',
      entity: 'platform_settings',
      entityId: settings.id,
      userId: admin.id,
      metadata: body,
    })

    return NextResponse.json({
      signupsEnabled: settings.signupsEnabled,
      updatedAt: settings.updatedAt.toISOString(),
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

    logger.error('Admin update settings failed', {
      message: err instanceof Error ? err.message : 'Unknown error',
    })
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
