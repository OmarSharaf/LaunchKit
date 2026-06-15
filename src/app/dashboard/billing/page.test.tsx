import { render, screen } from '@testing-library/react'
import { mockUser } from '@/test-utils'

const mockRequireAuth = jest.fn()
const mockGetDbUserWithMemberships = jest.fn()
const mockPlanFindMany = jest.fn()

jest.mock('@/lib/auth', () => ({
  requireAuth: () => mockRequireAuth(),
  getDbUserWithMemberships: () => mockGetDbUserWithMemberships(),
}))

jest.mock('@/lib/prisma', () => ({
  prisma: {
    plan: { findMany: (...args: unknown[]) => mockPlanFindMany(...args) },
  },
}))

jest.mock('@/lib/whop', () => ({
  isWhopEnabled: () => false,
}))

jest.mock('@/lib/paypal', () => ({
  isPayPalEnabled: () => false,
}))

jest.mock('@/components/billing/billing-actions', () => ({
  BillingActions: () => <div data-testid="billing-actions" />,
}))

jest.mock('@/components/billing/billing-alerts', () => ({
  BillingAlerts: () => null,
}))

import BillingPage, { metadata } from './page'

describe('BillingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireAuth.mockResolvedValue(mockUser)
    mockPlanFindMany.mockResolvedValue([])
  })

  it('renders empty state when no organization', async () => {
    mockGetDbUserWithMemberships.mockResolvedValue({ memberships: [] })
    render(await BillingPage({ searchParams: Promise.resolve({}) }))
    expect(
      screen.getByRole('heading', { name: /billing/i })
    ).toBeInTheDocument()
    expect(screen.getByText(/no organization/i)).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /go to settings/i })
    ).toHaveAttribute('href', '/dashboard/settings')
  })

  it('renders active subscription with cancel notice', async () => {
    mockGetDbUserWithMemberships.mockResolvedValue({
      memberships: [
        {
          organization: {
            name: 'Acme',
            subscription: {
              status: 'ACTIVE',
              cancelAtPeriodEnd: true,
              plan: { name: 'Pro' },
            },
          },
        },
      ],
    })

    render(await BillingPage({ searchParams: Promise.resolve({}) }))
    expect(screen.getByText('Pro')).toBeInTheDocument()
    expect(screen.getByText(/cancels at period end/i)).toBeInTheDocument()
  })

  it('shows active badge when plan name is missing', async () => {
    mockGetDbUserWithMemberships.mockResolvedValue({
      memberships: [
        {
          organization: {
            name: 'Acme',
            subscription: {
              status: 'ACTIVE',
              cancelAtPeriodEnd: false,
              plan: null,
            },
          },
        },
      ],
    })

    render(await BillingPage({ searchParams: Promise.resolve({}) }))
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('renders upgrade prompt without subscription', async () => {
    mockGetDbUserWithMemberships.mockResolvedValue({
      memberships: [{ organization: { name: 'Solo', subscription: null } }],
    })

    render(await BillingPage({ searchParams: Promise.resolve({}) }))
    expect(
      screen.getByText(/start a 14-day free trial on any paid plan/i)
    ).toBeInTheDocument()
  })

  it('exports metadata', () => {
    expect(metadata.title).toBe('Billing')
  })
})
