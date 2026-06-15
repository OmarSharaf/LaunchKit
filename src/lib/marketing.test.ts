import {
  FAQ_ITEMS,
  FEATURES,
  FOOTER_LINKS,
  LOGO_CLOUD,
  NAV_LINKS,
  PLANS,
  SHOWCASE_ITEMS,
  STATS,
  STEPS,
  TESTIMONIALS,
} from './marketing'

describe('marketing content', () => {
  it('exports navigation and footer links', () => {
    expect(NAV_LINKS.some((l) => l.label === 'Product')).toBe(true)
    expect(FOOTER_LINKS.product.some((l) => l.label === 'Live demo')).toBe(true)
    expect(FOOTER_LINKS.connect.length).toBeGreaterThan(0)
  })

  it('exports stats, logos, features, and steps', () => {
    expect(STATS).toHaveLength(4)
    expect(STATS[0].value).toBe('12k+')
    expect(LOGO_CLOUD).toContain('Stripe')
    expect(FEATURES).toHaveLength(7)
    expect(FEATURES[0].title).toBe('Dashboard shell')
    expect(STEPS[0].title).toBe('Clone & configure')
  })

  it('exports pricing plans with highlighted tier', () => {
    expect(PLANS).toHaveLength(3)
    expect(PLANS.some((p) => p.highlighted)).toBe(true)
    expect(PLANS.find((p) => p.name === 'Enterprise')?.href).toContain(
      'mailto:'
    )
  })

  it('exports testimonials, faq, and showcase items', () => {
    expect(TESTIMONIALS).toHaveLength(3)
    expect(FAQ_ITEMS).toHaveLength(4)
    expect(SHOWCASE_ITEMS).toHaveLength(3)
  })
})
