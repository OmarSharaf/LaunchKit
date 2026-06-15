import Link from 'next/link'
import { ArrowRight, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CTA_SECTION } from '@/lib/marketing'
import { APP_NAME, DEMO_DASHBOARD_PATH } from '@/lib/site'

export function CtaSection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container">
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-violet-500/10 px-6 py-16 text-center md:px-12">
          <div
            className="mesh-gradient absolute inset-0 opacity-60"
            aria-hidden
          />
          <div
            className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl"
            aria-hidden
          />
          <div
            className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-violet-500/15 blur-3xl"
            aria-hidden
          />
          <div className="relative">
            <h2 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl">
              {CTA_SECTION.title}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              {CTA_SECTION.description(APP_NAME)}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" asChild>
                <Link href="/auth/register">
                  {CTA_SECTION.primaryCta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href={DEMO_DASHBOARD_PATH}>
                  <Play className="h-4 w-4" />
                  {CTA_SECTION.secondaryCta}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
