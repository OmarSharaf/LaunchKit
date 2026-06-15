import { render, screen } from '@testing-library/react'
import RegisterPage, { metadata } from './page'

jest.mock('@/components/auth/register-form', () => ({
  RegisterForm: () => <div data-testid="register-form" />,
}))

describe('RegisterPage', () => {
  it('renders register page content', async () => {
    const ui = await RegisterPage({ searchParams: Promise.resolve({}) })
    render(ui)
    expect(
      screen.getByRole('heading', { name: /create an account/i })
    ).toBeInTheDocument()
    expect(screen.getByTestId('register-form')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute(
      'href',
      '/auth/login'
    )
    expect(screen.getByRole('link', { name: /terms/i })).toHaveAttribute(
      'href',
      '/terms'
    )
  })

  it('shows selected plan badge from query', async () => {
    const ui = await RegisterPage({
      searchParams: Promise.resolve({ plan: 'pro' }),
    })
    render(ui)
    expect(screen.getByText(/selected plan: pro/i)).toBeInTheDocument()
  })

  it('exports metadata', () => {
    expect(metadata.title).toBe('Create Account')
  })
})
