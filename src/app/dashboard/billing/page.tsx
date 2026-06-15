import type { Metadata } from 'next'
import { Building2, CreditCard } from 'lucide-react'
import { BillingActions } from '@/components/billing/billing-actions'
import { BillingAlerts } from '@/components/billing/billing-alerts'
import { DashboardPageHeader } from '@/components/dashboard/dashboard-page-header'
import { EmptyState } from '@/components/dashboard/empty-state'
import { getDbUserWithMemberships, requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isPayPalEnabled } from '@/lib/paypal'
import { isWhopEnabled } from '@/lib/whop'
import { isSubscriptionActive } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const metadata: Metadata = { title: 'Billing' }

interface BillingPageProps {
  searchParams: Promise<{ success?: string; canceled?: string }>
}

export default async function BillingPage({ searchParams }: BillingPageProps) {
  await requireAuth()
  const dbUser = await getDbUserWithMemberships()
  const params = await searchParams

  const org = dbUser?.memberships[0]?.organization
  const sub = org?.subscription
  const active = sub ? isSubscriptionActive(sub.status) : false

  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
  const whopEnabled = isWhopEnabled()
  const paypalEnabled = isPayPalEnabled()

  return (
    <div className="flex flex-col gap-8">
      <DashboardPageHeader
        title="Billing"
        description="Manage your subscription, payment methods, and plan upgrades."
      />

      <BillingAlerts success={params.success} canceled={params.canceled} />

      {!org ? (
        <EmptyState
          icon={Building2}
          title="No organization"
          description="Create an organization in Settings before choosing a subscription plan."
          actionLabel="Go to settings"
          actionHref="/dashboard/settings"
        />
      ) : (
        <>
          <Card className="border-border/80 shadow-sm">
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Current plan
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {org
                      ? `Organization: ${org.name}`
                      : 'Create an organization in Settings first'}
                  </CardDescription>
                </div>
                <Badge variant={active ? 'success' : 'secondary'}>
                  {active ? (sub?.plan?.name ?? 'Active') : 'Free'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {sub ? (
                <p className="text-sm text-muted-foreground">
                  Status:{' '}
                  <span className="capitalize text-foreground">
                    {sub.status.toLowerCase()}
                  </span>
                  {sub.cancelAtPeriodEnd && ' · Cancels at period end'}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Start a 14-day free trial on any paid plan.
                </p>
              )}

              {org && (
                <BillingActions
                  organizationId={org.id}
                  hasSubscription={!!sub && active}
                  hasStripeCustomer={!!org.stripeCustomerId}
                  hasWhopSubscription={!!sub?.whopMembershipId}
                  hasPayPalSubscription={!!sub?.paypalSubscriptionId}
                  whopEnabled={whopEnabled}
                  paypalEnabled={paypalEnabled}
                  paymentProvider={sub?.paymentProvider}
                  plans={plans.map((p) => ({
                    id: p.id,
                    name: p.name,
                    stripePriceIdMonth: p.stripePriceIdMonth,
                    whopPlanId: p.whopPlanId,
                    paypalPlanId: p.paypalPlanId,
                    amount: p.amount,
                    isPopular: p.isPopular,
                  }))}
                />
              )}
            </CardContent>
          </Card>

          {plans.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold">Available plans</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                {plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={
                      plan.isPopular
                        ? 'border-primary ring-1 ring-primary/20'
                        : undefined
                    }
                  >
                    <CardHeader>
                      <CardTitle className="text-lg">{plan.name}</CardTitle>
                      <CardDescription>
                        <span className="text-2xl font-bold text-foreground">
                          ${(plan.amount / 100).toFixed(0)}
                        </span>
                        /mo
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
