import type { Metadata } from 'next'
import Link from 'next/link'
import { BrandLogo } from '@/components/brand/brand-logo'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { APP_NAME } from '@/lib/site'
import { THEME_PRESETS } from '@/lib/theme-presets'

export const metadata: Metadata = {
  title: 'Design System',
  description: `UI reference for ${APP_NAME} components and tokens.`,
}

export default function DesignSystemPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="glass sticky top-0 z-50 border-b border-border">
        <div className="container flex h-16 items-center justify-between">
          <BrandLogo />
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" asChild>
              <Link href="/">← Home</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl py-16">
        <h1 className="text-3xl font-bold tracking-tight">Design system</h1>
        <p className="mt-2 text-muted-foreground">
          Reference for {APP_NAME} UI tokens and components. Customize colors in{' '}
          <code className="text-sm">src/styles/globals.css</code> and theme
          presets via <code className="text-sm">NEXT_PUBLIC_THEME_PRESET</code>.
        </p>

        <section className="mt-12 space-y-4">
          <h2 className="text-xl font-semibold">Theme presets</h2>
          <div className="flex flex-wrap gap-2">
            {THEME_PRESETS.map((p) => (
              <Badge key={p.id} variant="secondary">
                {p.label} — {p.description}
              </Badge>
            ))}
          </div>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-xl font-semibold">Buttons</h2>
          <div className="flex flex-wrap gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-xl font-semibold">Form controls</h2>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Input</CardTitle>
              <CardDescription>
                shadcn/ui Input with label pattern
              </CardDescription>
            </CardHeader>
            <CardContent className="max-w-sm space-y-2">
              <label htmlFor="ds-email" className="text-sm font-medium">
                Email
              </label>
              <Input id="ds-email" placeholder="you@example.com" />
            </CardContent>
          </Card>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-xl font-semibold">Cards</h2>
          <Card>
            <CardHeader>
              <CardTitle>Card title</CardTitle>
              <CardDescription>
                Default card used across dashboard and marketing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Accent borders (<code>border-primary/20</code>) are reserved for
                CTAs and onboarding.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-xl font-semibold">Typography scale</h2>
          <ul className="space-y-3 rounded-xl border border-border p-6">
            <li className="text-3xl font-bold">
              Page title — text-3xl font-bold
            </li>
            <li className="text-xl font-semibold">
              Section — text-xl font-semibold
            </li>
            <li className="text-base">Body — text-base</li>
            <li className="text-sm text-muted-foreground">
              Muted — text-sm text-muted-foreground
            </li>
          </ul>
        </section>
      </main>
    </div>
  )
}
