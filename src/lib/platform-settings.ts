import { prisma } from '@/lib/prisma'

const SETTINGS_ID = 'default'

export async function getPlatformSettings() {
  return prisma.platformSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, signupsEnabled: true },
    update: {},
  })
}

export async function areSignupsEnabled(): Promise<boolean> {
  const settings = await getPlatformSettings()
  return settings.signupsEnabled
}

export async function updatePlatformSettings(data: {
  signupsEnabled: boolean
}) {
  return prisma.platformSettings.upsert({
    where: { id: SETTINGS_ID },
    create: { id: SETTINGS_ID, ...data },
    update: data,
  })
}
