interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

export interface RateLimitResult {
  success: boolean
  retryAfter?: number
}

// in-memory limiter — fine for a single Node process; use Redis at scale
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true }
  }

  if (bucket.count >= limit) {
    return {
      success: false,
      retryAfter: Math.ceil((bucket.resetAt - now) / 1000),
    }
  }

  bucket.count++
  return { success: true }
}

// test helper
export function resetRateLimits() {
  buckets.clear()
}
