/**
 * @jest-environment node
 */
import { mockUser } from '@/test-utils'
import { AuthError, ForbiddenError } from '@/lib/errors'

const mockRequireAdminApi = jest.fn()
const mockFindUnique = jest.fn()
const mockUpdate = jest.fn()
const mockCreateAuditLog = jest.fn()

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
    user: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}))

jest.mock('@/lib/audit', () => ({
  createAuditLog: (...args: unknown[]) => mockCreateAuditLog(...args),
}))

import { PATCH } from './route'

describe('PATCH /api/admin/users/[id]', () => {
  const params = Promise.resolve({ id: 'user-target' })

  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAdminApi.mockResolvedValue(mockUser)
    mockFindUnique.mockResolvedValue({
      id: 'user-target',
      email: 'target@example.com',
    })
    mockUpdate.mockResolvedValue({
      id: 'user-target',
      email: 'target@example.com',
      name: 'Target',
      status: 'SUSPENDED',
      suspendedReason: 'Abuse',
      isPlatformAdmin: false,
      createdAt: new Date('2025-01-01'),
    })
  })

  it('updates user status for platform admin', async () => {
    const request = new Request(
      'http://localhost/api/admin/users/user-target',
      {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'SUSPENDED',
          suspendedReason: 'Abuse',
        }),
      }
    )

    const response = await PATCH(request as never, { params })
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.user.status).toBe('SUSPENDED')
    expect(mockCreateAuditLog).toHaveBeenCalled()
  })

  it('rejects self-modification', async () => {
    const request = new Request('http://localhost/api/admin/users/user-123', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'SUSPENDED' }),
    })

    const response = await PATCH(request as never, {
      params: Promise.resolve({ id: mockUser.id }),
    })
    expect(response.status).toBe(400)
  })

  it('returns 403 for non platform admin', async () => {
    mockRequireAdminApi.mockRejectedValue(
      new ForbiddenError('Platform admin access required')
    )

    const request = new Request(
      'http://localhost/api/admin/users/user-target',
      {
        method: 'PATCH',
        body: JSON.stringify({ status: 'SUSPENDED' }),
      }
    )

    const response = await PATCH(request as never, { params })
    expect(response.status).toBe(403)
  })
})
