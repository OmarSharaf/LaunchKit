import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ApiKeysManager } from './api-keys-manager'

const mockToast = jest.fn()

jest.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}))

describe('ApiKeysManager', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    global.fetch = jest.fn()
  })

  it('renders empty state', () => {
    render(<ApiKeysManager organizationId="org-1" initialKeys={[]} />)
    expect(screen.getByText(/no api keys yet/i)).toBeInTheDocument()
  })

  it('creates an api key', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        apiKey: {
          id: 'key-1',
          name: 'Prod',
          prefix: 'lk_abc',
          key: 'lk_secret',
          createdAt: new Date().toISOString(),
        },
      }),
    })

    render(<ApiKeysManager organizationId="org-1" initialKeys={[]} />)
    fireEvent.change(screen.getByPlaceholderText(/key name/i), {
      target: { value: 'Prod' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create api key/i }))

    await waitFor(() => {
      expect(screen.getByText('lk_secret')).toBeInTheDocument()
    })
  })

  it('revokes an api key', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    })

    render(
      <ApiKeysManager
        organizationId="org-1"
        initialKeys={[
          {
            id: 'key-1',
            name: 'Prod',
            prefix: 'lk_abc',
            lastUsedAt: null,
            createdAt: new Date().toISOString(),
          },
        ]}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: /revoke prod/i }))
    await waitFor(() => {
      expect(screen.queryByText('Prod')).not.toBeInTheDocument()
    })
  })

  it('shows error toast on create failure', async () => {
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Failed' }),
    })

    render(<ApiKeysManager organizationId="org-1" initialKeys={[]} />)
    fireEvent.change(screen.getByPlaceholderText(/key name/i), {
      target: { value: 'Prod' },
    })
    fireEvent.click(screen.getByRole('button', { name: /create api key/i }))

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(
        expect.objectContaining({ variant: 'destructive' })
      )
    })
  })
})
