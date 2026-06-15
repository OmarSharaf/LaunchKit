import { resetRateLimits, rateLimit } from './rate-limit'

describe('rateLimit', () => {
  beforeEach(() => {
    resetRateLimits()
  })

  it('allows requests under the limit', () => {
    expect(rateLimit('test-key', 3, 60_000).success).toBe(true)
    expect(rateLimit('test-key', 3, 60_000).success).toBe(true)
    expect(rateLimit('test-key', 3, 60_000).success).toBe(true)
  })

  it('blocks requests over the limit', () => {
    rateLimit('blocked', 2, 60_000)
    rateLimit('blocked', 2, 60_000)
    const result = rateLimit('blocked', 2, 60_000)
    expect(result.success).toBe(false)
    expect(result.retryAfter).toBeGreaterThan(0)
  })

  it('isolates keys', () => {
    rateLimit('a', 1, 60_000)
    expect(rateLimit('a', 1, 60_000).success).toBe(false)
    expect(rateLimit('b', 1, 60_000).success).toBe(true)
  })
})
