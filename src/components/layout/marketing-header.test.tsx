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
    expect(
      screen.getAllByRole('link', { name: /live demo/i })[0]
    ).toHaveAttribute('href', '/demo')
    expect(screen.getByRole('link', { name: /get started/i })).toHaveAttribute(
      'href',
      '/auth/register'
    )
  })

  it('toggles mobile navigation and closes via nav actions', () => {
    render(<MarketingHeader />)
    fireEvent.click(screen.getByLabelText(/open menu/i))

    const [, mobileNav] = screen.getAllByRole('navigation')
    const mobile = within(mobileNav)

    fireEvent.click(mobile.getByRole('link', { name: /^features$/i }))
    fireEvent.click(screen.getByLabelText(/open menu/i))

    fireEvent.click(mobile.getByRole('link', { name: /^product$/i }))
    fireEvent.click(screen.getByLabelText(/open menu/i))

    fireEvent.click(mobile.getByRole('link', { name: /^pricing$/i }))
    fireEvent.click(screen.getByLabelText(/open menu/i))

    fireEvent.click(mobile.getByRole('link', { name: /^faq$/i }))
    fireEvent.click(screen.getByLabelText(/open menu/i))

    fireEvent.click(mobile.getByRole('link', { name: /live demo/i }))
    fireEvent.click(screen.getByLabelText(/open menu/i))

    fireEvent.click(screen.getByLabelText(/open menu/i))
  })
})
