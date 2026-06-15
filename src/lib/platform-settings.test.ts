import {
  areSignupsEnabled,
  getPlatformSettings,
  updatePlatformSettings,
} from './platform-settings'
import { prisma } from '@/lib/prisma'

jest.mock('@/lib/prisma', () => ({
  prisma: {
    platformSettings: {
      upsert: jest.fn(),
    },
  },
}))

describe('platform-settings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns signups enabled from settings', async () => {
    ;(prisma.platformSettings.upsert as jest.Mock).mockResolvedValue({
      id: 'default',
      signupsEnabled: false,
      updatedAt: new Date(),
    })
    await expect(areSignupsEnabled()).resolves.toBe(false)
  })

  it('updates platform settings', async () => {
    ;(prisma.platformSettings.upsert as jest.Mock).mockResolvedValue({
      id: 'default',
      signupsEnabled: true,
      updatedAt: new Date(),
    })
    await updatePlatformSettings({ signupsEnabled: true })
    expect(prisma.platformSettings.upsert).toHaveBeenCalled()
    await getPlatformSettings()
    expect(prisma.platformSettings.upsert).toHaveBeenCalledTimes(2)
  })
})
