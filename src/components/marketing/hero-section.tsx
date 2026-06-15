import Link from 'next/link'
import { ArrowRight, Check, Github, Play, Sparkles } from 'lucide-react'
import { HeroVisual } from '@/components/marketing/hero-visual'
import { MarketingThemePreview } from '@/components/marketing/marketing-theme-preview'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  APP_DESCRIPTION,
  APP_TAGLINE,
  DEMO_DASHBOARD_PATH,
  GITHUB_REPO,
  PRODUCT_CATEGORY,
} from '@/lib/site'

const TRUST_ITEMS = [
  'Auth & billing included',
  'Multi-tenant orgs',
  '100% test coverage',
  'Fork on GitHub',
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="mesh-gradient absolute inset-0" aria-hidden />
      <div className="grid-pattern absolute inset-0 opacity-30" aria-hidden />
      <div
        className="absolute left-1/4 top-20 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
        aria-hidden
      />
      <div
        className="absolute bottom-10 right-1/4 h-64 w-64 rounded-full bg-violet-500/15 blur-3xl"
        aria-hidden
      />

      <div className="container relative py-20 md:py-28 lg:py-32">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <Badge variant="secondary" className="mb-6 gap-1.5 px-3 py-1">
            <Sparkles className="h-3 w-3 text-primary" />
            {PRODUCT_CATEGORY}
          </Badge>

          <h1 className="text-balance text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            {APP_TAGLINE.split('.')[0]}
            <span className="gradient-text">.</span>
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            {APP_DESCRIPTION}
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href={DEMO_DASHBOARD_PATH}>
                <Play className="h-4 w-4" />
                View live demo
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link
                href={GITHUB_REPO}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-4 w-4" />
                Star on GitHub
              </Link>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <Link href="/auth/register">
                Start free trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <ul className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            {TRUST_ITEMS.map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-primary" />
                {item}
              </li>
            ))}
          </ul>

          <MarketingThemePreview />
        </div>

        <HeroVisual />

        <p className="mx-auto mt-8 max-w-lg text-center text-xs text-muted-foreground">
          Open-source MIT boilerplate — customize branding in{' '}
          <Link
            href={GITHUB_REPO + '/blob/main/docs/CUSTOMIZATION.md'}
            className="text-primary hover:underline"
          >
            docs/CUSTOMIZATION.md
          </Link>
        </p>
      </div>
    </section>
  )
}
