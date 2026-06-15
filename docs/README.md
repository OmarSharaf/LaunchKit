# Launch Kit documentation

<p align="center">
  <a href="https://nextjs.org"><img style="background:#fff;border-radius:8px;padding:6px"  src="./assets/logos/nextdotjs.svg" width="36" alt="Next.js" /></a>
  <a href="https://supabase.com"><img style="background:#fff;border-radius:8px;padding:6px"  src="./assets/logos/supabase.svg" width="36" alt="Supabase" /></a>
  <a href="https://stripe.com"><img style="background:#fff;border-radius:8px;padding:6px"  src="./assets/logos/stripe.svg" width="36" alt="Stripe" /></a>
</p>

Index for adopters, customers, and operators. The same hub is available in the running app at **`/docs`**.

---

## Start here

| Doc                                    | Who it's for      | Description                                         |
| -------------------------------------- | ----------------- | --------------------------------------------------- |
| [ARCHITECTURE.md](./ARCHITECTURE.md)   | Everyone          | Marketing → auth → dashboard → billing → admin      |
| [MARKETING.md](./MARKETING.md)         | Founders / growth | Landing page, CTAs, customer journey, customization |
| [CUSTOMIZATION.md](./CUSTOMIZATION.md) | Developers        | Branding, env vars, demo data, feature flags        |
| [UI_UX.md](./UI_UX.md)                 | Designers / devs  | Theme presets, dashboard shell, marketing UX        |

---

## Product areas

| Doc                        | Description                              |
| -------------------------- | ---------------------------------------- |
| [BILLING.md](./BILLING.md) | Stripe, Whop, PayPal setup and webhooks  |
| [ADMIN.md](./ADMIN.md)     | Platform admin console and `/demo/admin` |
| [CI_CD.md](./CI_CD.md)     | GitHub Actions and deployment            |

---

## Security & community

| Doc             | Location                                       |
| --------------- | ---------------------------------------------- |
| Security policy | [../SECURITY.md](../SECURITY.md)               |
| Contributing    | [../CONTRIBUTING.md](../CONTRIBUTING.md)       |
| Changelog       | [../CHANGELOG.md](../CHANGELOG.md)             |
| Code of conduct | [../CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md) |

---

## Live previews (no login)

| URL              | What you see             |
| ---------------- | ------------------------ |
| `/`              | Marketing website        |
| `/docs`          | In-app documentation hub |
| `/demo`          | Customer dashboard       |
| `/demo/billing`  | Subscriber billing UI    |
| `/demo/team`     | Team management UI       |
| `/demo/settings` | Settings & org UI        |
| `/demo/admin`    | Platform admin UI        |
| `/design-system` | Component reference      |

---

## Customer journey (quick)

1. **`/`** — hero, pricing, FAQ
2. **`/demo/*`** — preview app UI without signup
3. **`/auth/register?plan=pro`** — create account with plan context
4. **`/dashboard/billing`** — subscribe via Stripe / Whop / PayPal
5. **`/dashboard`** — daily use (team, analytics, settings)

Operators: **`/dashboard/admin`** with `PLATFORM_ADMIN_EMAILS` — see [ADMIN.md](./ADMIN.md).

---

## Route reference

### Public

`/`, `/docs`, `/design-system`, `/demo`, `/demo/billing`, `/demo/team`, `/demo/settings`, `/demo/admin`, `/demo/analytics`, `/auth/login`, `/auth/register`, `/privacy`, `/terms`

### Authenticated customers

`/dashboard`, `/dashboard/billing`, `/dashboard/settings`, `/dashboard/team`, `/dashboard/analytics`, `/dashboard/audit` (feature flag)

### Operators

`/dashboard/admin` — requires `FEATURE_ADMIN_DASHBOARD=true` and `PLATFORM_ADMIN_EMAILS`

---

## Assets

SVG logos for README and docs: [assets/README.md](./assets/README.md) · [assets/logo-grids.md](./assets/logo-grids.md)
