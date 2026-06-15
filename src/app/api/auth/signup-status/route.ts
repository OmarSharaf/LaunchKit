import { NextResponse } from 'next/server'
import { areSignupsEnabled } from '@/lib/platform-settings'

export async function GET() {
  const signupsEnabled = await areSignupsEnabled()
  return NextResponse.json({ signupsEnabled })
}
