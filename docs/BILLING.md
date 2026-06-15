# Billing & Payment Gateways

<p align="center">
  <a href="https://stripe.com" title="Stripe — default"><img style="background:#fff;border-radius:8px;padding:6px"  src="../assets/logos/stripe.svg" width="56" alt="Stripe" /></a>
  &nbsp;&nbsp;
  <a href="https://whop.com" title="Whop — optional"><img style="background:#fff;border-radius:8px;padding:6px"  src="../assets/logos/whop.svg" width="56" alt="Whop" /></a>
  &nbsp;&nbsp;
  <a href="https://www.paypal.com" title="PayPal — optional"><img style="background:#fff;border-radius:8px;padding:6px"  src="../assets/logos/paypal.svg" width="56" alt="PayPal" /></a>
</p>

Launch Kit supports **multiple payment providers** for organization subscriptions. Stripe is the default; **Whop** and **PayPal** are optional alternatives that can be enabled side by side.

Users choose their preferred gateway on the billing page (`/dashboard/billing`) when more than one provider is configured.

**From marketing:** Pricing on `/` links to `/auth/register?plan=` → after signup users land on `/dashboard/billing?plan=` with the matching plan highlighted. Preview the billing UI at `/demo/billing` without signing in. See [MARKETING.md](./MARKETING.md).

---

## Architecture overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     /dashboard/billing                          │
│  BillingActions — payment method picker (Stripe / Whop / PayPal) │
└────────────┬────────────────────┬────────────────────┬──────────┘
             │                    │                    │
             ▼                    ▼                    ▼
   POST /api/stripe/checkout  POST /api/whop/checkout  POST /api/paypal/checkout
             │                    │                    │
             ▼                    ▼                    ▼
          Stripe              Whop API            PayPal REST API
             │                    │                    │
             ▼                    ▼                    ▼
   POST /api/webhooks/stripe  POST /api/webhooks/whop  POST /api/webhooks/paypal
             │                    │                    │
             └────────────────────┴────────────────────┘
                                  │
                                  ▼
                         Prisma → Subscription
                         (paymentProvider: STRIPE | WHOP | PAYPAL)
```

**Design principles:**

- Billing is **organization-scoped** (not per-user).
- Only **ADMIN** or **SUPER_ADMIN** members can start checkout or open billing portals.
- Each provider syncs subscription state via **webhooks** into the shared `Subscription` model.
- Webhook handlers are **idempotent** (duplicate events are skipped).

---

## Database schema

### `PaymentProvider` enum

```prisma
enum PaymentProvider {
  STRIPE
  WHOP
  PAYPAL
}
```

### Organization

| Field              | Provider | Purpose                            |
| ------------------ | -------- | ---------------------------------- |
| `stripeCustomerId` | Stripe   | Stripe customer ID                 |
| `whopMemberId`     | Whop     | Whop member ID after first payment |
| `paypalPayerId`    | PayPal   | PayPal payer ID                    |

### Plan

| Field                | Provider | Purpose                    |
| -------------------- | -------- | -------------------------- |
| `stripePriceIdMonth` | Stripe   | Stripe Price ID (monthly)  |
| `stripePriceIdYear`  | Stripe   | Stripe Price ID (yearly)   |
| `whopPlanId`         | Whop     | Pre-created Whop plan ID   |
| `paypalPlanId`       | PayPal   | Pre-created PayPal plan ID |

### Subscription

| Field                  | Provider | Purpose                         |
| ---------------------- | -------- | ------------------------------- |
| `paymentProvider`      | All      | Which gateway owns subscription |
| `stripeSubscriptionId` | Stripe   | Stripe subscription ID          |
| `whopMembershipId`     | Whop     | Whop membership ID              |
| `paypalSubscriptionId` | PayPal   | PayPal subscription ID          |

### Webhook idempotency tables

| Table                   | Provider |
| ----------------------- | -------- |
| `stripe_webhook_events` | Stripe   |
| `whop_webhook_events`   | Whop     |
| `paypal_webhook_events` | PayPal   |

### Migrations

| Migration                        | Description                                       |
| -------------------------------- | ------------------------------------------------- |
| `20250615000000_recommendations` | API keys, Stripe webhook idempotency              |
| `20250615143000_whop_payment`    | Whop fields, `PaymentProvider` enum, Whop events  |
| `20250615150000_paypal_payment`  | PayPal fields, `PAYPAL` enum value, PayPal events |

Apply all migrations:

```bash
npm run db:migrate:prod
npm run db:seed
```

---

## Environment variables

See [`.env.example`](../.env.example) for the full list. Payment-related variables:

### Stripe (default)

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER_MONTH=price_...
STRIPE_PRICE_PRO_MONTH=price_...
STRIPE_PRICE_ENTERPRISE_MONTH=price_...
```

### Whop (optional)

```env
WHOP_API_KEY=whop_...
WHOP_WEBHOOK_SECRET=whsec_...
WHOP_COMPANY_ID=biz_...
WHOP_PRODUCT_ID=prod_...          # optional — for inline plan creation
WHOP_PLAN_STARTER_MONTH=plan_...
WHOP_PLAN_PRO_MONTH=plan_...
WHOP_PLAN_ENTERPRISE_MONTH=plan_...
# WHOP_CHECKOUT_BASE_URL=https://whop.com
# WHOP_API_BASE_URL=https://sandbox-api.whop.com/api/v1
```

Whop is enabled when `WHOP_API_KEY` and `WHOP_COMPANY_ID` are set.

### PayPal (optional)

```env
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_WEBHOOK_ID=...
PAYPAL_MODE=sandbox              # or live
PAYPAL_PLAN_STARTER_MONTH=P-...
PAYPAL_PLAN_PRO_MONTH=P-...
PAYPAL_PLAN_ENTERPRISE_MONTH=P-...
# PAYPAL_API_BASE_URL=https://api-m.sandbox.paypal.com
# PAYPAL_MANAGE_URL=https://www.sandbox.paypal.com/myaccount/autopay/
```

PayPal is enabled when `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` are set.

---

## Stripe

### Files

| File                                   | Purpose                                            |
| -------------------------------------- | -------------------------------------------------- |
| `src/lib/stripe.ts`                    | SDK client, checkout, portal, webhook verification |
| `src/app/api/stripe/checkout/route.ts` | Create Checkout session                            |
| `src/app/api/stripe/portal/route.ts`   | Billing portal session                             |
| `src/app/api/webhooks/stripe/route.ts` | Webhook handler                                    |

### Local webhooks

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Webhook events

| Event                           | Action                                                 |
| ------------------------------- | ------------------------------------------------------ |
| `checkout.session.completed`    | Create/update subscription (`paymentProvider: STRIPE`) |
| `customer.subscription.updated` | Sync status and period dates                           |
| `customer.subscription.deleted` | Mark `CANCELED`                                        |
| `invoice.payment_failed`        | Mark `PAST_DUE`                                        |

---

## Whop

[Whop](https://whop.com) provides hosted checkout with 100+ payment methods. Integration uses the official [`@whop/sdk`](https://docs.whop.com/developer/api/quickstart) package.

### Files

| File                                 | Purpose                                            |
| ------------------------------------ | -------------------------------------------------- |
| `src/lib/whop.ts`                    | SDK client, checkout configuration, webhook unwrap |
| `src/app/api/whop/checkout/route.ts` | Create checkout configuration → redirect URL       |
| `src/app/api/whop/portal/route.ts`   | Redirect to Whop `manage_url`                      |
| `src/app/api/webhooks/whop/route.ts` | Webhook handler                                    |

### Checkout flow

1. Admin selects **Whop** on the billing page and clicks **Start trial**.
2. `POST /api/whop/checkout` creates a Whop checkout configuration:
   - Uses `plan.whopPlanId` if set, **or**
   - Creates an inline renewal plan (30-day billing, 14-day trial) via `WHOP_PRODUCT_ID`.
3. User is redirected to Whop's hosted `purchase_url`.
4. Metadata `{ organizationId, planId }` is attached for webhook mapping.

### Webhook setup

1. Go to [Whop Dashboard → Developer → Webhooks](https://whop.com/dashboard).
2. URL: `https://your-domain.com/api/webhooks/whop`
3. API version: **v1**
4. Subscribe to:
   - `membership.activated`
   - `membership.deactivated`
   - `membership.cancel_at_period_end_changed`
   - `payment.failed`

### Webhook events

| Event                                     | Action                                        |
| ----------------------------------------- | --------------------------------------------- |
| `membership.activated`                    | Upsert subscription (`paymentProvider: WHOP`) |
| `membership.deactivated`                  | Mark `CANCELED`                               |
| `membership.cancel_at_period_end_changed` | Update `cancelAtPeriodEnd`                    |
| `payment.failed`                          | Mark `PAST_DUE`                               |

### Sandbox

Use [sandbox.whop.com](https://sandbox.whop.com) and set `WHOP_API_BASE_URL` / `WHOP_CHECKOUT_BASE_URL` accordingly.

---

## PayPal

Integration uses the PayPal **Subscriptions REST API** via native `fetch` (no extra npm dependency).

### Files

| File                                   | Purpose                                            |
| -------------------------------------- | -------------------------------------------------- |
| `src/lib/paypal.ts`                    | OAuth, subscription creation, webhook verification |
| `src/app/api/paypal/checkout/route.ts` | Create subscription → approval URL                 |
| `src/app/api/paypal/portal/route.ts`   | Redirect to PayPal autopay management              |
| `src/app/api/webhooks/paypal/route.ts` | Webhook handler                                    |

### Setup

1. Create a [PayPal Developer](https://developer.paypal.com/dashboard/) app.
2. Create **Products** and **Subscription billing plans** in the dashboard.
3. Copy plan IDs (`P-...`) into env vars and run `npm run db:seed`.

### Checkout flow

1. Admin selects **PayPal** and clicks **Start trial**.
2. `POST /api/paypal/checkout` calls `POST /v1/billing/subscriptions` with:
   - `plan_id` from `plan.paypalPlanId`
   - `custom_id` encoded as `{organizationId}|{planId}`
3. User is redirected to PayPal's `approve` link.
4. On return, webhooks sync the subscription.

### Webhook setup

1. [PayPal Developer Dashboard → Webhooks](https://developer.paypal.com/dashboard/)
2. URL: `https://your-domain.com/api/webhooks/paypal`
3. Subscribe to:
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.UPDATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.EXPIRED`
   - `BILLING.SUBSCRIPTION.SUSPENDED`
   - `BILLING.SUBSCRIPTION.PAYMENT.FAILED`
4. Copy the webhook ID to `PAYPAL_WEBHOOK_ID`.

### Webhook events

| Event                                        | Action                                          |
| -------------------------------------------- | ----------------------------------------------- |
| `BILLING.SUBSCRIPTION.ACTIVATED`             | Upsert subscription (`paymentProvider: PAYPAL`) |
| `BILLING.SUBSCRIPTION.UPDATED`               | Sync status and period dates                    |
| `BILLING.SUBSCRIPTION.CANCELLED` / `EXPIRED` | Mark `CANCELED`                                 |
| `BILLING.SUBSCRIPTION.SUSPENDED`             | Mark `PAST_DUE`                                 |
| `BILLING.SUBSCRIPTION.PAYMENT.FAILED`        | Mark `PAST_DUE`                                 |

### Sandbox vs live

| Mode                | API base                           | Manage URL                                          |
| ------------------- | ---------------------------------- | --------------------------------------------------- |
| `sandbox` (default) | `https://api-m.sandbox.paypal.com` | `https://www.sandbox.paypal.com/myaccount/autopay/` |
| `live`              | `https://api-m.paypal.com`         | `https://www.paypal.com/myaccount/autopay/`         |

---

## API routes reference

| Method | Route                  | Purpose                      |
| ------ | ---------------------- | ---------------------------- |
| `POST` | `/api/stripe/checkout` | Stripe Checkout session      |
| `POST` | `/api/stripe/portal`   | Stripe Billing Portal        |
| `POST` | `/api/webhooks/stripe` | Stripe webhooks              |
| `POST` | `/api/whop/checkout`   | Whop hosted checkout         |
| `POST` | `/api/whop/portal`     | Whop membership management   |
| `POST` | `/api/webhooks/whop`   | Whop webhooks                |
| `POST` | `/api/paypal/checkout` | PayPal subscription approval |
| `POST` | `/api/paypal/portal`   | PayPal autopay management    |
| `POST` | `/api/webhooks/paypal` | PayPal webhooks              |

All checkout and portal routes require an authenticated **admin** of the target organization.

---

## UI: Billing page

`src/components/billing/billing-actions.tsx` renders:

- **Payment method picker** when multiple gateways are enabled and the org has no active subscription.
- **Plan cards** filtered by the selected provider (Stripe needs `stripePriceIdMonth`, PayPal needs `paypalPlanId`, Whop is available when Whop is enabled).
- **Manage subscription** button routed to the correct portal based on `subscription.paymentProvider`.

`src/app/dashboard/billing/page.tsx` passes provider flags from `isWhopEnabled()` and `isPayPalEnabled()`.

---

## Database connection for migrations

Prisma migrations use **`DIRECT_URL`** (not the pooler). For Supabase:

```env
# App runtime — transaction pooler (port 6543)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"

# Migrations — direct connection (port 5432, user is postgres)
DIRECT_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
```

**Common mistake:** pointing `DIRECT_URL` at the pooler host with a `postgres.[ref]` username on port 5432. That causes:

```
FATAL: tenant/user postgres.[ref] not found
```

For local development, both URLs can point at local Postgres:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ci?schema=public
DIRECT_URL=postgresql://postgres:postgres@localhost:5432/ci?schema=public
```

Then run:

```bash
npm run db:migrate:prod
npm run db:seed
```

---

## Tests

Colocated Jest tests cover the payment integrations:

| Test file                                   | Coverage            |
| ------------------------------------------- | ------------------- |
| `src/lib/stripe.test.ts`                    | Stripe helpers      |
| `src/lib/whop.test.ts`                      | Whop helpers        |
| `src/lib/paypal.test.ts`                    | PayPal helpers      |
| `src/app/api/stripe/checkout/route.test.ts` | Stripe checkout API |
| `src/app/api/whop/checkout/route.test.ts`   | Whop checkout API   |
| `src/app/api/paypal/checkout/route.test.ts` | PayPal checkout API |
| `src/app/api/webhooks/stripe/route.test.ts` | Stripe webhooks     |
| `src/app/api/webhooks/whop/route.test.ts`   | Whop webhooks       |
| `src/app/api/webhooks/paypal/route.test.ts` | PayPal webhooks     |

Run payment-related tests:

```bash
npm test -- --testPathPattern="stripe|whop|paypal|billing"
```

---

## Production checklist

- [ ] Separate Stripe / Whop / PayPal apps for dev and production
- [ ] All webhook URLs registered in each provider dashboard
- [ ] `DIRECT_URL` uses Supabase **direct** host for migrations
- [ ] Plan IDs synced via `npm run db:seed` after setting env vars
- [ ] Webhook secrets stored server-side only (never `NEXT_PUBLIC_*`)
- [ ] Review [SECURITY.md](../SECURITY.md) billing section

---

## Dependencies added

| Package     | Purpose                              |
| ----------- | ------------------------------------ |
| `@whop/sdk` | Whop REST API + webhook verification |

PayPal uses native `fetch` against the REST API (no additional package).
