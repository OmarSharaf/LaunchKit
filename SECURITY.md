# Security Policy

<p align="center">
  <a href="https://supabase.com"><img style="background:#fff;border-radius:8px;padding:6px"  src="docs/assets/logos/supabase.svg" width="36" alt="Supabase" /></a>
  <a href="https://stripe.com"><img style="background:#fff;border-radius:8px;padding:6px"  src="docs/assets/logos/stripe.svg" width="36" alt="Stripe" /></a>
  <a href="https://whop.com"><img style="background:#fff;border-radius:8px;padding:6px"  src="docs/assets/logos/whop.svg" width="36" alt="Whop" /></a>
  <a href="https://www.paypal.com"><img style="background:#fff;border-radius:8px;padding:6px"  src="docs/assets/logos/paypal.svg" width="36" alt="PayPal" /></a>
  <a href="https://sentry.io"><img style="background:#fff;border-radius:8px;padding:6px"  src="docs/assets/logos/sentry.svg" width="36" alt="Sentry" /></a>
  <a href="https://nextjs.org"><img style="background:#fff;border-radius:8px;padding:6px"  src="docs/assets/logos/nextdotjs.svg" width="36" alt="Next.js" /></a>
</p>

## Supported Versions

| Version | Supported              |
| ------- | ---------------------- |
| 1.x     | :white_check_mark: Yes |
| < 1.0   | :x: No                 |

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security vulnerabilities.**

If you discover a security issue, email:

**omarsharaf@msn.com**

Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact (data exposure, privilege escalation, etc.)
- Suggested fix (if you have one)

You can expect:

- An acknowledgment within **48 hours**
- A status update within **7 days** for critical issues
- A patch release when a fix is available

Valid reports may be credited in release notes at your request.

## Scope

This policy covers:

- The Launch Kit application code in this repository (`src/`, `prisma/`, API routes, middleware)
- Default configuration shipped with the project (`next.config.ts`, `jest.config.ts`)

It does **not** cover:

- Your own Supabase, Stripe, Whop, PayPal, or hosting configuration
- Third-party services you integrate beyond the defaults
- The public **`/demo`** route — it intentionally uses mock data and requires no authentication; do not put real customer data there

## Security Measures Built Into Launch Kit

### Authentication & sessions

- Middleware refreshes Supabase sessions on every matched request via `supabase.auth.getUser()` (not `getSession()` alone)
- Protected prefixes: `/dashboard`, `/org`, `/settings`, `/billing` — unauthenticated users redirect to `/auth/login` with `?redirectTo=`
- Authenticated users hitting `/auth/*` redirect to `/dashboard`
- **`/demo` is public** — full dashboard UI preview with static mock data only

### API & billing

- Stripe webhook signature verification on every `POST /api/webhooks/stripe` request
- Whop webhook signature verification via `@whop/sdk` on `POST /api/webhooks/whop`
- PayPal webhook signature verification via PayPal verify API on `POST /api/webhooks/paypal`
- Missing or invalid webhook signatures return `400` without processing the body
- Webhook idempotency tables prevent duplicate event processing (`stripe_webhook_events`, `whop_webhook_events`, `paypal_webhook_events`)
- Checkout and portal routes use `requireOrgRole` (admin roles) before creating sessions
- Zod validation on auth-related form schemas (`src/lib/validations.ts`)
- **Rate limiting** on API routes via `src/middleware.ts` and `src/lib/rate-limit.ts` (configurable windows)

### Server-side secrets

- `SUPABASE_SERVICE_ROLE_KEY` is only used in server-only modules (`src/lib/supabase/server.ts`)
- Never expose service role, Stripe secret, Whop API, or PayPal secret keys in `NEXT_PUBLIC_*` variables

### HTTP headers

Set in `next.config.ts` for all routes:

| Header                      | Value                                                                                                             |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `X-Frame-Options`           | `DENY`                                                                                                            |
| `X-Content-Type-Options`    | `nosniff`                                                                                                         |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`                                                                                 |
| `Permissions-Policy`        | `camera=(), microphone=(), geolocation=()`                                                                        |
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload`                                                                    |
| `Content-Security-Policy`   | Restricts scripts, frames, and `connect-src` to self plus Supabase, Stripe, Whop, PayPal, and Sentry when enabled |

CSP `connect-src` allows Supabase, Stripe, Whop, PayPal, and Sentry ingest endpoints. `frame-src` allows Stripe and PayPal checkout iframes. Tighten or extend these when you add third-party scripts.

### Access control

- Organization role model: `SUPER_ADMIN`, `ADMIN`, `MEMBER` on `OrganizationMember`
- Server helpers in `src/lib/auth.ts`:
  - `requireAuth` / `requireAuthApi` — session required
  - `requireOrgMember` — any org member
  - `requireOrgRole` — admin roles (default `ADMIN` + `SUPER_ADMIN`)
- Throws `ForbiddenError` (403) instead of returning null — use consistent error handling in API routes
- **Platform admin**: `PLATFORM_ADMIN_EMAILS` env + `isPlatformAdmin` flag; `requirePlatformAdmin` guards `/api/admin/*` and `/dashboard/admin`
- Platform admins can suspend users, toggle signups, and delete orgs across the platform
- **API keys**: hashed at rest; validate with `requireApiKey` from `src/lib/api-key-auth.ts` in custom integrations

## Deployment Checklist

When you deploy Launch Kit for production:

1. **Never commit** `.env.local` or production secrets to git
2. Use **separate** Supabase and Stripe projects for development and production
3. **Rotate** `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, and `STRIPE_WEBHOOK_SECRET` if they may have leaked
4. Register production URLs in Supabase **Authentication → URL Configuration** (including `/api/auth/callback`)
5. Point Stripe webhooks to `https://your-domain.com/api/webhooks/stripe` and use the production signing secret
6. Enable **Row Level Security (RLS)** on Supabase tables if clients access the database directly
7. Run `npm audit` regularly and keep dependencies updated

## Sensitive Environment Variables

| Variable                                    | Exposure    | Notes                                                              |
| ------------------------------------------- | ----------- | ------------------------------------------------------------------ |
| `SUPABASE_SERVICE_ROLE_KEY`                 | Server only | Full database access — treat like a root password                  |
| `STRIPE_SECRET_KEY`                         | Server only | Can charge customers and manage subscriptions                      |
| `STRIPE_WEBHOOK_SECRET`                     | Server only | Prevents forged webhook events                                     |
| `WHOP_API_KEY`                              | Server only | Whop API access for checkout and webhooks                          |
| `WHOP_WEBHOOK_SECRET`                       | Server only | Whop webhook signature verification                                |
| `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` | Server only | PayPal subscription and webhook APIs                               |
| `PLATFORM_ADMIN_EMAILS`                     | Server only | Comma-separated emails granted platform admin on login             |
| `DATABASE_URL` / `DIRECT_URL`               | Server only | Direct Postgres access                                             |
| `RESEND_API_KEY`                            | Server only | Can send email from your domain                                    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`             | Public      | Safe for browser with RLS; still scope Supabase policies correctly |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`        | Public      | Expected to be public                                              |

## Supply chain & build provenance

CI and release workflows generate **SLSA build provenance** attestations for `launchkit-build.tar.gz` using [`actions/attest-build-provenance`](https://github.com/actions/attest-build-provenance). Signatures are issued via Sigstore and stored in GitHub’s attestations API.

Verify downloaded release artifacts before deploying:

```bash
gh attestation verify launchkit-build.tar.gz --owner OmarSharaf --repo launchkit
```

See [docs/CI_CD.md](./docs/CI_CD.md#build-provenance-attestations) for details.

## Testing vs. security

The project enforces **100% Jest code coverage** on `src/`. That improves regression safety but is **not** a substitute for security review, penetration testing, or threat modeling of your deployment.
