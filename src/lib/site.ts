function normalizeAppUrl(raw: string | undefined, fallback: string): string {
  const value = raw?.trim() || fallback
  if (/^https?:\/\//i.test(value)) return value.replace(/\/$/, '')
  return `https://${value.replace(/\/$/, '')}`
}

export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'Launch Kit'
export const APP_URL = normalizeAppUrl(
  process.env.NEXT_PUBLIC_APP_URL,
  'https://launchkit.dev'
)
export const AUTH_CALLBACK_URL = `${APP_URL}/api/auth/callback`
export const APP_TAGLINE =
  process.env.NEXT_PUBLIC_APP_TAGLINE ?? 'Ship your SaaS in days, not months.'
export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ??
  `${APP_NAME} is a production-ready boilerplate with auth, billing, multi-tenancy, and a polished UI — fork it and make it yours.`

export const PRODUCT_CATEGORY =
  process.env.NEXT_PUBLIC_PRODUCT_CATEGORY ?? 'Open-source SaaS starter'

export const APP_LOGO_URL = process.env.NEXT_PUBLIC_APP_LOGO_URL?.trim() || ''

export const DEMO_DASHBOARD_PATH = '/demo'
export const DEMO_ADMIN_PATH = '/demo/admin'
export const DOCS_HUB_PATH = '/docs'
export const DESIGN_SYSTEM_PATH = '/design-system'
export const CUSTOMIZE_DOCS_PATH = '/docs/customization'

export const GITHUB_REPO =
  process.env.NEXT_PUBLIC_GITHUB_REPO ??
  'https://github.com/OmarSharaf/launchkit'
export const DOCS_URL =
  process.env.NEXT_PUBLIC_DOCS_URL ??
  'https://github.com/OmarSharaf/launchkit/blob/main/docs/CUSTOMIZATION.md'
export const DEMO_URL =
  process.env.NEXT_PUBLIC_DEMO_URL ?? `${APP_URL}${DEMO_DASHBOARD_PATH}`

export const DEVELOPER_NAME = 'Omar S. M. Abdelfatah'
export const DEVELOPER_URL = 'https://www.omarsharaf.me'
export const DEVELOPER_GITHUB = 'https://github.com/OmarSharaf'
export const DEVELOPER_LINKEDIN = 'https://www.linkedin.com/in/omarsharafaldin/'

export const SUPPORT_EMAIL =
  process.env.NEXT_PUBLIC_SUPPORT_EMAIL ?? 'support@launchkit.dev'

export const EMAIL_FROM =
  process.env.EMAIL_FROM ?? `${APP_NAME} <noreply@launchkit.dev>`
