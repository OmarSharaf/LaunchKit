/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'
import { mockUser } from '@/test-utils'
import { AuthError, ForbiddenError } from '@/lib/errors'

const mockRequireAuth = jest.fn()
const mockRequireOrgMember = jest.fn()
const mockFindMany = jest.fn()

jest.mock('@/lib/auth', () => ({
  requireAuthApi: () => mockRequireAuth(),
  requireOrgMember: (...args: unknown[]) => mockRequireOrgMember(...args),
}))

jest.mock('@/lib/feature-flags', () => ({
  isFeatureEnabled: (flag: string) => flag === 'AUDIT_LOG',
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    auditLog: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
  },
}))

import { GET } from './route'

describe('GET /api/organizations/[id]/audit-logs', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAuth.mockResolvedValue(mockUser)
    mockRequireOrgMember.mockResolvedValue({})
    mockFindMany.mockResolvedValue([{ id: 'log-1', action: 'test' }])
  })

  it('returns audit logs', async () => {
    const response = await GET(new NextRequest('http://localhost'), {
      params: Promise.resolve({ id: 'org-1' }),
    })
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.logs).toHaveLength(1)
  })

  it('returns 404 when not a member', async () => {
    mockRequireOrgMember.mockRejectedValue(new ForbiddenError())
    const response = await GET(new NextRequest('http://localhost'), {
      params: Promise.resolve({ id: 'org-1' }),
    })
    expect(response.status).toBe(404)
  })

  it('returns 401 when unauthenticated', async () => {
    mockRequireAuth.mockRejectedValue(new AuthError())
    const response = await GET(new NextRequest('http://localhost'), {
      params: Promise.resolve({ id: 'org-1' }),
    })
    expect(response.status).toBe(401)
  })
})
