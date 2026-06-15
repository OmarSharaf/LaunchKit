import { fireEvent, render, screen, within } from '@testing-library/react'
import { MarketingHeader } from './marketing-header'

jest.mock('@/components/layout/theme-toggle', () => ({
  ThemeToggle: () => <button type="button">Theme</button>,
}))

describe('MarketingHeader', () => {
  it('renders navigation links', () => {
    render(<MarketingHeader />)
    expect(
      screen.getAllByRole('link', { name: /features/i })[0]
    ).toHaveAttribute('href', '#features')
    expect(screen.getByRole('link', { name: /^demo$/i })).toHaveAttribute(
      'href',
      '/demo'
    )
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute(
      'href',
      '/auth/login'
    )
    expect(
      screen.getAllByRole('link', { name: /get started/i })[0]
    ).toHaveAttribute('href', '/auth/register')
  })

  it('opens mobile navigation and shows section links', () => {
    render(<MarketingHeader />)
    fireEvent.click(screen.getByLabelText(/open menu/i))

    const [, mobileNav] = screen.getAllByRole('navigation')
    const mobile = within(mobileNav)

    expect(
      mobile.getByRole('link', { name: /^how it works$/i })
    ).toHaveAttribute('href', '#how-it-works')
    expect(
      mobile.getByRole('link', { name: /get started free/i })
    ).toHaveAttribute('href', '/auth/register')

    fireEvent.click(screen.getByLabelText(/close menu/i))
    expect(screen.getByLabelText(/open menu/i)).toBeInTheDocument()
  })
})
