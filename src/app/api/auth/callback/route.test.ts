/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { createMockSupabaseAuth, mockUser } from '@/test-utils'

const mockExchangeCode = jest.fn()
const mockSignOut = jest.fn()
const mockUpsert = jest.fn()
const mockFindUnique = jest.fn()

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      upsert: (...args: unknown[]) => mockUpsert(...args),
    },
  },
}))

jest.mock('@/lib/platform-settings', () => ({
  areSignupsEnabled: jest.fn().mockResolvedValue(true),
}))

jest.mock('@/lib/platform-admin', () => ({
  syncPlatformAdminFlag: jest.fn().mockResolvedValue(undefined),
  assertUserCanAccessApp: jest.fn().mockResolvedValue(undefined),
}))

jest.mock('@/lib/organizations', () => ({
  ensureDefaultOrganization: jest.fn().mockResolvedValue(undefined),
}))

import { createClient } from '@/lib/supabase/server'
import { GET } from './route'

const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>

function createRequest(url: string, headers: Record<string, string> = {}) {
  return new NextRequest(new URL(url), { headers })
}

describe('GET /api/auth/callback', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUpsert.mockResolvedValue({})
    mockFindUnique.mockResolvedValue({ id: mockUser.id })
    mockSignOut.mockResolvedValue({})
    mockCreateClient.mockResolvedValue({
      auth: createMockSupabaseAuth({
        exchangeCodeForSession: mockExchangeCode,
        signOut: mockSignOut,
      }),
    } as never)
  })

  it('redirects with error code when description is missing', async () => {
    const response = await GET(
      createRequest(
        'http://localhost:3000/api/auth/callback?error=access_denied'
      )
    )
    expect(response.headers.get('location')).toContain('error=access_denied')
  })

  it('redirects on auth error from supabase', async () => {
    const response = await GET(
      createRequest(
        'http://localhost:3000/api/auth/callback?error=access_denied&error_description=Denied'
      )
    )
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('error=Denied')
  })

  it('redirects when code exchange fails', async () => {
    mockExchangeCode.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid code' },
    })

    const response = await GET(
      createRequest('http://localhost:3000/api/auth/callback?code=bad-code')
    )
    expect(response.headers.get('location')).toContain('Invalid%20code')
  })

  it('syncs user without display name metadata', async () => {
    mockExchangeCode.mockResolvedValue({
      data: {
        user: {
          ...mockUser,
          user_metadata: {},
        },
      },
      error: null,
    })

    await GET(
      createRequest('http://localhost:3000/api/auth/callback?code=valid-code')
    )

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ name: null }),
        update: expect.objectContaining({ name: undefined }),
      })
    )
  })

  it('syncs user using name metadata and redirects in development', async () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    mockExchangeCode.mockResolvedValue({
      data: {
        user: {
          ...mockUser,
          email_confirmed_at: null,
          user_metadata: { name: 'Named User' },
        },
      },
      error: null,
    })

    await GET(
      createRequest('http://localhost:3000/api/auth/callback?code=valid-code')
    )

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ name: 'Named User' }),
        update: expect.objectContaining({ name: 'Named User' }),
      })
    )
    process.env.NODE_ENV = originalEnv
  })

  it('syncs user and redirects in development', async () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'development'
    mockExchangeCode.mockResolvedValue({
      data: {
        user: {
          ...mockUser,
          email_confirmed_at: new Date().toISOString(),
          user_metadata: {
            full_name: 'Test User',
            avatar_url: 'https://avatar.png',
          },
        },
      },
      error: null,
    })

    const response = await GET(
      createRequest(
        'http://localhost:3000/api/auth/callback?code=valid-code&next=/dashboard'
      )
    )

    expect(mockUpsert).toHaveBeenCalled()
    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/dashboard'
    )
    process.env.NODE_ENV = originalEnv
  })

  it('redirects using forwarded host in production', async () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    mockExchangeCode.mockResolvedValue({
      data: {
        user: {
          ...mockUser,
          email_confirmed_at: null,
          user_metadata: { name: 'Named' },
        },
      },
      error: null,
    })

    const response = await GET(
      createRequest('http://localhost:3000/api/auth/callback?code=valid', {
        'x-forwarded-host': 'app.example.com',
      })
    )

    expect(response.headers.get('location')).toBe(
      'https://app.example.com/dashboard'
    )
    process.env.NODE_ENV = originalEnv
  })

  it('redirects to origin when no forwarded host in production', async () => {
    const originalEnv = process.env.NODE_ENV
    process.env.NODE_ENV = 'production'
    mockExchangeCode.mockResolvedValue({
      data: { user: mockUser },
      error: null,
    })

    const response = await GET(
      createRequest('http://localhost:3000/api/auth/callback?code=valid')
    )

    expect(response.headers.get('location')).toBe(
      'http://localhost:3000/dashboard'
    )
    process.env.NODE_ENV = originalEnv
  })

  it('redirects when no code provided', async () => {
    const response = await GET(
      createRequest('http://localhost:3000/api/auth/callback')
    )
    expect(response.headers.get('location')).toContain('No+code+provided')
  })
})
