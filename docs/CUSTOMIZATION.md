# Customizing Launch Kit

<p align="center">
  <a href="https://nextjs.org"><img style="background:#fff;border-radius:8px;padding:6px"  src="../assets/logos/nextdotjs.svg" width="36" alt="Next.js" /></a>
  <a href="https://supabase.com"><img style="background:#fff;border-radius:8px;padding:6px"  src="../assets/logos/supabase.svg" width="36" alt="Supabase" /></a>
  <a href="https://prisma.io"><img style="background:#fff;border-radius:8px;padding:6px"  src="../assets/logos/prisma.svg" width="36" alt="Prisma" /></a>
  <a href="https://tailwindcss.com"><img style="background:#fff;border-radius:8px;padding:6px"  src="../assets/logos/tailwindcss.svg" width="36" alt="Tailwind" /></a>
  <a href="https://stripe.com"><img style="background:#fff;border-radius:8px;padding:6px"  src="../assets/logos/stripe.svg" width="36" alt="Stripe" /></a>
  <a href="https://whop.com"><img style="background:#fff;border-radius:8px;padding:6px"  src="../assets/logos/whop.svg" width="36" alt="Whop" /></a>
  <a href="https://www.paypal.com"><img style="background:#fff;border-radius:8px;padding:6px"  src="../assets/logos/paypal.svg" width="36" alt="PayPal" /></a>
  <a href="https://resend.com"><img style="background:#fff;border-radius:8px;padding:6px"  src="../assets/logos/resend.svg" width="36" alt="Resend" /></a>
</p>

This guide covers the first changes most teams make when turning the boilerplate into their product.

## 1. Branding (5 minutes)

Copy `.env.example` to `.env.local` and set:

| Variable                       | Purpose                                               |
| ------------------------------ | ----------------------------------------------------- |
| `NEXT_PUBLIC_APP_NAME`         | Product name in UI and emails                         |
| `NEXT_PUBLIC_APP_TAGLINE`      | Hero headline on the marketing site                   |
| `NEXT_PUBLIC_APP_DESCRIPTION`  | Meta description and Open Graph                       |
| `NEXT_PUBLIC_PRODUCT_CATEGORY` | Eyebrow text above the hero                           |
| `NEXT_PUBLIC_APP_URL`          | Canonical URL (required for auth callbacks)           |
| `NEXT_PUBLIC_SUPPORT_EMAIL`    | Support and legal contact                             |
| `NEXT_PUBLIC_APP_LOGO_URL`     | Optional image logo (see `brand-logo.tsx`)            |
| `NEXT_PUBLIC_THEME_PRESET`     | Color preset: `default`, `ocean`, `violet`, `emerald` |

Defaults live in `src/lib/site.ts` if env vars are unset.

Preview tokens and components at **`/design-system`**. See **[UI_UX.md](./UI_UX.md)** for dashboard UX patterns.

## 2. Marketing content (10 minutes)

Edit **`src/lib/marketing.ts`** — a single file controls:

- Stats bar, features, pricing plans, FAQ
- Navigation and footer links
- Testimonials and product showcase cards

Supporting copy (auth panel, built-with strip, plan comparison) is in **`src/lib/marketing-content.ts`**.

## 3. Demo dashboard (5 minutes)

Edit **`src/lib/demo-data.ts`** for the public `/demo` experience:

- `DEMO_USER`, `DEMO_ORG`, `DEMO_ORGANIZATIONS`
- Activity feed, metrics, billing preview, team list

No authentication required — ideal for sales demos. Coach marks and demo hints guide adopters through the layout.

## 4. Stripe pricing (15 minutes)

<img style="background:#fff;border-radius:8px;padding:6px"  src="../assets/logos/stripe.svg" width="28" alt="Stripe" align="left" />

1. Create products/prices in the [Stripe Dashboard](https://dashboard.stripe.com/products).
2. Add price IDs to `.env.local` (`STRIPE_PRICE_STARTER_MONTH`, etc.).
3. Run `npm run db:seed` to sync plans to the database.

## 5. Whop pricing (optional, 15 minutes)

<img style="background:#fff;border-radius:8px;padding:6px"  src="../assets/logos/whop.svg" width="28" alt="Whop" align="left" />

1. Create a [Whop](https://whop.com) account and company.
2. Create plans in the dashboard or via API.
3. Add `WHOP_API_KEY`, `WHOP_COMPANY_ID`, and plan IDs to `.env.local`.
4. Register webhook: `https://your-domain.com/api/webhooks/whop`
5. Run `npm run db:seed`.

See **[docs/BILLING.md](./BILLING.md)** for details.

## 6. PayPal pricing (optional, 15 minutes)

<img style="background:#fff;border-radius:8px;padding:6px"  src="../assets/logos/paypal.svg" width="28" alt="PayPal" align="left" />

1. Create a [PayPal Developer](https://developer.paypal.com/dashboard/) app.
2. Create subscription billing plans (`P-...` IDs).
3. Add `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`, and plan IDs to `.env.local`.
4. Register webhook: `https://your-domain.com/api/webhooks/paypal`
5. Run `npm run db:seed`.

See **[docs/BILLING.md](./BILLING.md)** for details.

## 7. Email templates (10 minutes)

Invitation emails are sent from `src/lib/email.ts`. Update copy and set `RESEND_API_KEY` + `EMAIL_FROM` in env.

## 8. Feature flags

Enable or disable features without code changes:

```bash
FEATURE_AUDIT_LOG=true
FEATURE_API_KEYS=true
FEATURE_ADMIN_DASHBOARD=true
```

Implemented in `src/lib/feature-flags.ts`.

## 9. Security checklist before launch

- [ ] Separate Supabase/Stripe/Whop/PayPal projects for dev and production
- [ ] Production URL in Supabase redirect URLs (`/api/auth/callback`)
- [ ] Stripe webhook → `/api/webhooks/stripe`
- [ ] Whop webhook → `/api/webhooks/whop` (if enabled)
- [ ] PayPal webhook → `/api/webhooks/paypal` (if enabled)
- [ ] `DIRECT_URL` uses Supabase direct host for migrations (see [BILLING.md](./BILLING.md))
- [ ] Review `SECURITY.md` deployment checklist
- [ ] Replace placeholder text on `/privacy` and `/terms` with counsel-reviewed policies
- [ ] Set `NEXT_PUBLIC_SENTRY_DSN` for error tracking

## 10. Health monitoring

Uptime checks can ping `GET /api/health` — returns database connectivity status.

## 11. API keys & audit log

- **API keys**: Settings → API keys (admin only). Keys are hashed at rest; shown once at creation.
- **Authenticating API routes**: Use `requireApiKey` from `src/lib/api-key-auth.ts` in your own route handlers:

```typescript
import { requireApiKey } from '@/lib/api-key-auth'
import { ForbiddenError } from '@/lib/errors'

export async function GET(request: NextRequest) {
  try {
    const apiKey = await requireApiKey(request)
    // apiKey.organizationId scopes the request
    return NextResponse.json({ organizationId: apiKey.organizationId })
  } catch (err) {
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ error: err.message }, { status: 403 })
    }
    throw err
  }
}
```

Clients send the key via `X-Api-Key: lk_...` or `Authorization: Bearer lk_...`.

- **Audit log**: Dashboard → Audit log. Tracks invites, billing, org changes, and key management.

## 12. Platform admin backend

Set `PLATFORM_ADMIN_EMAILS` in `.env.local` (comma-separated). Those accounts get access to **Dashboard → Admin** when `FEATURE_ADMIN_DASHBOARD=true`.

Platform admins can:

- List and search **all users** (signups)
- **Suspend**, reactivate, or **delete** users (removes Supabase auth + database row)
- List and **delete organizations**
- Toggle **new signups** on/off (`platform_settings.signupsEnabled`)
- View platform-wide metrics and audit events via API

Admin API routes (all require platform admin session):

| Method    | Route                           | Purpose                    |
| --------- | ------------------------------- | -------------------------- |
| GET       | `/api/admin/stats`              | Platform metrics           |
| GET       | `/api/admin/users`              | Paginated user list        |
| PATCH     | `/api/admin/users/[id]`         | Update status / admin flag |
| DELETE    | `/api/admin/users/[id]`         | Delete user                |
| GET       | `/api/admin/organizations`      | Paginated org list         |
| DELETE    | `/api/admin/organizations/[id]` | Delete organization        |
| GET/PATCH | `/api/admin/settings`           | Signup toggle              |
| GET       | `/api/admin/audit-logs`         | Platform audit trail       |
| GET       | `/api/admin/invitations`        | All team invitations       |
| DELETE    | `/api/admin/invitations/[id]`   | Revoke pending invite      |
| GET       | `/api/admin/subscriptions`      | Billing & MRR overview     |
| GET       | `/api/admin/users/[id]`         | User detail + memberships  |

Run `npm run db:migrate` after pulling to add `UserStatus` and `platform_settings` tables.

## 13. Common file map

| Goal                       | File(s)                                                                                 |
| -------------------------- | --------------------------------------------------------------------------------------- |
| Platform admin             | `src/lib/platform-admin.ts`, `src/app/api/admin/*`, `/dashboard/admin`                  |
| UI / UX patterns           | [UI_UX.md](./UI_UX.md), `src/components/dashboard/*`, `src/styles/globals.css`          |
| Billing / payment gateways | [BILLING.md](./BILLING.md), `src/lib/stripe.ts`, `src/lib/whop.ts`, `src/lib/paypal.ts` |
| Doc logos (SVG)            | [assets/README.md](./assets/README.md), [assets/logo-grids.md](./assets/logo-grids.md)  |
| Auth flows                 | `src/components/auth/*`, `src/lib/auth.ts`                                              |
| Dashboard layout           | `src/components/dashboard/dashboard-shell.tsx`                                          |
| Multi-tenancy              | `src/lib/organizations.ts`, `prisma/schema.prisma`                                      |
| Validation schemas         | `src/lib/validations.ts`                                                                |
| Middleware / route guards  | `src/middleware.ts`                                                                     |

Run `npm run ci` before deploying to verify lint, types, tests, and build.
