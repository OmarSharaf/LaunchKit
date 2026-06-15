import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  CreditCard,
  LayoutDashboard,
  Shield,
  Sparkles,
} from 'lucide-react'
import { MarketingFooter } from '@/components/layout/marketing-footer'
import { MarketingHeader } from '@/components/layout/marketing-header'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  APP_NAME,
  DEMO_ADMIN_PATH,
  DEMO_DASHBOARD_PATH,
  GITHUB_REPO,
} from '@/lib/site'

export const metadata: Metadata = {
  title: 'Documentation',
  description: `Guides for ${APP_NAME} — architecture, billing, admin, and customization.`,
}

const GUIDES = [
  {
    title: 'Architecture',
    description:
      'Marketing site, auth, customer dashboard, billing, and admin — how it fits together.',
    href: `${GITHUB_REPO}/blob/main/docs/ARCHITECTURE.md`,
    icon: LayoutDashboard,
  },
  {
    title: 'Marketing site',
    description:
      'Landing page sections, customer journey, pricing flow, and customization.',
    href: `${GITHUB_REPO}/blob/main/docs/MARKETING.md`,
    icon: Sparkles,
  },
  {
    title: 'Customization',
    description:
      'Branding, env vars, marketing copy, demo data, and feature flags.',
    href: `${GITHUB_REPO}/blob/main/docs/CUSTOMIZATION.md`,
    icon: Sparkles,
  },
  {
    title: 'Billing',
    description: 'Stripe, Whop, and PayPal checkout, webhooks, and portals.',
    href: `${GITHUB_REPO}/blob/main/docs/BILLING.md`,
    icon: CreditCard,
  },
  {
    title: 'Platform admin',
    description:
      'Operator console, signup toggle, user management, and public admin demo.',
    href: `${GITHUB_REPO}/blob/main/docs/ADMIN.md`,
    icon: Shield,
  },
  {
    title: 'UI & UX',
    description:
      'Theme presets, dashboard patterns, onboarding, and design system.',
    href: `${GITHUB_REPO}/blob/main/docs/UI_UX.md`,
    icon: BookOpen,
  },
] as const

const PREVIEWS = [
  { label: 'Live demo', href: DEMO_DASHBOARD_PATH },
  { label: 'Billing demo', href: `${DEMO_DASHBOARD_PATH}/billing` },
  { label: 'Admin demo', href: DEMO_ADMIN_PATH },
  { label: 'Design system', href: '/design-system' },
] as const

export default function DocsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main id="main-content" className="flex-1 py-16 md:py-24">
        <div className="container max-w-4xl">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
              Documentation
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
              Everything about {APP_NAME} — from the marketing site and customer
              dashboard to billing integrations and platform admin.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {GUIDES.map((guide) => {
              const Icon = guide.icon
              return (
                <Card key={guide.title} className="border-border/80">
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{guide.title}</CardTitle>
                    <CardDescription>{guide.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={guide.href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Read guide
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card className="mt-10 border-dashed border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle>Try it in the browser</CardTitle>
              <CardDescription>
                Explore the customer and admin UI without signing in.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {PREVIEWS.map((item) => (
                <Button key={item.href} variant="secondary" size="sm" asChild>
                  <Link href={item.href}>{item.label}</Link>
                </Button>
              ))}
              <Button size="sm" asChild>
                <Link href="/auth/register">Start free trial</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <MarketingFooter />
    </div>
  )
}
