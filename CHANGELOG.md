# Changelog

<p align="center">
  <a href="https://stripe.com"><img style="background:#fff;border-radius:8px;padding:6px"  src="docs/assets/logos/stripe.svg" width="40" alt="Stripe" /></a>
  <a href="https://whop.com"><img style="background:#fff;border-radius:8px;padding:6px"  src="docs/assets/logos/whop.svg" width="40" alt="Whop" /></a>
  <a href="https://www.paypal.com"><img style="background:#fff;border-radius:8px;padding:6px"  src="docs/assets/logos/paypal.svg" width="40" alt="PayPal" /></a>
  <a href="https://nextjs.org"><img style="background:#fff;border-radius:8px;padding:6px"  src="docs/assets/logos/nextdotjs.svg" width="40" alt="Next.js" /></a>
  <a href="https://supabase.com"><img style="background:#fff;border-radius:8px;padding:6px"  src="docs/assets/logos/supabase.svg" width="40" alt="Supabase" /></a>
</p>

All notable changes to [Launch Kit](https://github.com/OmarSharaf/launchkit) are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Whop payment gateway** — optional alternative to Stripe; hosted checkout, webhooks, billing portal (`src/lib/whop.ts`, `/api/whop/*`, `/api/webhooks/whop`)
- **PayPal payment gateway** — optional alternative via Subscriptions REST API; checkout, webhooks, autopay portal (`src/lib/paypal.ts`, `/api/paypal/*`, `/api/webhooks/paypal`)
- **Multi-provider billing UI** — payment method picker on `/dashboard/billing` (Stripe / Whop / PayPal)
- **`PaymentProvider` enum** — `STRIPE`, `WHOP`, `PAYPAL` on subscriptions
- **Database migrations** — `20250615143000_whop_payment`, `20250615150000_paypal_payment`
- **Webhook idempotency** — `whop_webhook_events`, `paypal_webhook_events` tables
- **Billing documentation** — [`docs/BILLING.md`](./docs/BILLING.md)
- **Build provenance attestations** in CI and Release workflows via [`actions/attest-build-provenance@v3`](https://github.com/actions/attest-build-provenance)
- **Live demo dashboard** at `/demo` — public preview of the full dashboard UI (overview, billing, settings) with mock data; no authentication required
- **Demo components:** activity chart, activity feed, metrics grid, preview banner
- **Marketing landing page** sections: stats bar, logo cloud, product showcase, integrations, how-it-works, testimonials, FAQ, CTA
- **Env-driven branding** via `src/lib/site.ts` (`NEXT_PUBLIC_APP_NAME`, tagline, description, product category, support email, developer credit toggle, docs/repo URLs)
- **Centralized marketing content** in `src/lib/marketing.ts` (features, pricing, FAQ, navigation, footer links)
- **Brand components:** `BrandLogo`, shared `MarketingHeader` / `MarketingFooter`
- **Reusable `DashboardShell`** with `basePath`, `isDemo`, and optional `signOutAction` for both real and demo dashboards
- **Legal pages:** `/privacy`, `/terms`
- **Full test suite** with **100% coverage thresholds** (Jest + React Testing Library); colocated `*.test.ts(x)` files across `src/`

### Changed

- Hero and metadata copy aligned with configurable `APP_TAGLINE` and product positioning
- `/dashboard/overview` redirects to `/dashboard`
- `npm test` runs Jest without `--passWithNoTests` (tests are required)

### Documentation

- README, CONTRIBUTING, SECURITY, and CODE_OF_CONDUCT updated to reflect current architecture and routes
- Added [`docs/BILLING.md`](./docs/BILLING.md) — multi-gateway billing setup (Stripe, Whop, PayPal)

---

## [1.0.0] — 2025-01-01

### Added — Authentication

- Email/password sign up and sign in via Supabase Auth
- Google and GitHub OAuth on login/register forms
- Password reset flow (`/auth/forgot-password`)
- OAuth and email-link callback at `/api/auth/callback` with Prisma user sync
- SSR-safe session handling via `@supabase/ssr`
- Middleware protection for `/dashboard`, `/org`, `/settings`, `/billing`

### Added — Multi-tenancy

- Organizations with URL-safe slugs
- Roles: `SUPER_ADMIN`, `ADMIN`, `MEMBER`
- Token-based invitations with expiry
- Organization member relations in Prisma

### Added — Billing

- Stripe Checkout Sessions
- Subscription lifecycle via webhooks
- Billing portal integration
- Webhook events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- Seeded plans: Starter ($9/mo), Pro ($29/mo), Enterprise ($99/mo) via `npm run db:seed`

### Added — Database

- Prisma schema: `User`, `Organization`, `OrganizationMember`, `Invitation`, `Subscription`, `Plan`, `AuditLog`
- Migration tooling and hot-reload-safe Prisma client singleton

### Added — UI & frontend

- Next.js 15 App Router with Server Components
- Auth pages: login, register, forgot password
- Dashboard: overview, billing, settings
- Dark mode via `next-themes`
- shadcn/ui + Radix UI primitives (button, card, input, toast, badge, separator)
- Tailwind CSS design tokens in `src/styles/globals.css`
- Geist Sans / Geist Mono fonts

### Added — Developer experience

- TypeScript 5.6 strict mode
- `@/` path aliases
- ESLint + Prettier + `prettier-plugin-tailwindcss`
- Husky + lint-staged pre-commit hooks
- Jest + React Testing Library configuration
- Documented `.env.example`

### Added — Security

- Security headers in `next.config.ts`
- Stripe webhook signature verification
- Zod validation schemas in `src/lib/validations.ts`
- Server-side auth helpers in `src/lib/auth.ts`
  Omar

---

[Unreleased]: https://github.com/OmarSharaf/launchkit/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/OmarSharaf/launchkit/releases/tag/v1.0.0
