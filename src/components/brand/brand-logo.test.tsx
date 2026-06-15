import { render, screen } from '@testing-library/react'
import { BrandLogo } from './brand-logo'

describe('BrandLogo', () => {
  it('renders logo with text by default', () => {
    render(<BrandLogo />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/')
    expect(screen.getByText('Launch Kit')).toBeInTheDocument()
  })

  it('renders icon-only and custom sizes', () => {
    const { rerender } = render(
      <BrandLogo showText={false} size="sm" href="/dashboard" />
    )
    expect(screen.queryByText('Launch Kit')).not.toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/dashboard')

    rerender(<BrandLogo size="lg" className="custom" />)
    expect(screen.getByText('Launch Kit')).toBeInTheDocument()
  })
})
