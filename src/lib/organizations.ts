import { prisma } from '@/lib/prisma'
import { slugify, generateRandomString } from '@/lib/utils'
import { createAuditLog } from '@/lib/audit'
import type { UserRole } from '@prisma/client'

export async function createUniqueSlug(baseName: string): Promise<string> {
  const base = slugify(baseName) || 'workspace'
  let slug = base
  let attempt = 0

  while (attempt < 10) {
    const existing = await prisma.organization.findUnique({ where: { slug } })
    if (!existing) return slug
    slug = `${base}-${generateRandomString(4).toLowerCase()}`
    attempt++
  }

  return `${base}-${Date.now()}`
}

export async function createOrganization({
  userId,
  name,
  slug,
  role = 'ADMIN',
}: {
  userId: string
  name: string
  slug?: string
  role?: UserRole
}) {
  const organizationSlug = slug ?? (await createUniqueSlug(name))

  const organization = await prisma.organization.create({
    data: {
      name,
      slug: organizationSlug,
      members: {
        create: {
          userId,
          role,
        },
      },
    },
    include: {
      members: true,
      subscription: { include: { plan: true } },
    },
  })

  await createAuditLog({
    action: 'organization.created',
    entity: 'organization',
    entityId: organization.id,
    userId,
    organizationId: organization.id,
    metadata: { name, slug: organizationSlug },
  })

  return organization
}

export async function ensureDefaultOrganization(
  userId: string,
  displayName?: string | null
) {
  const count = await prisma.organizationMember.count({
    where: { userId },
  })

  if (count > 0) return null

  // brand-new user — drop them into a workspace so /dashboard isn't empty
  const name = displayName?.trim()
    ? `${displayName.split(' ')[0]}'s Workspace`
    : 'My Workspace'

  return createOrganization({ userId, name })
}
