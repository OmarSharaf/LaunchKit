# Contributing to Launch Kit

<p align="center">
  <a href="https://nextjs.org"><img style="background:#fff;border-radius:8px;padding:6px"  src="docs/assets/logos/nextdotjs.svg" width="36" alt="Next.js" /></a>
  <a href="https://www.typescriptlang.org"><img style="background:#fff;border-radius:8px;padding:6px"  src="docs/assets/logos/typescript.svg" width="36" alt="TypeScript" /></a>
  <a href="https://jestjs.io"><img style="background:#fff;border-radius:8px;padding:6px"  src="docs/assets/logos/jest.svg" width="36" alt="Jest" /></a>
  <a href="https://playwright.dev"><img style="background:#fff;border-radius:8px;padding:6px"  src="docs/assets/logos/playwright.svg" width="36" alt="Playwright" /></a>
  <a href="https://github.com/features/actions"><img style="background:#fff;border-radius:8px;padding:6px"  src="docs/assets/logos/githubactions.svg" width="36" alt="GitHub Actions" /></a>
</p>

Thank you for considering a contribution to Launch Kit. Whether you fix a bug, improve docs, add a feature, or report an issue — it helps the whole community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Project Conventions](#project-conventions)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Message Convention](#commit-message-convention)

## Code of Conduct

By participating, you agree to uphold our [Code of Conduct](CODE_OF_CONDUCT.md). Report unacceptable behavior to **omarsharaf@msn.com** (see [SECURITY.md](SECURITY.md) for security issues).

## How Can I Contribute?

### Reporting bugs

1. Search [existing issues](https://github.com/OmarSharaf/launchkit/issues) to avoid duplicates.
2. Open a new issue with clear steps to reproduce, expected vs. actual behavior, and your environment (OS, Node version, browser).
3. Include relevant logs (redact secrets).

### Suggesting features

Open an issue describing:

- The problem you are solving
- Your proposed solution
- Who else would benefit

### Submitting code

1. Look for issues labeled `good first issue` or `help wanted`.
2. Comment on the issue so work is not duplicated.
3. Fork the repository and branch from `main` (or `develop` if that is the active integration branch).
4. Follow [coding standards](#coding-standards) and [testing](#testing).
5. Open a pull request with a clear description and link to the issue.

## Development Setup

### Prerequisites

- Node.js `>=18.17`
- npm `>=9.0`
- Supabase project (free tier is fine)
- Stripe account in test mode
- Resend account (optional until you send email)

### Steps

```bash
# 1. Fork and clone
git clone https://github.com/YOUR_USERNAME/launchkit.git
cd launchkit

# 2. Install dependencies
npm install

# 3. Environment
cp .env.example .env.local
# Fill in all required values — see README.md for details

# 4. Database
npm run db:generate
npm run db:migrate
npm run db:seed

# 5. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The live demo dashboard is at [http://localhost:3000/demo](http://localhost:3000/demo) (no login required).

### Stripe webhooks (local)

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Copy the printed `whsec_...` value into `.env.local` as `STRIPE_WEBHOOK_SECRET`.

## Project Conventions

| Area                | Location                                | Notes                                                                    |
| ------------------- | --------------------------------------- | ------------------------------------------------------------------------ |
| App routes          | `src/app/`                              | Next.js 15 App Router                                                    |
| UI components       | `src/components/`                       | `ui/`, `auth/`, `dashboard/`, `demo/`, `marketing/`, `layout/`, `brand/` |
| Business logic      | `src/lib/`                              | Auth, Prisma, Stripe, Supabase, validations                              |
| Marketing copy      | `src/lib/marketing.ts`                  | Features, pricing, FAQ, nav links                                        |
| Branding            | `src/lib/site.ts` + `.env`              | App name, tagline, URLs, developer credit                                |
| Demo mock data      | `src/lib/demo-data.ts`                  | Public `/demo` dashboard only                                            |
| Database            | `prisma/schema.prisma`                  | Migrations in `prisma/migrations/`                                       |
| Tests               | Colocated `*.test.ts(x)` next to source | Jest + React Testing Library                                             |
| Shared test helpers | `src/test-utils/`                       | Mocks for Supabase, auth, etc.                                           |

Use the `@/` import alias for everything under `src/`.

## Testing

Launch Kit enforces **100% global coverage** (statements, branches, functions, lines) in `jest.config.ts`.

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report (must meet 100% thresholds)
npm run test:coverage
```

When you change code:

- Add or update colocated tests (`*.test.ts` / `*.test.tsx`).
- API routes and middleware use `/** @jest-environment node */` at the top of the test file.
- Run `npm run test:coverage` before opening a PR.

Run the full CI pipeline locally before opening a PR:

```bash
npm run ci
```

That runs lint, format check, type-check, tests, copies dummy CI env (`.github/ci.env`), and production build — matching [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

For coverage-heavy changes, also run `npm run test:coverage`.

Pre-commit hooks (Husky + lint-staged) run ESLint and Prettier on staged files automatically.

See [docs/CI_CD.md](docs/CI_CD.md) for deployment and GitHub Actions details.

## Pull Request Process

1. **Branch naming:** `feat/short-name`, `fix/short-name`, `docs/short-name`, `test/short-name`, `chore/short-name`
2. **One concern per PR** — easier to review and revert.
3. **Update documentation** if behavior, env vars, or routes change.
4. **Keep coverage at 100%** — CI may not be configured in-repo yet, but coverage thresholds will fail locally if not met.
5. Request review when ready.

## Coding Standards

- **TypeScript:** Strict mode. Avoid `any` unless unavoidable; prefer proper types from Prisma and Zod.
- **Components:** Functional components and hooks only.
- **Naming:** `PascalCase` components, `camelCase` functions/variables, `kebab-case` file names for routes.
- **Imports:** `@/` aliases. Order: external → `@/` internal → types.
- **Server vs. client:** Use `'use client'` only when needed. Prefer Server Components and Server Actions for data access.
- **Errors:** Handle explicitly; log server errors without leaking secrets to clients.
- **Comments:** Prefer self-explanatory code; document non-obvious business rules only.

## Commit Message Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`

**Examples:**

```
feat(demo): add billing preview page
fix(webhooks): handle missing stripe-signature header
docs(readme): document branding env variables
test(dashboard): cover planName fallback in shell
chore(deps): bump next to 15.0.3
```

Thank you for helping make Launch Kit better.
