// relative in-app paths only — blocks //evil.com style open redirects
export function getSafeRedirectPath(
  target: string | null | undefined,
  fallback = '/dashboard'
): string {
  if (!target || typeof target !== 'string') return fallback

  const trimmed = target.trim()
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return fallback

  try {
    const parsed = new URL(trimmed, 'http://localhost')
    if (parsed.hostname !== 'localhost') return fallback
    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return fallback
  }
}
