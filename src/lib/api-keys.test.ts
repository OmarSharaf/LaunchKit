import { generateApiKey, hashApiKey, validateApiKey } from './api-keys'

const mockFindUnique = jest.fn()
const mockUpdate = jest.fn()

jest.mock('@/lib/prisma', () => ({
  prisma: {
    apiKey: {
      findUnique: (...args: unknown[]) => mockFindUnique(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
  },
}))

describe('api-keys', () => {
  it('generates keys with lk_ prefix', () => {
    const { rawKey, keyHash, prefix } = generateApiKey()
    expect(rawKey.startsWith('lk_')).toBe(true)
    expect(prefix).toBe(rawKey.slice(0, 11))
    expect(keyHash).toBe(hashApiKey(rawKey))
  })

  it('hashes consistently', () => {
    const hash = hashApiKey('lk_testkey')
    expect(hash).toBe(hashApiKey('lk_testkey'))
    expect(hash).not.toBe(hashApiKey('lk_other'))
  })

  it('validates api key and updates last used', async () => {
    const key = {
      id: 'key-1',
      expiresAt: null,
      organization: { id: 'org-1' },
    }
    mockFindUnique.mockResolvedValue(key)
    mockUpdate.mockResolvedValue(key)

    const result = await validateApiKey('lk_valid')
    expect(result).toEqual(key)
    expect(mockUpdate).toHaveBeenCalled()
  })

  it('returns null for expired keys', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'key-1',
      expiresAt: new Date('2020-01-01'),
      organization: { id: 'org-1' },
    })

    const result = await validateApiKey('lk_expired')
    expect(result).toBeNull()
  })

  it('returns null for unknown keys', async () => {
    mockFindUnique.mockResolvedValue(null)
    expect(await validateApiKey('lk_unknown')).toBeNull()
  })
})
