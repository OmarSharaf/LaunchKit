jest.mock('react', () => {
  const actual = jest.requireActual<typeof import('react')>('react')
  return {
    ...actual,
    cache: <T extends (...args: unknown[]) => unknown>(fn: T) => fn,
  }
})

import { redirect } from 'next/navigation'
import { createMockSupabaseAuth } from '@/test-utils'

const mockGetUser = jest.fn()
const mockFindUnique = jest.fn()
const mockFindFirst = jest.fn()

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: { findUnique: (...args: unknown[]) => mockFindUnique(...args) },
    organizationMember: {
      findFirst: (...args: unknown[]) => mockFindFirst(...args),
    },
  },
}))

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import {
  getDbUser,
  getOrganizationMembership,
  getUser,
  requireAuth,
  requireAuthApi,
  requireGuest,
  requireOrgMember,
  requireOrgRole,
} from './auth'
import { mockDbUser, mockUser } from '@/test-utils'

const mockCreateClient = createClient as jest.MockedFunction<
  typeof createClient
>

describe('auth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockCreateClient.mockResolvedValue({
      auth: createMockSupabaseAuth({ getUser: mockGetUser }),
    } as never)
  })

  describe('getUser', () => {
    it('returns user when authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser } })
      const user = await getUser()
      expect(user).toEqual(mockUser)
    })

    it('returns null when not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const user = await getUser()
      expect(user).toBeNull()
    })
  })

  describe('getDbUser', () => {
    it('returns database user when authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser } })
      mockFindUnique.mockResolvedValue(mockDbUser)
      const user = await getDbUser()
      expect(user).toEqual(mockDbUser)
    })

    it('returns null when not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const user = await getDbUser()
      expect(user).toBeNull()
      expect(mockFindUnique).not.toHaveBeenCalled()
    })
  })

  describe('requireAuth', () => {
    it('returns user when authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser } })
      const user = await requireAuth()
      expect(user).toEqual(mockUser)
    })

    it('redirects when not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      await requireAuth()
      expect(redirect).toHaveBeenCalledWith('/auth/login')
    })
  })

  describe('requireAuthApi', () => {
    it('returns user when authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser } })
      const user = await requireAuthApi()
      expect(user).toEqual(mockUser)
    })

    it('throws AuthError when not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      await expect(requireAuthApi()).rejects.toThrow('Unauthorized')
    })
  })

  describe('requireGuest', () => {
    it('redirects when authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser } })
      await requireGuest()
      expect(redirect).toHaveBeenCalledWith('/dashboard')
    })

    it('does nothing when guest', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      await requireGuest()
      expect(redirect).not.toHaveBeenCalled()
    })
  })

  describe('getOrganizationMembership', () => {
    it('returns membership for slug', async () => {
      mockGetUser.mockResolvedValue({ data: { user: mockUser } })
      const membership = { id: 'mem-1', role: 'ADMIN' }
      mockFindFirst.mockResolvedValue(membership)

      const result = await getOrganizationMembership('test-org')
      expect(result).toEqual(membership)
    })

    it('returns null when not authenticated', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })
      const result = await getOrganizationMembership('test-org')
      expect(result).toBeNull()
    })
  })

  describe('requireOrgRole', () => {
    it('returns membership when role matches', async () => {
      const membership = {
        role: 'ADMIN',
        organization: { id: 'org-1', name: 'Test' },
      }
      mockFindFirst.mockResolvedValue(membership)

      const result = await requireOrgRole('org-1', 'user-1')
      expect(result).toEqual(membership)
    })

    it('throws ForbiddenError when not a member', async () => {
      mockFindFirst.mockResolvedValue(null)
      await expect(requireOrgRole('org-1', 'user-1')).rejects.toThrow(
        'Admin access required'
      )
    })
  })

  describe('requireOrgMember', () => {
    it('throws ForbiddenError when not a member', async () => {
      mockFindFirst.mockResolvedValue(null)
      await expect(requireOrgMember('org-1', 'user-1')).rejects.toThrow(
        'Organization access required'
      )
    })
  })
})
