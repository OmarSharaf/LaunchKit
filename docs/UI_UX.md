# UI & UX Guide

<p align="center">
  <a href="https://tailwindcss.com"><img style="background:#fff;border-radius:8px;padding:6px"  src="../assets/logos/tailwindcss.svg" width="40" alt="Tailwind CSS" /></a>
  <a href="https://www.radix-ui.com"><img style="background:#fff;border-radius:8px;padding:6px"  src="../assets/logos/radixui.svg" width="40" alt="Radix UI" /></a>
  <a href="https://nextjs.org"><img style="background:#fff;border-radius:8px;padding:6px"  src="../assets/logos/nextdotjs.svg" width="40" alt="Next.js" /></a>
  <a href="https://react.dev"><img style="background:#fff;border-radius:8px;padding:6px"  src="../assets/logos/react.svg" width="40" alt="React" /></a>
</p>

Launch Kit is designed as a **forkable SaaS boilerplate** — the UI should feel polished out of the box while staying easy to rebrand. This guide covers the UX patterns adopters get and where to customize them.

## Marketing site (`/`)

Full guide: **[MARKETING.md](./MARKETING.md)**

| Area         | Details                                                                                     |
| ------------ | ------------------------------------------------------------------------------------------- |
| **Header**   | Sticky glass nav, scroll-aware active section (`use-active-section`), Sign in + Get started |
| **Hero**     | Primary CTA = free trial; quick-link pills to demo, docs, pricing                           |
| **Sections** | `marketing-section` padding, `marketing-card-hover` on cards                                |
| **FAQ**      | Two-column accordion with smooth expand                                                     |
| **Pricing**  | Trial badges, `?plan=` register links, billing demo link                                    |
| **Footer**   | CTA strip, sign-in link, `/docs` hub                                                        |

Copy: `src/lib/marketing.ts`, `src/lib/marketing-content.ts`. Components: `src/components/marketing/*`.

## Design system page

Visit **`/design-system`** in dev to preview:

- Typography scale and font stacks (Geist Sans / Mono)
- Color tokens (`primary`, `muted`, `destructive`, etc.)
- Buttons, badges, cards, and form controls
- Theme presets side by side

Use this page when tuning your product's visual identity before editing global CSS.

## Theme presets

Four built-in palettes ship via CSS variables on `<html data-theme-preset="…">`:

| Preset    | Feel                      |
| --------- | ------------------------- |
| `default` | Launch Kit blue (default) |
| `ocean`   | Teal / cyan               |
| `violet`  | Purple product            |
| `emerald` | Green growth              |

Set in `.env.local`:

```bash
NEXT_PUBLIC_THEME_PRESET=ocean
```

Presets are defined in `src/lib/theme-presets.ts` and `src/styles/globals.css`. Dark mode still works via `next-themes` (class on `<html>`).

## Logo & branding

| Variable                   | Purpose                                     |
| -------------------------- | ------------------------------------------- |
| `NEXT_PUBLIC_APP_LOGO_URL` | Optional image logo (replaces default icon) |
| `NEXT_PUBLIC_APP_NAME`     | Text fallback and alt text                  |
| `NEXT_PUBLIC_THEME_PRESET` | Color palette preset                        |

Logo component: `src/components/brand/brand-logo.tsx`. Remote logo hosts may need an entry in `next.config.ts` → `images.remotePatterns`.

Marketing copy lives in `src/lib/marketing.ts` and `src/lib/marketing-content.ts`. See **[MARKETING.md](./MARKETING.md)**.

## Authentication UX

- Split layout with product copy from `AUTH_PANEL` in `marketing-content.ts`
- Sidebar links: **View live demo**, **Compare plans** (`/#pricing`)
- Mobile header: **Live demo** link
- Register with `?plan=` shows selected plan badge; OAuth redirects to billing
- Shared **OAuth buttons** (`OAuthButtons`) on login and register
- **Password strength meter** on register (`PasswordStrength`)
- Invite acceptance page shows org avatar, role badge, and member count

## Dashboard shell

| Feature           | Location                                                             |
| ----------------- | -------------------------------------------------------------------- |
| Org switcher      | Sidebar — cookie `active-org-id`, server action `switchOrganization` |
| Command palette   | ⌘K / Ctrl+K — `DashboardCommandMenu`                                 |
| Mobile bottom nav | `MobileBottomNav` on small screens                                   |
| Loading skeleton  | `src/app/dashboard/loading.tsx`                                      |
| Empty states      | `EmptyState` on analytics, team, billing, audit                      |

## Demo mode (`/demo`)

- Public dashboard with mock data from `src/lib/demo-data.ts`
- **Platform admin demo** at `/demo/admin` — same tabbed console as production (`AdminConsole`), sample data in `src/lib/demo-admin-data.ts`; mutations disabled with an amber notice
- **Coach marks** — 3-step tour (stored in `localStorage`)
- Demo banner links to overview, admin demo, and GitHub for forking
- Notifications labeled demo-only

## Platform admin UI

When `FEATURE_ADMIN_DASHBOARD=true` and the signed-in user is a platform admin, the sidebar shows **Admin** (`/dashboard/admin`).

| Tab           | Panel component           | Purpose                                  |
| ------------- | ------------------------- | ---------------------------------------- |
| Users         | `AdminUsersPanel`         | Search, filter, suspend/ban, grant admin |
| Organizations | `AdminOrganizationsPanel` | List and delete workspaces               |
| Invitations   | `AdminInvitationsPanel`   | Cross-org invite management              |
| Billing       | `AdminBillingPanel`       | MRR summary and subscription table       |
| Audit         | `AdminAuditLogsPanel`     | Platform-wide event trail                |
| Settings      | `AdminSettingsPanel`      | Signup toggle                            |

Pass `isDemo` to `AdminConsole` and panels for the public preview. See **[ADMIN.md](./ADMIN.md)** for setup and API details.

## Settings

Tabbed layout (`SettingsTabs`): Profile, Organization, Team (when enabled), Notifications, API keys (when enabled).

## Onboarding checklist

Dashboard overview shows setup steps from `getOnboardingSteps()`:

1. Complete profile
2. Create organization
3. Choose a subscription plan
4. Invite a team member
5. Explore analytics & settings

## Accessibility

- Skip link to main content
- `prefers-reduced-motion` respected in `globals.css`
- Focus rings on interactive elements
- ARIA labels on icon-only controls

## Files to edit first

| Goal             | File(s)                                                                              |
| ---------------- | ------------------------------------------------------------------------------------ |
| Marketing site   | [MARKETING.md](./MARKETING.md), `src/lib/marketing.ts`, `src/components/marketing/*` |
| Colors / presets | `src/styles/globals.css`, `src/lib/theme-presets.ts`                                 |
| Demo data        | `src/lib/demo-data.ts`                                                               |
| Admin demo data  | `src/lib/demo-admin-data.ts`                                                         |
| Platform admin   | `src/components/admin/*`, [ADMIN.md](./ADMIN.md)                                     |
| Dashboard nav    | `src/components/dashboard/dashboard-shell.tsx`                                       |
| Auth forms       | `src/components/auth/*`                                                              |

See also **[CUSTOMIZATION.md](./CUSTOMIZATION.md)** for env vars and deployment.
