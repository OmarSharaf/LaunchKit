# CI/CD Guide

<p align="center">
  <a href="https://github.com/features/actions"><img style="background:#fff;border-radius:8px;padding:6px"  src="../assets/logos/githubactions.svg" width="44" alt="GitHub Actions" /></a>
  <a href="https://vercel.com"><img style="background:#fff;border-radius:8px;padding:6px"  src="../assets/logos/vercel.svg" width="44" alt="Vercel" /></a>
  <a href="https://www.docker.com"><img style="background:#fff;border-radius:8px;padding:6px"  src="../assets/logos/docker.svg" width="44" alt="Docker" /></a>
  <a href="https://jestjs.io"><img style="background:#fff;border-radius:8px;padding:6px"  src="../assets/logos/jest.svg" width="44" alt="Jest" /></a>
  <a href="https://playwright.dev"><img style="background:#fff;border-radius:8px;padding:6px"  src="../assets/logos/playwright.svg" width="44" alt="Playwright" /></a>
</p>

Launch Kit uses **GitHub Actions** to validate every change on `main`, `master`, and `develop`. **Vercel** (or any Node host) is optional and used when you deploy your own fork to production.

## Quick reference

| Task                                  | Command                 |
| ------------------------------------- | ----------------------- |
| Run full CI locally                   | `npm run ci`            |
| Lint + format + types + tests + build | Same as above           |
| Tests with coverage gates             | `npm run test:coverage` |
| Copy dummy env for local build        | `npm run ci:env`        |

`npm run ci` mirrors the GitHub pipeline: lint → Prettier → type-check → Jest → copy [`.github/ci.env`](../.github/ci.env) → production build.

---

## GitHub Actions workflows

| Workflow    | File                                                                | Trigger                                  | Jobs                                                                               |
| ----------- | ------------------------------------------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------------------- |
| **CI**      | [`.github/workflows/ci.yml`](../.github/workflows/ci.yml)           | Push / PR to `main`, `master`, `develop` | `lint` → `typecheck` → `test` → `build` (parallel lint/typecheck/test, then build) |
| **Release** | [`.github/workflows/release.yml`](../.github/workflows/release.yml) | Tag `v*.*.*` (e.g. `v1.0.0`)             | Build + attach release artifact                                                    |

### CI job details

1. **Lint & format** — `npm run lint`, `npm run format:check`
2. **TypeScript** — `npm run type-check`
3. **Tests** — `npm test` (100% coverage is enforced locally via `jest.config.ts`; run `npm run test:coverage` before large PRs)
4. **Production build** — `npm run ci:env` then `npm run build`, packages `launchkit-build.tar.gz`, signs [SLSA build provenance](https://slsa.dev/spec/v1.0/provenance) with [`actions/attest-build-provenance@v3`](https://github.com/actions/attest-build-provenance), uploads the tarball

### Build provenance attestations

After each successful production build, CI and Release workflows run [`actions/attest-build-provenance`](https://github.com/actions/attest-build-provenance) on `launchkit-build.tar.gz`. This creates a Sigstore-signed [in-toto](https://github.com/in-toto/attestation) attestation linked to the workflow run and repository.

**Verify an attestation** (requires [GitHub CLI](https://cli.github.com/)):

```bash
gh attestation verify launchkit-build.tar.gz --owner OmarSharaf --repo launchkit
```

See GitHub’s guide: [Using artifact attestations to establish provenance for builds](https://docs.github.com/en/actions/security-guides/using-artifact-attestations-to-establish-provenance-for-builds).

> **Note:** Artifact attestations are available for **public** repositories on current GitHub plans. Private repos require GitHub Enterprise Cloud. See the [action README](https://github.com/actions/attest-build-provenance#usage) for plan details.

### CI environment variables

[`npm run ci:env`](../package.json) copies [`.github/ci.env`](../.github/ci.env) to `.env.local`. Values are **placeholders** — no live Supabase, Stripe, or database connection is required for CI.

To add integration tests against real services:

1. Add secrets under **Settings → Secrets and variables → Actions**
2. Extend `.github/workflows/ci.yml` with a new job that uses those secrets

### Build artifacts

After a successful CI run on `main`:

1. Open the workflow run on GitHub
2. **Artifacts** → `nextjs-build-<sha>`
3. Download `launchkit-build.tar.gz` (`.next`, `public`, `prisma`, `package.json`, etc.)

Useful for self-hosted deploys (VPS, Railway, Render, Fly.io).

### Status badge

```markdown
![CI](https://github.com/OmarSharaf/launchkit/actions/workflows/ci.yml/badge.svg)
```

Replace the org/repo if you fork the project.

---

## Dependabot

[`.github/dependabot.yml`](../.github/dependabot.yml) opens weekly npm update PRs. Review and merge when CI passes.

---

## Deploy to Vercel (recommended for Next.js)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/OmarSharaf/launchkit&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,DATABASE_URL,DIRECT_URL,STRIPE_SECRET_KEY,NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,STRIPE_WEBHOOK_SECRET,RESEND_API_KEY,NEXT_PUBLIC_APP_URL,NEXT_PUBLIC_APP_NAME)

[`vercel.json`](../vercel.json) sets:

- `buildCommand`: `prisma generate && next build`
- Security headers aligned with `next.config.ts`

### Steps

1. Import your fork into Vercel
2. Add every variable from [`.env.example`](../.env.example)
3. Deploy
4. Run migrations on production:

   ```bash
   npm run db:migrate:prod
   npm run db:seed
   ```

5. Configure Supabase redirect URLs and Stripe webhooks for your Vercel domain

### GitHub Actions vs Vercel

|                  | GitHub Actions                      | Vercel               |
| ---------------- | ----------------------------------- | -------------------- |
| **Purpose**      | Verify PRs, artifacts, releases     | Host the live app    |
| **Required for** | Contributing to the kit             | Your production SaaS |
| **Build**        | Every push/PR to protected branches | Every deploy         |

Most teams use **both**: Actions for quality gates, Vercel for hosting.

---

## Other platforms

| Platform                  | Build                                        | Deploy                               |
| ------------------------- | -------------------------------------------- | ------------------------------------ |
| Railway / Render / Fly.io | `npm run build`                              | Connect repo + env vars, `npm start` |
| Docker                    | `output: 'standalone'` in Next.js (optional) | Container + env file                 |
| VPS                       | CI artifact or `npm run ci` on server        | `npm start` behind reverse proxy     |

---

## Pre-commit hooks (local)

Husky runs **lint-staged** on commit:

- `*.{js,jsx,ts,tsx}` → ESLint fix + Prettier
- `*.{json,md,css}` → Prettier

This does not replace `npm run ci` before pushing — always run `npm run ci` or at least `npm run test:coverage` for coverage-heavy changes.

---

## Troubleshooting

| Problem                                  | Fix                                                                                                                                                   |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Build fails locally without `.env.local` | Run `npm run ci:env` or copy `.env.example`                                                                                                           |
| Tests fail coverage locally              | Run `npm run test:coverage` and add/update `*.test.tsx` files                                                                                         |
| Prisma client missing                    | `npm run db:generate`                                                                                                                                 |
| Webhook errors in dev                    | Stripe: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`. Whop/PayPal: use ngrok or Cloudflare Tunnel — see [BILLING.md](./BILLING.md) |

For security-related deployment guidance, see [SECURITY.md](../SECURITY.md).
