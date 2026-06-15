# UI & UX Guide

<p align="center">
  <a href="https://tailwindcss.com"><img style="background:#fff;border-radius:8px;padding:6px"  src="../assets/logos/tailwindcss.svg" width="40" alt="Tailwind CSS" /></a>
  <a href="https://www.radix-ui.com"><img style="background:#fff;border-radius:8px;padding:6px"  src="../assets/logos/radixui.svg" width="40" alt="Radix UI" /></a>
  <a href="https://nextjs.org"><img style="background:#fff;border-radius:8px;padding:6px"  src="../assets/logos/nextdotjs.svg" width="40" alt="Next.js" /></a>
  <a href="https://react.dev"><img style="background:#fff;border-radius:8px;padding:6px"  src="../assets/logos/react.svg" width="40" alt="React" /></a>
</p>

Launch Kit is designed as a **forkable SaaS boilerplate** — the UI should feel polished out of the box while staying easy to rebrand. This guide covers the UX patterns adopters get and where to customize them.

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

Marketing copy lives in `src/lib/marketing.ts` and `src/lib/marketing-content.ts`.

## Marketing site

- **Hero** — Demo CTA primary, GitHub secondary; live theme preview (`MarketingThemePreview`)
- **Built-with strip** — Stack logos under the fold (`BuiltWithStrip`)
- **Pricing** — Labeled as example pricing with comparison table
- **Header** — Docs, GitHub, Design system links; mobile sheet nav

## Authentication UX

- Split layout with product copy from `AUTH_PANEL` in `marketing-content.ts`
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
- **Coach marks** — 3-step tour (stored in `localStorage`)
- Demo banner links to GitHub for forking
- Notifications labeled demo-only

## Settings

Tabbed layout (`SettingsTabs`): Profile, Organization, Team (when enabled), Notifications, API keys (when enabled).

## Onboarding checklist

Dashboard overview shows setup steps from `getOnboardingSteps()`:

1. Configure `.env.local`
2. Create organization
3. Invite team member
4. Connect payment provider
5. Customize branding

## Accessibility

- Skip link to main content
- `prefers-reduced-motion` respected in `globals.css`
- Focus rings on interactive elements
- ARIA labels on icon-only controls

## Files to edit first

| Goal             | File(s)                                                |
| ---------------- | ------------------------------------------------------ |
| Colors / presets | `src/styles/globals.css`, `src/lib/theme-presets.ts`   |
| Marketing copy   | `src/lib/marketing.ts`, `src/lib/marketing-content.ts` |
| Demo data        | `src/lib/demo-data.ts`                                 |
| Dashboard nav    | `src/components/dashboard/dashboard-shell.tsx`         |
| Auth forms       | `src/components/auth/*`                                |

See also **[CUSTOMIZATION.md](./CUSTOMIZATION.md)** for env vars and deployment.
