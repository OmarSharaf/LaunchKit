import { render, screen } from '@testing-library/react'
import { mockUser } from '@/test-utils'

const mockRequireAuth = jest.fn()
const mockIsPlatformAdmin = jest.fn()
const mockCount = jest.fn()

jest.mock('@/lib/auth', () => ({
  requireAuth: () => mockRequireAuth(),
}))

jest.mock('@/lib/feature-flags', () => ({
  isFeatureEnabled: () => true,
}))

jest.mock('@/lib/platform-admin', () => ({
  isPlatformAdmin: (...args: unknown[]) => mockIsPlatformAdmin(...args),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    organization: { count: (...args: unknown[]) => mockCount(...args) },
    user: { count: (...args: unknown[]) => mockCount(...args) },
    subscription: { count: (...args: unknown[]) => mockCount(...args) },
    auditLog: { count: (...args: unknown[]) => mockCount(...args) },
    invitation: { count: (...args: unknown[]) => mockCount(...args) },
  },
}))

jest.mock('@/components/admin/admin-console', () => ({
  AdminConsole: ({ overview }: { overview: React.ReactNode }) => (
    <div data-testid="admin-console">{overview}</div>
  ),
}))

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

import AdminPage, { metadata } from './page'

describe('AdminPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAuth.mockResolvedValue(mockUser)
    mockIsPlatformAdmin.mockResolvedValue(true)
    mockCount.mockResolvedValue(10)
  })

  it('renders admin metrics', async () => {
    render(await AdminPage())
    expect(
      screen.getByRole('heading', { name: /platform admin/i })
    ).toBeInTheDocument()
    expect(screen.getByText('Organizations')).toBeInTheDocument()
    expect(screen.getByText('Signups (7d)')).toBeInTheDocument()
  })

  it('exports metadata', () => {
    expect(metadata.title).toBe('Admin')
  })
})
