import { fireEvent, render, screen } from '@testing-library/react'
import { mockUser } from '@/test-utils'

const mockRequireAuth = jest.fn()
const mockGetDbUserWithMemberships = jest.fn()

jest.mock('@/lib/auth', () => ({
  requireAuth: () => mockRequireAuth(),
  getDbUserWithMemberships: () => mockGetDbUserWithMemberships(),
  ADMIN_ROLES: ['ADMIN', 'SUPER_ADMIN'],
}))

jest.mock('@/lib/feature-flags', () => ({
  isFeatureEnabled: () => false,
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    apiKey: { findMany: jest.fn().mockResolvedValue([]) },
  },
}))

jest.mock('@/components/settings/create-organization-form', () => ({
  CreateOrganizationForm: () => <div data-testid="create-org-form" />,
}))

jest.mock('@/components/settings/invite-member-form', () => ({
  InviteMemberForm: () => null,
}))

import SettingsPage, { metadata } from './page'

describe('SettingsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAuth.mockResolvedValue(mockUser)
  })

  it('renders profile fields', async () => {
    mockGetDbUserWithMemberships.mockResolvedValue({
      name: 'Jane Doe',
      memberships: [],
    })

    render(await SettingsPage())
    expect(
      screen.getByRole('heading', { name: /settings/i })
    ).toBeInTheDocument()
    expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('tab', { name: /organization/i }))
    expect(
      screen.getByText(/not part of any organization/i)
    ).toBeInTheDocument()
  })

  it('handles missing profile and email values', async () => {
    mockRequireAuth.mockResolvedValue({ ...mockUser, email: null })
    mockGetDbUserWithMemberships.mockResolvedValue({
      name: null,
      memberships: [],
    })

    render(await SettingsPage())
    expect(screen.getByLabelText(/full name/i)).toHaveValue('')
    expect(screen.getByLabelText(/email/i)).toHaveValue('')
  })

  it('lists organizations with singular member label', async () => {
    mockGetDbUserWithMemberships.mockResolvedValue({
      name: 'Jane',
      memberships: [
        {
          role: 'MEMBER',
          organization: {
            id: 'org-1',
            name: 'Solo',
            members: [{ id: '1' }],
          },
        },
      ],
    })

    render(await SettingsPage())
    fireEvent.click(screen.getByRole('tab', { name: /organization/i }))
    expect(screen.getByText(/1 member/i)).toBeInTheDocument()
  })

  it('lists organizations with member counts', async () => {
    mockGetDbUserWithMemberships.mockResolvedValue({
      name: 'Jane',
      memberships: [
        {
          role: 'ADMIN',
          organization: {
            id: 'org-1',
            name: 'Acme',
            members: [{ id: '1' }, { id: '2' }],
          },
        },
      ],
    })

    render(await SettingsPage())
    fireEvent.click(screen.getByRole('tab', { name: /organization/i }))
    expect(screen.getByText('Acme')).toBeInTheDocument()
    expect(screen.getByText(/2 members/i)).toBeInTheDocument()
    expect(screen.getByText('admin')).toBeInTheDocument()
  })

  it('exports metadata', () => {
    expect(metadata.title).toBe('Settings')
  })
})
