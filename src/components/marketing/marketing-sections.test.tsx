import { fireEvent, render, screen } from '@testing-library/react'
import { CtaSection } from './cta-section'
import { FaqSection } from './faq-section'
import { FeaturesSection } from './features-section'
import { HeroSection } from './hero-section'
import { HowItWorksSection } from './how-it-works-section'
import { IntegrationsSection } from './integrations-section'
import { LogoCloud } from './logo-cloud'
import { PricingSection } from './pricing-section'
import { ProductShowcase } from './product-showcase'
import { StatsBar } from './stats-bar'
import { TestimonialsSection } from './testimonials-section'
import { SectionHeading } from './section-heading'

describe('marketing sections', () => {
  it('renders HeroSection with demo visual', () => {
    render(<HeroSection />)
    expect(
      screen.getByRole('heading', {
        name: /ship your saas in days, not months/i,
      })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: /view live demo/i })
    ).toHaveAttribute('href', '/demo')
    expect(
      screen.getByRole('link', { name: /star on github/i })
    ).toBeInTheDocument()
  })

  it('renders StatsBar, LogoCloud, and IntegrationsSection', () => {
    render(<StatsBar />)
    expect(screen.getByText('12k+')).toBeInTheDocument()

    render(<LogoCloud />)
    expect(screen.getByText('Stripe')).toBeInTheDocument()

    render(<IntegrationsSection />)
    expect(screen.getAllByText('Stripe').length).toBeGreaterThan(0)
    expect(screen.getByText('GitHub')).toBeInTheDocument()
  })

  it('renders features, showcase, and how-it-works', () => {
    render(<FeaturesSection />)
    expect(screen.getByText('Dashboard shell')).toBeInTheDocument()

    render(<ProductShowcase />)
    expect(screen.getByText('Unified dashboard')).toBeInTheDocument()

    render(<HowItWorksSection />)
    expect(screen.getByText('Clone & configure')).toBeInTheDocument()
  })

  it('renders pricing, testimonials, and CTA', () => {
    render(<PricingSection />)
    expect(screen.getByText('Most popular')).toBeInTheDocument()

    render(<TestimonialsSection />)
    expect(screen.getByText(/alex chen/i)).toBeInTheDocument()

    render(<CtaSection />)
    expect(screen.getByText(/ready to fork and ship/i)).toBeInTheDocument()
  })

  it('renders SectionHeading alignments', () => {
    const { rerender } = render(<SectionHeading title="Title" align="left" />)
    expect(screen.getByText('Title')).toBeInTheDocument()
    rerender(<SectionHeading title="Center" eyebrow="Eyebrow" />)
    expect(screen.getByText('Eyebrow')).toBeInTheDocument()
  })

  it('toggles FAQ items', () => {
    render(<FaqSection />)
    expect(screen.getByText(/MIT-licensed/i)).toBeInTheDocument()

    const licenseButton = screen.getByRole('button', {
      name: /is this really free/i,
    })
    fireEvent.click(licenseButton)
    expect(screen.getByText(/MIT-licensed/i)).not.toBeVisible()

    fireEvent.click(licenseButton)
    expect(screen.getByText(/MIT-licensed/i)).toBeVisible()

    fireEvent.click(
      screen.getByRole('button', {
        name: /can i use this for client projects/i,
      })
    )
  })
})
