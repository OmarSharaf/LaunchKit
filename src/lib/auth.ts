import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { cache } from 'react'
import type { UserRole } from '@prisma/client'
import { AuthError, ForbiddenError } from '@/lib/errors'

export const ADMIN_ROLES: UserRole[] = ['ADMIN', 'SUPER_ADMIN'] // checkout, invites, API keys

export const getUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

export const getDbUser = cache(async () => {
  const user = await getUser()
  if (!user) return null

  return prisma.user.findUnique({
    where: { id: user.id },
  })
})

const membershipInclude = {
  memberships: {
    include: {
      organization: {
        include: {
          subscription: { include: { plan: true } },
          members: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
        },
      },
    },
    orderBy: { joinedAt: 'asc' as const },
  },
} as const

export const getDbUserWithMemberships = cache(async () => {
  const user = await getUser()
  if (!user) return null

  return prisma.user.findUnique({
    where: { id: user.id },
    include: membershipInclude,
  })
})

export async function requireAuth() {
  const user = await getUser()
  if (!user) redirect('/auth/login')
  return user
}

export async function requireAuthApi() {
  const user = await getUser()
  if (!user) throw new AuthError()
  return user
}

export async function requireGuest() {
  const user = await getUser()
  if (user) redirect('/dashboard')
}

export async function getOrganizationMembership(slug: string) {
  const user = await getUser()
  if (!user) return null

  return prisma.organizationMember.findFirst({
    where: {
      userId: user.id,
      organization: { slug },
    },
    include: {
      organization: {
        include: {
          subscription: {
            include: { plan: true },
          },
        },
      },
    },
  })
}

export async function requireOrgMember(organizationId: string, userId: string) {
  const membership = await prisma.organizationMember.findFirst({
    where: { userId, organizationId },
    include: {
      organization: {
        include: {
          subscription: { include: { plan: true } },
        },
      },
    },
  })

  if (!membership) {
    throw new ForbiddenError('Organization access required')
  }

  return membership
}

export async function requireOrgRole(
  organizationId: string,
  userId: string,
  roles: UserRole[] = ADMIN_ROLES
) {
  const membership = await prisma.organizationMember.findFirst({
    where: {
      userId,
      organizationId,
      role: { in: roles },
    },
    include: {
      organization: {
        include: {
          subscription: { include: { plan: true } },
        },
      },
    },
  })

  if (!membership) {
    throw new ForbiddenError('Admin access required')
  }

  return membership
}

/** @deprecated use requireOrgRole — some old callers expect null instead of throw */
export async function requireOrgAdmin(organizationId: string, userId: string) {
  try {
    return await requireOrgRole(organizationId, userId, ADMIN_ROLES)
  } catch (err) {
    if (err instanceof ForbiddenError) return null
    throw err
  }
}
