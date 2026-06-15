import { NextResponse } from 'next/server'
import { requireAuthApi } from '@/lib/auth'
import { AuthError, ForbiddenError } from '@/lib/errors'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { requirePlatformAdmin } from '@/lib/platform-admin'

type AuthUser = Awaited<ReturnType<typeof requireAuthApi>>

export async function requireAdminApi(): Promise<AuthUser> {
  if (!isFeatureEnabled('ADMIN_DASHBOARD')) {
    throw new AdminFeatureDisabledError()
  }

  const user = await requireAuthApi()
  await requirePlatformAdmin(user.id, user.email)
  return user
}

export class AdminFeatureDisabledError extends Error {
  constructor() {
    super('Admin feature disabled')
    this.name = 'AdminFeatureDisabledError'
  }
}

export function handleAdminError(err: unknown) {
  if (err instanceof AdminFeatureDisabledError) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (err instanceof AuthError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (err instanceof ForbiddenError) {
    return NextResponse.json({ error: err.message }, { status: 403 })
  }
  return null
}
