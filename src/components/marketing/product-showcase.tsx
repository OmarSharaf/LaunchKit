import Link from 'next/link'
import { ArrowRight, Globe } from 'lucide-react'
import { SectionHeading } from '@/components/marketing/section-heading'
import { Button } from '@/components/ui/button'
import { SHOWCASE_ITEMS } from '@/lib/marketing'
import { DEMO_ADMIN_PATH, DEMO_DASHBOARD_PATH } from '@/lib/site'
import { cn } from '@/lib/utils'

export function ProductShowcase() {
  return (
    <section id="showcase" className="marketing-section">
      <div className="container">
        <SectionHeading
          eyebrow="Product"
          title="See what your customers will experience"
          description="A polished app surface — dashboard, billing, and settings — ready for your brand and your workflows."
        />

        <div className="grid gap-6 lg:grid-cols-3">
          {SHOWCASE_ITEMS.map((item, index) => (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                'marketing-card-hover group relative block overflow-hidden rounded-2xl border border-border bg-card shadow-sm',
                index === 1 && 'lg:-mt-4 lg:mb-4'
              )}
            >
              <div
                className={cn(
                  'absolute inset-0 bg-gradient-to-br opacity-60 transition-opacity group-hover:opacity-80',
                  item.gradient
                )}
                aria-hidden
              />
              <div className="relative p-6">
                <div className="mb-6 overflow-hidden rounded-xl border border-border/60 bg-background/80 shadow-inner transition-transform duration-300 group-hover:scale-[1.02]">
                  <div className="flex gap-1.5 border-b border-border bg-muted/50 px-3 py-2">
                    <span className="h-2 w-2 rounded-full bg-red-400/80" />
                    <span className="h-2 w-2 rounded-full bg-amber-400/80" />
                    <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
                  </div>
                  <div className="space-y-2 p-4">
                    <div className="h-2 w-1/3 rounded bg-muted" />
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-14 rounded-lg bg-gradient-to-br from-primary/20 to-transparent"
                        />
                      ))}
                    </div>
                    <div className="h-16 rounded-lg bg-muted/50" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {item.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Preview live
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-8 text-center">
          <Globe className="h-10 w-10 text-primary" />
          <p className="max-w-md text-muted-foreground">
            Walk through the full dashboard — charts, billing, team settings,
            and platform admin — with zero signup.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button size="lg" asChild>
              <Link href={DEMO_DASHBOARD_PATH}>
                Open live demo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href={DEMO_ADMIN_PATH}>Admin demo</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
