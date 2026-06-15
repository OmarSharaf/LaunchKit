/**
 * @jest-environment node
 */
import { mockUser } from '@/test-utils'
import { AuthError, ForbiddenError } from '@/lib/errors'

const mockRequireAdminApi = jest.fn()
const mockGetPlatformSettings = jest.fn()
const mockUpdatePlatformSettings = jest.fn()
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

jest.mock('@/lib/platform-settings', () => ({
  getPlatformSettings: () => mockGetPlatformSettings(),
  updatePlatformSettings: (...args: unknown[]) =>
    mockUpdatePlatformSettings(...args),
}))

jest.mock('@/lib/audit', () => ({
  createAuditLog: (...args: unknown[]) => mockCreateAuditLog(...args),
}))

import { GET, PATCH } from './route'

describe('/api/admin/settings', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAdminApi.mockResolvedValue(mockUser)
    mockGetPlatformSettings.mockResolvedValue({
      signupsEnabled: true,
      updatedAt: new Date('2025-06-01'),
    })
    mockUpdatePlatformSettings.mockResolvedValue({
      id: 'settings-1',
      signupsEnabled: false,
      updatedAt: new Date('2025-06-02'),
    })
  })

  it('GET returns platform settings', async () => {
    const response = await GET()
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.signupsEnabled).toBe(true)
  })

  it('PATCH toggles signups', async () => {
    const request = new Request('http://localhost/api/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify({ signupsEnabled: false }),
    })

    const response = await PATCH(request as never)
    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.signupsEnabled).toBe(false)
    expect(mockCreateAuditLog).toHaveBeenCalled()
  })

  it('returns 401 when unauthenticated', async () => {
    mockRequireAdminApi.mockRejectedValue(new AuthError())
    const response = await GET()
    expect(response.status).toBe(401)
  })
})
