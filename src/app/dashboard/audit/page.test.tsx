import { render, screen } from '@testing-library/react'
import { mockUser } from '@/test-utils'

const mockRequireAuth = jest.fn()
const mockGetDbUserWithMemberships = jest.fn()
const mockFindMany = jest.fn()

jest.mock('@/lib/auth', () => ({
  requireAuth: () => mockRequireAuth(),
  getDbUserWithMemberships: () => mockGetDbUserWithMemberships(),
}))

jest.mock('@/lib/feature-flags', () => ({
  isFeatureEnabled: () => true,
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    auditLog: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
  },
}))

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

import AuditLogPage, { metadata } from './page'

describe('AuditLogPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAuth.mockResolvedValue(mockUser)
    mockGetDbUserWithMemberships.mockResolvedValue({
      memberships: [{ organization: { id: 'org-1', name: 'Acme' } }],
    })
    mockFindMany.mockResolvedValue([
      {
        id: 'log-1',
        action: 'invitation.created',
        entity: 'invitation',
        entityId: 'inv-1',
        createdAt: new Date(),
        user: { name: 'Alex', email: 'alex@test.com' },
      },
    ])
  })

  it('renders audit log entries', async () => {
    render(await AuditLogPage())
    expect(
      screen.getByRole('heading', { name: /audit log/i })
    ).toBeInTheDocument()
    expect(screen.getByText('invitation.created')).toBeInTheDocument()
  })

  it('exports metadata', () => {
    expect(metadata.title).toBe('Audit Log')
  })
})
