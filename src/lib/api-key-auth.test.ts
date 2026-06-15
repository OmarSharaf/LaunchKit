/**
 * @jest-environment node
 */
import { ForbiddenError } from '@/lib/errors'

const mockValidateApiKey = jest.fn()

jest.mock('@/lib/api-keys', () => ({
  validateApiKey: (...args: unknown[]) => mockValidateApiKey(...args),
}))

import {
  API_KEY_HEADER,
  extractApiKeyFromRequest,
  requireApiKey,
} from './api-key-auth'

function makeRequest(headers: Record<string, string> = {}) {
  return {
    headers: {
      get: (name: string) => headers[name.toLowerCase()] ?? null,
    },
  } as Parameters<typeof extractApiKeyFromRequest>[0]
}

describe('api-key-auth', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('reads key from X-Api-Key header', () => {
    const key = extractApiKeyFromRequest(
      makeRequest({ [API_KEY_HEADER]: 'lk_header' })
    )
    expect(key).toBe('lk_header')
  })

  it('reads lk_ token from Authorization bearer', () => {
    const key = extractApiKeyFromRequest(
      makeRequest({ authorization: 'Bearer lk_bearer' })
    )
    expect(key).toBe('lk_bearer')
  })

  it('ignores non-lk bearer tokens', () => {
    const key = extractApiKeyFromRequest(
      makeRequest({ authorization: 'Bearer jwt-token' })
    )
    expect(key).toBeNull()
  })

  it('requireApiKey returns validated key', async () => {
    const record = { id: 'key-1', organization: { id: 'org-1' } }
    mockValidateApiKey.mockResolvedValue(record)

    const result = await requireApiKey(
      makeRequest({ [API_KEY_HEADER]: 'lk_valid' })
    )
    expect(result).toEqual(record)
    expect(mockValidateApiKey).toHaveBeenCalledWith('lk_valid')
  })

  it('requireApiKey throws when header missing', async () => {
    await expect(requireApiKey(makeRequest())).rejects.toThrow(ForbiddenError)
  })

  it('requireApiKey throws when key invalid', async () => {
    mockValidateApiKey.mockResolvedValue(null)
    await expect(
      requireApiKey(makeRequest({ [API_KEY_HEADER]: 'lk_bad' }))
    ).rejects.toThrow('Invalid or expired API key')
  })
})
