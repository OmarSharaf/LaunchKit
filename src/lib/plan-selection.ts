export const MARKETING_PLAN_SLUGS = {
  starter: 'Starter',
  pro: 'Pro',
} as const

export type MarketingPlanSlug = keyof typeof MARKETING_PLAN_SLUGS

export function isMarketingPlanSlug(
  value: string | null | undefined
): value is MarketingPlanSlug {
  if (!value) return false
  return value.toLowerCase() in MARKETING_PLAN_SLUGS
}

export function getPlanNameFromSlug(
  slug: string | null | undefined
): string | null {
  if (!slug) return null
  const key = slug.toLowerCase() as MarketingPlanSlug
  return MARKETING_PLAN_SLUGS[key] ?? null
}

export function buildRegisterHref(slug: MarketingPlanSlug): string {
  return `/auth/register?plan=${slug}`
}

export function buildPostSignupBillingPath(planSlug?: string | null): string {
  if (!planSlug || !isMarketingPlanSlug(planSlug)) {
    return '/dashboard/billing'
  }
  return `/dashboard/billing?plan=${planSlug}`
}

export function planMatchesSlug(
  planName: string,
  slug: string | null | undefined
): boolean {
  const expected = getPlanNameFromSlug(slug)
  if (!expected) return false
  return planName.toLowerCase() === expected.toLowerCase()
}
