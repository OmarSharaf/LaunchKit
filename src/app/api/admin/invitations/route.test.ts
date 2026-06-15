/**
 * @jest-environment node
 */
import { mockUser } from '@/test-utils'
import { ForbiddenError } from '@/lib/errors'

const mockRequireAdminApi = jest.fn()
const mockFindMany = jest.fn()
const mockCount = jest.fn()

jest.mock('@/lib/admin-api', () => ({
  requireAdminApi: () => mockRequireAdminApi(),
  handleAdminError: (err: unknown) => {
    if (err instanceof ForbiddenError) {
      return Response.json({ error: err.message }, { status: 403 })
    }
    return null
  },
  AdminFeatureDisabledError: class AdminFeatureDisabledError extends Error {},
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    invitation: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      count: (...args: unknown[]) => mockCount(...args),
    },
  },
}))

import { GET } from './route'

describe('GET /api/admin/invitations', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAdminApi.mockResolvedValue(mockUser)
    mockFindMany.mockResolvedValue([])
    mockCount.mockResolvedValue(0)
  })

  it('returns invitations list', async () => {
    const request = new Request(
      'http://localhost/api/admin/invitations?status=PENDING'
    )
    const response = await GET(request)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.invitations).toEqual([])
  })
})
