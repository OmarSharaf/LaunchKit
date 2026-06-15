import { prisma } from '@/lib/prisma'
import { ForbiddenError } from '@/lib/errors'

export function getPlatformAdminEmails(): string[] {
  return (process.env.PLATFORM_ADMIN_EMAILS ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function isPlatformAdminEmail(
  email: string | null | undefined
): boolean {
  if (!email) return false
  return getPlatformAdminEmails().includes(email.trim().toLowerCase())
}

export async function isPlatformAdmin(
  userId: string,
  email?: string | null
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPlatformAdmin: true, email: true },
  })

  if (!user) return false
  if (user.isPlatformAdmin) return true
  return isPlatformAdminEmail(email ?? user.email)
}

export async function requirePlatformAdmin(
  userId: string,
  email?: string | null
): Promise<void> {
  if (!(await isPlatformAdmin(userId, email))) {
    throw new ForbiddenError('Platform admin access required')
  }
}

// PLATFORM_ADMIN_EMAILS → flip isPlatformAdmin on login
export async function syncPlatformAdminFlag(
  userId: string,
  email: string
): Promise<void> {
  if (!isPlatformAdminEmail(email)) return

  await prisma.user.update({
    where: { id: userId },
    data: { isPlatformAdmin: true },
  })
}

export async function assertUserCanAccessApp(userId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { status: true, suspendedReason: true },
  })

  if (!user) return

  if (user.status === 'SUSPENDED') {
    throw new ForbiddenError(
      user.suspendedReason ?? 'Your account has been suspended.'
    )
  }

  if (user.status === 'BANNED') {
    throw new ForbiddenError('Your account has been banned.')
  }
}
