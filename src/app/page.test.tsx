import { render, screen } from '@testing-library/react'
import HomePage from './page'

jest.mock('@/components/layout/theme-toggle', () => ({
  ThemeToggle: () => null,
}))

describe('HomePage', () => {
  it('renders full marketing landing page', () => {
    render(<HomePage />)

    expect(
      screen.getByRole('heading', {
        name: /ship your saas in days, not months/i,
      })
    ).toBeInTheDocument()
    expect(screen.getByText('Dashboard shell')).toBeInTheDocument()
    expect(screen.getAllByText('Stripe').length).toBeGreaterThan(0)
    expect(screen.getByText('Clone & configure')).toBeInTheDocument()
    expect(screen.getByText(/ready to fork and ship/i)).toBeInTheDocument()
  })
})
