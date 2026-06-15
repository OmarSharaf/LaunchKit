import { SectionHeading } from '@/components/marketing/section-heading'
import { STEPS } from '@/lib/marketing'

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="marketing-section bg-muted/30">
      <div className="container">
        <SectionHeading
          eyebrow="How it works"
          title="From demo to paid plan in three steps"
          description="See the product, create an account, subscribe on Billing — the same flow your customers will follow."
        />

        <div className="relative grid gap-8 md:grid-cols-3">
          <div
            className="pointer-events-none absolute left-[16%] right-[16%] top-12 hidden h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent md:block"
            aria-hidden
          />
          {STEPS.map((step) => {
            const Icon = step.icon
            return (
              <div
                key={step.step}
                className="marketing-card-hover relative rounded-xl border border-border bg-card p-6 shadow-sm"
              >
                <span className="text-4xl font-bold text-primary/20">
                  {step.step}
                </span>
                <div className="mt-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
