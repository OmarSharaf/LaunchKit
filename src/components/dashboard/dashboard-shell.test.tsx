import { fireEvent, render, screen } from '@testing-library/react'
import { DashboardShell } from './dashboard-shell'

const mockPathname = jest.fn()

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}))

jest.mock('@/components/layout/theme-toggle', () => ({
  ThemeToggle: () => <button type="button">Theme</button>,
}))

jest.mock('@/components/dashboard/org-switcher', () => ({
  OrgSwitcher: () => null,
}))

jest.mock('@/components/dashboard/dashboard-command-menu', () => ({
  DashboardCommandMenu: () => null,
}))

jest.mock('@/components/dashboard/mobile-bottom-nav', () => ({
  MobileBottomNav: () => null,
}))

describe('DashboardShell', () => {
  const signOutAction = jest.fn()

  beforeEach(() => {
    mockPathname.mockReturnValue('/dashboard')
  })

  it('renders demo mode with exit link', () => {
    mockPathname.mockReturnValue('/demo')
    render(
      <DashboardShell
        userName="Alex Rivera"
        userEmail="alex@acme.co"
        orgName="Acme Corporation"
        planName="Pro"
        basePath="/demo"
        isDemo
      >
        <div>Demo content</div>
      </DashboardShell>
    )

    expect(screen.getByText('Demo content')).toBeInTheDocument()
    expect(screen.getByText(/live demo/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /exit demo/i })).toHaveAttribute(
      'href',
      '/'
    )
  })

  it('omits sign out control when action is not provided', () => {
    render(
      <DashboardShell userName="User" userEmail="u@example.com">
        <div>Content</div>
      </DashboardShell>
    )
    expect(
      screen.queryByRole('button', { name: /sign out/i })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('link', { name: /exit demo/i })
    ).not.toBeInTheDocument()
  })

  it('renders sign out when not in demo mode', () => {
    render(
      <DashboardShell
        userName="Jane Doe"
        userEmail="jane@example.com"
        signOutAction={signOutAction}
      >
        <div>Content</div>
      </DashboardShell>
    )

    const form = screen
      .getByRole('button', { name: /sign out/i })
      .closest('form')
    if (form) fireEvent.submit(form)
  })

  it('uses email initial when name is empty', () => {
    render(
      <DashboardShell
        userName=""
        userEmail="z@example.com"
        signOutAction={signOutAction}
      >
        <div>Content</div>
      </DashboardShell>
    )
    expect(screen.getByText('Z')).toBeInTheDocument()
  })

  it('falls back to U when name and email are empty', () => {
    render(
      <DashboardShell userName="" userEmail="" signOutAction={signOutAction}>
        <div>Content</div>
      </DashboardShell>
    )
    expect(screen.getByText('U')).toBeInTheDocument()
  })

  it('shows Free plan when org has no plan name', () => {
    render(
      <DashboardShell
        userName="User"
        userEmail="u@example.com"
        orgName="Acme"
        organizations={[{ id: '1', name: 'Acme', planName: undefined }]}
        activeOrgId="1"
        signOutAction={signOutAction}
      >
        <div>Content</div>
      </DashboardShell>
    )
    expect(screen.getByText('Acme')).toBeInTheDocument()
  })

  it('highlights billing route and toggles mobile menu', () => {
    mockPathname.mockReturnValue('/dashboard/billing')
    render(
      <DashboardShell
        userName="User"
        userEmail="u@example.com"
        signOutAction={signOutAction}
      >
        <div>Content</div>
      </DashboardShell>
    )

    fireEvent.click(screen.getByLabelText(/toggle menu/i))
    fireEvent.click(screen.getAllByRole('link', { name: /settings/i })[0])
    fireEvent.click(screen.getByLabelText(/toggle menu/i))
  })
})
