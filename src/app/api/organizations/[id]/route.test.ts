/** @jest-environment node */

import { NextRequest } from 'next/server'

const mockRequireAuthApi = jest.fn()
const mockRequireOrgMember = jest.fn()
const mockIsPlatformAdmin = jest.fn()
const mockFindUnique = jest.fn()
const mockFindFirst = jest.fn()
const mockDelete = jest.fn()
const mockCreateAuditLog = jest.fn()

jest.mock('@/lib/auth', () => ({
  requireAuthApi: () => mockRequireAuthApi(),
  requireOrgMember: (...args: unknown[]) => mockRequireOrgMember(...args),
}))

jest.mock('@/lib/platform-admin', () => ({
  isPlatformAdmin: (...args: unknown[]) => mockIsPlatformAdmin(...args),
}))

jest.mock('@/lib/audit', () => ({
  createAuditLog: (...args: unknown[]) => mockCreateAuditLog(...args),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    organization: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      delete: (...args: unknown[]) => mockDelete(...args),
    },
    organizationMember: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
    },
  },
}))

import { DELETE, GET } from './route'
import { mockUser } from '@/test-utils'
import { AuthError, ForbiddenError } from '@/lib/errors'

describe('GET /api/organizations/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAuthApi.mockResolvedValue(mockUser)
    mockRequireOrgMember.mockResolvedValue({})
  })

  it('returns organization for member', async () => {
    const org = { id: 'org-1', name: 'Acme', subscription: null }
    mockFindUnique.mockResolvedValue(org)

    const response = await GET(new NextRequest('http://localhost'), {
      params: Promise.resolve({ id: 'org-1' }),
    })

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual(org)
  })

  it('returns 404 when organization missing', async () => {
    mockFindUnique.mockResolvedValue(null)

    const response = await GET(new NextRequest('http://localhost'), {
      params: Promise.resolve({ id: 'org-1' }),
    })

    expect(response.status).toBe(404)
  })

  it('returns 404 when not a member', async () => {
    mockRequireOrgMember.mockRejectedValue(new ForbiddenError())

    const response = await GET(new NextRequest('http://localhost'), {
      params: Promise.resolve({ id: 'org-1' }),
    })

    expect(response.status).toBe(404)
  })

  it('returns 401 when unauthenticated', async () => {
    mockRequireAuthApi.mockRejectedValue(new AuthError())

    const response = await GET(new NextRequest('http://localhost'), {
      params: Promise.resolve({ id: 'org-1' }),
    })

    expect(response.status).toBe(401)
  })
})

describe('DELETE /api/organizations/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAuthApi.mockResolvedValue(mockUser)
    mockCreateAuditLog.mockResolvedValue({})
    mockDelete.mockResolvedValue({})
    mockIsPlatformAdmin.mockResolvedValue(false)
  })

  it('deletes organization for super admin', async () => {
    mockFindFirst.mockResolvedValue({
      organization: { name: 'Acme' },
    })

    const response = await DELETE(new NextRequest('http://localhost'), {
      params: Promise.resolve({ id: 'org-1' }),
    })

    expect(response.status).toBe(200)
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'org-1' } })
  })

  it('returns 403 for non super admin', async () => {
    mockFindFirst.mockResolvedValue(null)

    const response = await DELETE(new NextRequest('http://localhost'), {
      params: Promise.resolve({ id: 'org-1' }),
    })

    expect(response.status).toBe(403)
  })
})
