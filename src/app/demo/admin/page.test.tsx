import { render, screen } from '@testing-library/react'
import DemoAdminPage from './page'

describe('DemoAdminPage', () => {
  it('renders admin demo with sample metrics and notice', () => {
    render(<DemoAdminPage />)
    expect(
      screen.getByRole('heading', { name: 'Platform admin' })
    ).toBeInTheDocument()
    expect(screen.getByText('48')).toBeInTheDocument()
    expect(screen.getByText(/admin demo mode/i)).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /users/i })).toBeInTheDocument()
  })
})
