import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { createMockSupabaseAuth } from '@/test-utils'

const mockCreateClient = jest.fn()

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockCreateClient(),
}))

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}))

import { RegisterForm } from './register-form'

describe('RegisterForm', () => {
  const signUp = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    signUp.mockResolvedValue({ error: null })
    mockCreateClient.mockReturnValue({
      auth: createMockSupabaseAuth({ signUp }),
    })
    global.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ signupsEnabled: true }),
    }) as jest.Mock
  })

  it('renders registration fields', () => {
    render(<RegisterForm />)
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
  })

  it('submits valid registration', async () => {
    render(<RegisterForm />)

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'John Doe' },
    })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'Password1' },
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'Password1' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(signUp).toHaveBeenCalled()
      expect(screen.getByText(/check your email/i)).toBeInTheDocument()
    })
  })

  it('shows sign up error', async () => {
    signUp.mockResolvedValue({ error: { message: 'Email taken' } })
    render(<RegisterForm />)

    fireEvent.change(screen.getByLabelText(/full name/i), {
      target: { value: 'John Doe' },
    })
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'john@example.com' },
    })
    fireEvent.change(screen.getByLabelText(/^password$/i), {
      target: { value: 'Password1' },
    })
    fireEvent.change(screen.getByLabelText(/confirm password/i), {
      target: { value: 'Password1' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => {
      expect(screen.getByText('Email taken')).toBeInTheDocument()
    })
  })

  it('toggles password visibility', () => {
    render(<RegisterForm />)

    const passwordInput = screen.getByLabelText(/^password$/i)
    fireEvent.click(screen.getByLabelText(/show password/i))
    expect(passwordInput).toHaveAttribute('type', 'text')
  })
})
