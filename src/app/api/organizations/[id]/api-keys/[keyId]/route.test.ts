/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { mockUser } from '@/test-utils'
import { AuthError, ForbiddenError } from '@/lib/errors'

const mockRequireAuth = jest.fn()
const mockRequireOrgRole = jest.fn()
const mockFindFirst = jest.fn()
const mockDelete = jest.fn()
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

jest.mock('@/lib/prisma', () => ({
  prisma: {
    apiKey: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
      delete: (...args: unknown[]) => mockDelete(...args),
    },
  },
}))

import { DELETE } from './route'

describe('DELETE /api/organizations/[id]/api-keys/[keyId]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAuth.mockResolvedValue(mockUser)
    mockRequireOrgRole.mockResolvedValue({})
    mockFindFirst.mockResolvedValue({
      id: 'key-1',
      name: 'Prod',
      prefix: 'lk_',
    })
    mockDelete.mockResolvedValue({})
    mockCreateAuditLog.mockResolvedValue({})
  })

  it('revokes api key', async () => {
    const response = await DELETE(new NextRequest('http://localhost'), {
      params: Promise.resolve({ id: 'org-1', keyId: 'key-1' }),
    })
    expect(response.status).toBe(200)
    expect(mockDelete).toHaveBeenCalled()
  })

  it('returns 404 when key missing', async () => {
    mockFindFirst.mockResolvedValue(null)
    const response = await DELETE(new NextRequest('http://localhost'), {
      params: Promise.resolve({ id: 'org-1', keyId: 'missing' }),
    })
    expect(response.status).toBe(404)
  })

  it('returns 403 when forbidden', async () => {
    mockRequireOrgRole.mockRejectedValue(new ForbiddenError())
    const response = await DELETE(new NextRequest('http://localhost'), {
      params: Promise.resolve({ id: 'org-1', keyId: 'key-1' }),
    })
    expect(response.status).toBe(403)
  })

  it('returns 401 when unauthenticated', async () => {
    mockRequireAuth.mockRejectedValue(new AuthError())
    const response = await DELETE(new NextRequest('http://localhost'), {
      params: Promise.resolve({ id: 'org-1', keyId: 'key-1' }),
    })
    expect(response.status).toBe(401)
  })
})
