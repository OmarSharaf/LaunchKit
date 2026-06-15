import { createHash, randomBytes } from 'crypto'
import { prisma } from '@/lib/prisma'

export function generateApiKey() {
  const rawKey = `lk_${randomBytes(24).toString('hex')}`
  return {
    rawKey,
    keyHash: hashApiKey(rawKey),
    prefix: rawKey.slice(0, 11),
  }
}

export function hashApiKey(rawKey: string) {
  // we only store the hash — raw key is shown once at creation
  return createHash('sha256').update(rawKey).digest('hex')
}

export async function validateApiKey(rawKey: string) {
  const keyHash = hashApiKey(rawKey)
  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: { organization: true },
  })

  if (!apiKey) return null
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) return null

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  })

  return apiKey
}
