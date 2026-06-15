# Platform admin guide

Launch Kit includes a **platform admin console** for operators who run the deployment — not to be confused with **organization roles** (`ADMIN` / `SUPER_ADMIN`), which manage a single workspace.

**Docs hub:** `/docs` in the app · [docs/README.md](./README.md) · [ARCHITECTURE.md](./ARCHITECTURE.md)

| Scope                  | Who                                        | Where                                            |
| ---------------------- | ------------------------------------------ | ------------------------------------------------ |
| **Organization admin** | Member with `ADMIN` or `SUPER_ADMIN` role  | `/dashboard/billing`, team invites, org settings |
| **Platform admin**     | Operator listed in `PLATFORM_ADMIN_EMAILS` | `/dashboard/admin`, `/api/admin/*`               |

---

## Quick start

### 1. Enable the feature

```env
FEATURE_ADMIN_DASHBOARD=true
PLATFORM_ADMIN_EMAILS=you@example.com,ops@yourcompany.com
```

Restart the dev server after changing env vars.

### 2. Sign in

Register or sign in with an email listed in `PLATFORM_ADMIN_EMAILS`. On login, `syncPlatformAdminFlag` sets `User.isPlatformAdmin = true` in the database.

### 3. Open the console

- Sidebar: **Admin** (shield icon)
- Direct URL: `/dashboard/admin`

If the feature flag is off or you are not a platform admin, the page redirects to `/dashboard`.

---

## Public admin demo (no login)

Visitors can explore the admin UI without credentials:

| URL                                               | Description                             |
| ------------------------------------------------- | --------------------------------------- |
| [`/demo/admin`](http://localhost:3000/demo/admin) | Platform admin console with sample data |

The demo reuses the same `AdminConsole` component as production. Data comes from `src/lib/demo-admin-data.ts`. Suspend, delete, revoke, and settings saves are **no-ops** — a banner explains demo mode.

Marketing links:

- Demo banner → **Admin demo**
- Footer → **Admin demo** (`DEMO_ADMIN_PATH` in `src/lib/site.ts`)

To customize sample users, orgs, and metrics, edit `src/lib/demo-admin-data.ts`.

---

## Dashboard tabs

The admin console has six tabs:

### Users & signups

- Search by email or name
- Filter by status: Active, Suspended, Banned
- Filter signups from the last 7 days
- Expand a row for memberships, audit counts, and API key stats
- **Actions**: Suspend, ban, reactivate, grant/revoke platform admin, delete user

### Organizations

- Search by name or slug
- View member count, plan, and creation date
- **Actions**: Delete organization (cascades related data)

### Invitations

- Tabs: Pending, Accepted, Expired
- Cross-org view of all team invites
- **Actions**: Revoke pending invitations

### Billing & subscriptions

- Estimated MRR and active subscription count
- Table of subscriptions with plan, status, payment provider (Stripe, Whop, PayPal), renewal date

### Audit log

- Platform-wide trail of admin actions, billing events, and org changes
- Requires `FEATURE_AUDIT_LOG=true` for new events to be recorded

### Platform settings

- **Allow new signups** toggle (`platform_settings.signupsEnabled`)
  - When disabled: new email registration and new OAuth sign-ups are blocked
  - Existing users can still sign in

---

## User statuses

| Status      | Behavior                                                               |
| ----------- | ---------------------------------------------------------------------- |
| `ACTIVE`    | Normal access                                                          |
| `SUSPENDED` | Blocked at dashboard layout; optional `suspendedReason` shown on login |
| `BANNED`    | Blocked at dashboard layout; generic ban message                       |

Status is enforced in the auth callback and `assertUserCanAccessApp` in `src/lib/platform-admin.ts`.

---

## API reference

All routes require:

1. `FEATURE_ADMIN_DASHBOARD=true`
2. Authenticated session
3. Platform admin (`requirePlatformAdmin`)

Disabled feature returns **404**. Unauthorized returns **401**. Non-admin returns **403**.

| Method | Route                           | Purpose                                                                   |
| ------ | ------------------------------- | ------------------------------------------------------------------------- |
| GET    | `/api/admin/stats`              | Platform metrics (orgs, users, signups, subs, audit)                      |
| GET    | `/api/admin/users`              | Paginated user list (`search`, `status`, `recentDays`, `limit`, `cursor`) |
| GET    | `/api/admin/users/[id]`         | User detail + memberships + stats                                         |
| PATCH  | `/api/admin/users/[id]`         | Update `status`, `suspendedReason`, `isPlatformAdmin`                     |
| DELETE | `/api/admin/users/[id]`         | Delete user (Supabase auth + DB)                                          |
| GET    | `/api/admin/organizations`      | Paginated org list (`search`, `limit`, `cursor`)                          |
| DELETE | `/api/admin/organizations/[id]` | Delete organization                                                       |
| GET    | `/api/admin/invitations`        | Invitations (`status`, `limit`)                                           |
| DELETE | `/api/admin/invitations/[id]`   | Revoke pending invite                                                     |
| GET    | `/api/admin/subscriptions`      | Billing overview + subscription rows                                      |
| GET    | `/api/admin/audit-logs`         | Platform audit trail (`limit`, `cursor`)                                  |
| GET    | `/api/admin/settings`           | Read `signupsEnabled`                                                     |
| PATCH  | `/api/admin/settings`           | Update `signupsEnabled`                                                   |

Shared helpers: `src/lib/admin-api.ts` (`requireAdminApi`, `handleAdminError`).

---

## Authorization model

```
PLATFORM_ADMIN_EMAILS (env)
        │
        ▼
syncPlatformAdminFlag on login ──► User.isPlatformAdmin = true
        │
        ▼
isPlatformAdmin(userId, email)
  ├── DB flag isPlatformAdmin === true  → allow
  └── email in PLATFORM_ADMIN_EMAILS    → allow
```

You can also set `isPlatformAdmin` manually in the database for break-glass access:

```sql
UPDATE "User" SET "isPlatformAdmin" = true WHERE email = 'you@example.com';
```

Removing an email from `PLATFORM_ADMIN_EMAILS` does **not** automatically revoke an existing DB flag — use the admin UI or SQL to revoke.

---

## Signup gating

When `signupsEnabled` is `false`:

- Email registration routes reject new accounts
- OAuth first-time sign-ups are blocked in the auth callback
- Platform admins can re-enable signups from **Settings** tab

Settings are stored in the `platform_settings` table (singleton row).

---

## Security notes

- Platform admin is **separate** from org `SUPER_ADMIN` — org admins cannot access `/api/admin/*` unless they are also platform admins
- Admin API returns 404 when the feature flag is off (no route enumeration)
- Destructive actions (delete user/org) require confirmation in the UI
- User delete removes the Supabase auth user and database row
- See [SECURITY.md](../SECURITY.md) for CSP, rate limiting, and env var handling

Recommended production setup:

```env
FEATURE_ADMIN_DASHBOARD=true
FEATURE_AUDIT_LOG=true
PLATFORM_ADMIN_EMAILS=ops@yourcompany.com
```

Use a small, audited list of operator emails. Prefer SSO for production if you extend auth.

---

## File map

| Area             | Path                                                      |
| ---------------- | --------------------------------------------------------- |
| Admin UI page    | `src/app/dashboard/admin/page.tsx`                        |
| Public demo      | `src/app/demo/admin/page.tsx`                             |
| Demo data        | `src/lib/demo-admin-data.ts`                              |
| Console + panels | `src/components/admin/*`                                  |
| API routes       | `src/app/api/admin/*`                                     |
| Auth helpers     | `src/lib/platform-admin.ts`, `src/lib/admin-api.ts`       |
| Settings         | `src/lib/platform-settings.ts`                            |
| Feature flag     | `FEATURE_ADMIN_DASHBOARD` in `src/lib/feature-flags.ts`   |
| Schema           | `User.status`, `User.isPlatformAdmin`, `PlatformSettings` |

---

## Troubleshooting

### Admin link missing from sidebar

- Set `FEATURE_ADMIN_DASHBOARD=true` and restart
- Confirm your email is in `PLATFORM_ADMIN_EMAILS`
- Sign out and sign back in so `syncPlatformAdminFlag` runs
- Check `User.isPlatformAdmin` in the database

### Redirected from `/dashboard/admin`

- Feature flag off → enable `FEATURE_ADMIN_DASHBOARD`
- Not a platform admin → add email to env or set DB flag

### `/api/admin/*` returns 404

- Feature flag is disabled (intentional — route hidden)

### Signups still work after disabling

- Confirm PATCH to `/api/admin/settings` succeeded
- Check `platform_settings.signupsEnabled` in the database
- Restart is not required; settings are read per request

### Demo admin actions do nothing

- Expected — demo mode disables mutations. Use a real platform admin account for live operations.

---

## Related docs

- [ARCHITECTURE.md](./ARCHITECTURE.md) — marketing, auth, customer app, and admin map
- [MARKETING.md](./MARKETING.md) — landing page and public demos
- [CUSTOMIZATION.md](./CUSTOMIZATION.md) — feature flags and env vars
- [SECURITY.md](../SECURITY.md) — RBAC and platform admin guards
- [UI_UX.md](./UI_UX.md) — dashboard shell and admin tab UX
- [BILLING.md](./BILLING.md) — org-level billing (separate from admin billing overview)
