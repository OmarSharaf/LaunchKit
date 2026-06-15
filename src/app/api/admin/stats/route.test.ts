/**
 * @jest-environment node
 */
import { mockUser } from '@/test-utils'
import { AuthError, ForbiddenError } from '@/lib/errors'

const mockRequireAdminApi = jest.fn()
const mockCount = jest.fn()

jest.mock('@/lib/admin-api', () => ({
  requireAdminApi: () => mockRequireAdminApi(),
  handleAdminError: (err: unknown) => {
    if (err instanceof AuthError) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (err instanceof ForbiddenError) {
      return Response.json({ error: err.message }, { status: 403 })
    }
    return null
  },
  AdminFeatureDisabledError: class AdminFeatureDisabledError extends Error {},
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    organization: { count: (...args: unknown[]) => mockCount(...args) },
    user: { count: (...args: unknown[]) => mockCount(...args) },
    subscription: { count: (...args: unknown[]) => mockCount(...args) },
    auditLog: { count: (...args: unknown[]) => mockCount(...args) },
  },
}))

import { GET } from './route'

describe('GET /api/admin/stats', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAdminApi.mockResolvedValue(mockUser)
    mockCount.mockResolvedValue(5)
  })

  it('returns platform stats for platform admin', async () => {
    const response = await GET()
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.organizations).toBe(5)
    expect(data.signupsLast7Days).toBe(5)
  })

  it('returns 403 for non platform admin', async () => {
    mockRequireAdminApi.mockRejectedValue(
      new ForbiddenError('Platform admin access required')
    )
    const response = await GET()
    expect(response.status).toBe(403)
  })

  it('returns 401 when unauthenticated', async () => {
    mockRequireAdminApi.mockRejectedValue(new AuthError())
    const response = await GET()
    expect(response.status).toBe(401)
  })
})
