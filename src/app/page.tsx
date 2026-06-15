import { MarketingHeader } from '@/components/layout/marketing-header'
import { MarketingFooter } from '@/components/layout/marketing-footer'
import { BuiltWithStrip } from '@/components/marketing/built-with-strip'
import { CtaSection } from '@/components/marketing/cta-section'
import { FaqSection } from '@/components/marketing/faq-section'
import { FeaturesSection } from '@/components/marketing/features-section'
import { HeroSection } from '@/components/marketing/hero-section'
import { HowItWorksSection } from '@/components/marketing/how-it-works-section'
import { IntegrationsSection } from '@/components/marketing/integrations-section'
import { LogoCloud } from '@/components/marketing/logo-cloud'
import { ProductShowcase } from '@/components/marketing/product-showcase'
import { PricingSection } from '@/components/marketing/pricing-section'
import { StatsBar } from '@/components/marketing/stats-bar'
import { TestimonialsSection } from '@/components/marketing/testimonials-section'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main id="main-content" className="flex-1">
        <HeroSection />
        <BuiltWithStrip />
        <StatsBar />
        <LogoCloud />
        <FeaturesSection />
        <ProductShowcase />
        <IntegrationsSection />
        <HowItWorksSection />
        <PricingSection />
        <TestimonialsSection />
        <FaqSection />
        <CtaSection />
      </main>
      <MarketingFooter />
    </div>
  )
}
