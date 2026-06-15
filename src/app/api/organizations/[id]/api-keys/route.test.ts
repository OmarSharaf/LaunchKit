/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { mockUser } from '@/test-utils'
import { AuthError, ForbiddenError } from '@/lib/errors'

const mockRequireAuth = jest.fn()
const mockRequireOrgRole = jest.fn()
const mockFindMany = jest.fn()
const mockCreate = jest.fn()
const mockCreateAuditLog = jest.fn()

jest.mock('@/lib/auth', () => ({
  requireAuthApi: () => mockRequireAuth(),
  requireOrgRole: (...args: unknown[]) => mockRequireOrgRole(...args),
}))

jest.mock('@/lib/audit', () => ({
  createAuditLog: (...args: unknown[]) => mockCreateAuditLog(...args),
}))

jest.mock('@/lib/feature-flags', () => ({
  isFeatureEnabled: () => true,
}))

jest.mock('@/lib/api-keys', () => ({
  generateApiKey: () => ({
    rawKey: 'lk_testrawkey',
    keyHash: 'hash',
    prefix: 'lk_testraw',
  }),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    apiKey: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}))

import { GET, POST } from './route'

describe('/api/organizations/[id]/api-keys', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAuth.mockResolvedValue(mockUser)
    mockRequireOrgRole.mockResolvedValue({})
    mockFindMany.mockResolvedValue([])
    mockCreate.mockResolvedValue({
      id: 'key-1',
      name: 'Prod',
      prefix: 'lk_testraw',
      createdAt: new Date(),
    })
    mockCreateAuditLog.mockResolvedValue({})
  })

  it('GET lists keys', async () => {
    const response = await GET(new NextRequest('http://localhost'), {
      params: Promise.resolve({ id: 'org-1' }),
    })
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ keys: [] })
  })

  it('POST creates key', async () => {
    const response = await POST(
      new NextRequest('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ name: 'Prod' }),
      }),
      { params: Promise.resolve({ id: 'org-1' }) }
    )
    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.apiKey.key).toBe('lk_testrawkey')
  })

  it('returns 403 when forbidden', async () => {
    mockRequireOrgRole.mockRejectedValue(new ForbiddenError())
    const response = await GET(new NextRequest('http://localhost'), {
      params: Promise.resolve({ id: 'org-1' }),
    })
    expect(response.status).toBe(403)
  })

  it('returns 401 when unauthenticated', async () => {
    mockRequireAuth.mockRejectedValue(new AuthError())
    const response = await GET(new NextRequest('http://localhost'), {
      params: Promise.resolve({ id: 'org-1' }),
    })
    expect(response.status).toBe(401)
  })
})
