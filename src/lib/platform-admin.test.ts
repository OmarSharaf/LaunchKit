import {
  assertUserCanAccessApp,
  getPlatformAdminEmails,
  isPlatformAdminEmail,
  syncPlatformAdminFlag,
} from './platform-admin'
import { prisma } from '@/lib/prisma'
import { ForbiddenError } from '@/lib/errors'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}))

describe('platform-admin', () => {
  const originalEnv = process.env.PLATFORM_ADMIN_EMAILS

  afterEach(() => {
    process.env.PLATFORM_ADMIN_EMAILS = originalEnv
    jest.clearAllMocks()
  })

  it('parses platform admin emails from env', () => {
    process.env.PLATFORM_ADMIN_EMAILS = 'Admin@Example.com, other@test.com'
    expect(getPlatformAdminEmails()).toEqual([
      'admin@example.com',
      'other@test.com',
    ])
    expect(isPlatformAdminEmail('admin@example.com')).toBe(true)
  })

  it('syncs platform admin flag for listed emails', async () => {
    process.env.PLATFORM_ADMIN_EMAILS = 'admin@example.com'
    ;(prisma.user.update as jest.Mock).mockResolvedValue({})
    await syncPlatformAdminFlag('user-1', 'admin@example.com')
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { isPlatformAdmin: true },
    })
  })

  it('blocks suspended users', async () => {
    ;(prisma.user.findUnique as jest.Mock).mockResolvedValue({
      status: 'SUSPENDED',
      suspendedReason: 'Policy violation',
    })

    await expect(assertUserCanAccessApp('user-1')).rejects.toThrow(
      ForbiddenError
    )
  })
})
