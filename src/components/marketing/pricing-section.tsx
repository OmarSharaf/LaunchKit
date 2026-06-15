import Link from 'next/link'
import { Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { SectionHeading } from '@/components/marketing/section-heading'
import { PLANS } from '@/lib/marketing'
import { CUSTOMIZE_HINT, PLAN_COMPARISON } from '@/lib/marketing-content'
import { DEMO_DASHBOARD_PATH } from '@/lib/site'
import { cn } from '@/lib/utils'

export function PricingSection() {
  return (
    <section id="pricing" className="marketing-section bg-muted/20">
      <div className="container">
        <SectionHeading
          eyebrow="Pricing"
          title="Plans your customers will see"
          description="Example tiers for your marketing page — checkout on Billing uses your database plans with Stripe, PayPal, or Whop."
        />
        <p className="mx-auto -mt-8 mb-10 max-w-xl text-center text-xs text-muted-foreground">
          {CUSTOMIZE_HINT}
        </p>

        <div className="mx-auto grid max-w-5xl gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <Card
              key={plan.name}
              className={cn(
                'marketing-card-hover relative flex flex-col',
                plan.highlighted &&
                  'border-primary shadow-xl shadow-primary/10 ring-1 ring-primary lg:scale-[1.03]'
              )}
            >
              {plan.highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most popular
                </Badge>
              )}
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle>{plan.name}</CardTitle>
                  {plan.slug && plan.slug !== 'enterprise' && (
                    <Badge variant="outline" className="text-[10px]">
                      14-day trial
                    </Badge>
                  )}
                </div>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm text-muted-foreground">
                      {plan.period}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-sm"
                    >
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.highlighted ? 'default' : 'outline'}
                  asChild
                >
                  {plan.href.startsWith('mailto:') ? (
                    <a href={plan.href}>{plan.cta}</a>
                  ) : (
                    <Link href={plan.href}>{plan.cta}</Link>
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-4xl overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 font-medium">Feature</th>
                <th className="px-4 py-3 font-medium">Starter</th>
                <th className="px-4 py-3 font-medium">Pro</th>
                <th className="px-4 py-3 font-medium">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              {PLAN_COMPARISON.features.map((row) => (
                <tr
                  key={row.name}
                  className="border-b border-border last:border-0 even:bg-muted/20"
                >
                  <td className="px-4 py-3 text-muted-foreground">
                    {row.name}
                  </td>
                  <td className="px-4 py-3">{row.starter}</td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {row.pro}
                  </td>
                  <td className="px-4 py-3">{row.enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mx-auto mt-6 max-w-xl text-center text-sm text-muted-foreground">
          Want to see billing UI first?{' '}
          <Link
            href={`${DEMO_DASHBOARD_PATH}/billing`}
            className="font-medium text-primary hover:underline"
          >
            Open the billing demo
          </Link>
        </p>
      </div>
    </section>
  )
}
