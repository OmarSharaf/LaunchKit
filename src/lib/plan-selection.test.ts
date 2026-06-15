import {
  buildPostSignupBillingPath,
  buildRegisterHref,
  getPlanNameFromSlug,
  planMatchesSlug,
} from './plan-selection'

describe('plan-selection', () => {
  it('maps marketing slugs to plan names', () => {
    expect(getPlanNameFromSlug('pro')).toBe('Pro')
    expect(getPlanNameFromSlug('starter')).toBe('Starter')
    expect(getPlanNameFromSlug('invalid')).toBeNull()
  })

  it('builds register and billing paths', () => {
    expect(buildRegisterHref('pro')).toBe('/auth/register?plan=pro')
    expect(buildPostSignupBillingPath('pro')).toBe(
      '/dashboard/billing?plan=pro'
    )
    expect(buildPostSignupBillingPath(null)).toBe('/dashboard/billing')
  })

  it('matches db plan names to slugs', () => {
    expect(planMatchesSlug('Pro', 'pro')).toBe(true)
    expect(planMatchesSlug('Starter', 'starter')).toBe(true)
    expect(planMatchesSlug('Enterprise', 'pro')).toBe(false)
  })
})
