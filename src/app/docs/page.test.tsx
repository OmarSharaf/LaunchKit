import { render, screen } from '@testing-library/react'
import DocsPage from './page'

jest.mock('@/components/layout/marketing-header', () => ({
  MarketingHeader: () => <header>Header</header>,
}))
jest.mock('@/components/layout/marketing-footer', () => ({
  MarketingFooter: () => <footer>Footer</footer>,
}))

describe('DocsPage', () => {
  it('renders documentation hub with guides and previews', () => {
    render(<DocsPage />)
    expect(
      screen.getByRole('heading', { name: 'Documentation' })
    ).toBeInTheDocument()
    expect(screen.getByText('Architecture')).toBeInTheDocument()
    expect(screen.getByText('Marketing site')).toBeInTheDocument()
    expect(screen.getByText('Platform admin')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Live demo' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Start free trial' })
    ).toHaveAttribute('href', '/auth/register')
  })
})
