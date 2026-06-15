import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

const PROTECTED_PREFIXES = ['/dashboard', '/org', '/settings', '/billing']
const AUTH_PREFIXES = ['/auth']

const AUTH_RATE_LIMIT = { limit: 20, windowMs: 60_000 }
const WEBHOOK_RATE_LIMIT = { limit: 100, windowMs: 60_000 }

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  )
}

function applyRateLimit(
  request: NextRequest,
  prefix: string,
  config: { limit: number; windowMs: number }
): NextResponse | null {
  const ip = getClientIp(request)
  const key = `${prefix}:${ip}`
  const result = rateLimit(key, config.limit, config.windowMs)

  if (!result.success) {
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'Retry-After': String(result.retryAfter ?? 60),
        },
      }
    )
  }

  return null
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // throttle brute-force on /auth and webhook floods
  if (pathname.startsWith('/auth')) {
    const limited = applyRateLimit(request, 'auth', AUTH_RATE_LIMIT)
    if (limited) return limited
  }

  if (pathname.startsWith('/api/webhooks/stripe')) {
    const limited = applyRateLimit(request, 'webhook', WEBHOOK_RATE_LIMIT)
    if (limited) return limited
  }

  if (pathname.startsWith('/api/webhooks/whop')) {
    const limited = applyRateLimit(request, 'webhook', WEBHOOK_RATE_LIMIT)
    if (limited) return limited
  }

  if (pathname.startsWith('/api/webhooks/paypal')) {
    const limited = applyRateLimit(request, 'webhook', WEBHOOK_RATE_LIMIT)
    if (limited) return limited
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(
          cookiesToSet: {
            name: string
            value: string
            options: CookieOptions
          }[]
        ) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // getUser() hits Supabase to verify the JWT — don't trust getSession() alone
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  )
  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(url)
  }

  const isAuthRoute = AUTH_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  )
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
