/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

const mockGetUser = jest.fn()
const mockCreateServerClient = jest.fn()

jest.mock('@supabase/ssr', () => ({
  createServerClient: (...args: unknown[]) => mockCreateServerClient(...args),
}))

import { middleware } from './middleware'
import { resetRateLimits } from '@/lib/rate-limit'

function createRequest(
  pathname: string,
  cookies: { name: string; value: string }[] = []
) {
  const url = new URL(`http://localhost:3000${pathname}`)
  const request = new NextRequest(url)
  cookies.forEach(({ name, value }) => {
    request.cookies.set(name, value)
  })
  return request
}

describe('middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    resetRateLimits()
    mockGetUser.mockResolvedValue({ data: { user: null } })
    mockCreateServerClient.mockImplementation((_url, _key, config) => {
      const cookieHandlers = config.cookies
      return {
        auth: { getUser: mockGetUser },
        _cookieHandlers: cookieHandlers,
      }
    })
  })

  it('allows public routes for unauthenticated users', async () => {
    const response = await middleware(createRequest('/'))
    expect(response.status).toBe(200)
    expect(mockGetUser).toHaveBeenCalled()
  })

  it('redirects unauthenticated users from protected routes', async () => {
    const response = await middleware(createRequest('/dashboard'))
    expect(response.status).toBe(307)
    const location = response.headers.get('location')
    expect(location).toContain('/auth/login')
    expect(location).toContain('redirectTo=%2Fdashboard')
  })

  it('redirects authenticated users away from auth routes', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: '1' } } })
    const response = await middleware(createRequest('/auth/login'))
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain('/dashboard')
  })

  it('allows authenticated users on protected routes', async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: '1' } } })
    const response = await middleware(createRequest('/dashboard/billing'))
    expect(response.status).toBe(200)
  })

  it('handles cookie setAll in supabase client config', async () => {
    await middleware(createRequest('/', [{ name: 'sb', value: 'token' }]))
    const config = mockCreateServerClient.mock.calls[0][2] as {
      cookies: {
        getAll: () => unknown
        setAll: (c: { name: string; value: string; options: object }[]) => void
      }
    }
    const cookies = config.cookies.getAll()
    expect(cookies).toBeDefined()
    config.cookies.setAll([
      { name: 'sb', value: 'new', options: { path: '/' } },
    ])
  })

  it('protects /org and /settings routes', async () => {
    const orgResponse = await middleware(createRequest('/org/acme'))
    expect(orgResponse.status).toBe(307)

    const settingsResponse = await middleware(
      createRequest('/settings/profile')
    )
    expect(settingsResponse.status).toBe(307)
  })

  it('exports matcher config', async () => {
    const { config } = await import('./middleware')
    expect(config.matcher).toBeDefined()
    expect(config.matcher[0]).toContain('_next/static')
  })

  it('rate limits auth routes', async () => {
    for (let i = 0; i < 20; i++) {
      await middleware(createRequest('/auth/login'))
    }
    const response = await middleware(createRequest('/auth/login'))
    expect(response.status).toBe(429)
  })
})
