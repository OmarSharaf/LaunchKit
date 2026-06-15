import { type NextRequest } from 'next/server'
import { validateApiKey } from '@/lib/api-keys'
import { ForbiddenError } from '@/lib/errors'

export const API_KEY_HEADER = 'x-api-key'
const BEARER_PREFIX = 'Bearer '

export function extractApiKeyFromRequest(request: NextRequest): string | null {
  const headerKey = request.headers.get(API_KEY_HEADER)?.trim()
  if (headerKey) return headerKey

  const authorization = request.headers.get('authorization')
  if (!authorization?.startsWith(BEARER_PREFIX)) return null

  const token = authorization.slice(BEARER_PREFIX.length).trim()
  // ignore random JWTs — we only issue lk_ keys
  return token.startsWith('lk_') ? token : null
}

export async function requireApiKey(request: NextRequest) {
  const rawKey = extractApiKeyFromRequest(request)
  if (!rawKey) {
    throw new ForbiddenError('API key required')
  }

  const apiKey = await validateApiKey(rawKey)
  if (!apiKey) {
    throw new ForbiddenError('Invalid or expired API key')
  }

  return apiKey
}
