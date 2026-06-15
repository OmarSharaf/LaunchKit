'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type PaymentMethod = 'stripe' | 'whop' | 'paypal'
type PaymentProvider = 'STRIPE' | 'WHOP' | 'PAYPAL'

interface PlanOption {
  id: string
  name: string
  stripePriceIdMonth: string | null
  whopPlanId: string | null
  paypalPlanId: string | null
  amount: number
  isPopular: boolean
}

interface BillingActionsProps {
  organizationId: string
  hasSubscription: boolean
  hasStripeCustomer: boolean
  hasWhopSubscription: boolean
  hasPayPalSubscription: boolean
  whopEnabled: boolean
  paypalEnabled: boolean
  paymentProvider?: PaymentProvider
  plans: PlanOption[]
}

export function BillingActions({
  organizationId,
  hasSubscription,
  hasStripeCustomer,
  hasWhopSubscription,
  hasPayPalSubscription,
  whopEnabled,
  paypalEnabled,
  paymentProvider,
  plans,
}: BillingActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const availableMethods = useMemo(() => {
    const methods: PaymentMethod[] = []
    if (plans.some((plan) => plan.stripePriceIdMonth)) methods.push('stripe')
    if (whopEnabled) methods.push('whop')
    if (paypalEnabled && plans.some((plan) => plan.paypalPlanId)) {
      methods.push('paypal')
    }
    return methods
  }, [plans, whopEnabled, paypalEnabled])

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    availableMethods[0] ?? 'stripe'
  )

  const showPaymentMethodPicker =
    !hasSubscription && availableMethods.length > 1

  async function startStripeCheckout(priceId: string) {
    setLoading(`checkout-stripe-${priceId}`)
    setError(null)

    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId, organizationId }),
    })

    const data = await response.json()

    if (!response.ok) {
      setError(data.error ?? 'Checkout failed')
      setLoading(null)
      return
    }

    if (data.url) {
      window.location.href = data.url
    }
  }

  async function startWhopCheckout(planId: string) {
    setLoading(`checkout-whop-${planId}`)
    setError(null)

    const response = await fetch('/api/whop/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, organizationId }),
    })

    const data = await response.json()

    if (!response.ok) {
      setError(data.error ?? 'Checkout failed')
      setLoading(null)
      return
    }

    if (data.url) {
      window.location.href = data.url
    }
  }

  async function startPayPalCheckout(planId: string) {
    setLoading(`checkout-paypal-${planId}`)
    setError(null)

    const response = await fetch('/api/paypal/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planId, organizationId }),
    })

    const data = await response.json()

    if (!response.ok) {
      setError(data.error ?? 'Checkout failed')
      setLoading(null)
      return
    }

    if (data.url) {
      window.location.href = data.url
    }
  }

  async function openStripePortal() {
    setLoading('portal-stripe')
    setError(null)

    const response = await fetch('/api/stripe/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organizationId }),
    })

    const data = await response.json()

    if (!response.ok) {
      setError(
        typeof data.error === 'string'
          ? data.error
          : 'Could not open billing portal'
      )
      setLoading(null)
      return
    }

    if (data.url) {
      window.location.href = data.url
    }
  }

  async function openWhopPortal() {
    setLoading('portal-whop')
    setError(null)

    const response = await fetch('/api/whop/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organizationId }),
    })

    const data = await response.json()

    if (!response.ok) {
      setError(
        typeof data.error === 'string'
          ? data.error
          : 'Could not open billing portal'
      )
      setLoading(null)
      return
    }

    if (data.url) {
      window.location.href = data.url
    }
  }

  async function openPayPalPortal() {
    setLoading('portal-paypal')
    setError(null)

    const response = await fetch('/api/paypal/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organizationId }),
    })

    const data = await response.json()

    if (!response.ok) {
      setError(
        typeof data.error === 'string'
          ? data.error
          : 'Could not open billing portal'
      )
      setLoading(null)
      return
    }

    if (data.url) {
      window.location.href = data.url
    }
  }

  const checkoutPlans = plans.filter((plan) => {
    if (paymentMethod === 'stripe') return !!plan.stripePriceIdMonth
    if (paymentMethod === 'paypal') return !!plan.paypalPlanId
    return whopEnabled
  })

  const providerLabels: Record<PaymentMethod, string> = {
    stripe: 'Stripe',
    whop: 'Whop',
    paypal: 'PayPal',
  }

  function startCheckout(plan: PlanOption) {
    if (paymentMethod === 'stripe') {
      return startStripeCheckout(plan.stripePriceIdMonth!)
    }
    if (paymentMethod === 'paypal') {
      return startPayPalCheckout(plan.id)
    }
    return startWhopCheckout(plan.id)
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {showPaymentMethodPicker && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Payment method</p>
          <div className="flex flex-wrap gap-2">
            {availableMethods.map((method) => (
              <Button
                key={method}
                type="button"
                size="sm"
                variant={paymentMethod === method ? 'default' : 'outline'}
                onClick={() => setPaymentMethod(method)}
              >
                {providerLabels[method]}
              </Button>
            ))}
          </div>
        </div>
      )}

      {!hasSubscription && (
        <div className="grid gap-3 sm:grid-cols-2">
          {checkoutPlans.map((plan) => (
            <div key={plan.id} className="rounded-lg border border-border p-4">
              <p className="font-semibold">{plan.name}</p>
              <p className="text-sm text-muted-foreground">
                ${(plan.amount / 100).toFixed(0)}/month
              </p>
              <Button
                className="mt-3 w-full"
                variant={plan.isPopular ? 'default' : 'outline'}
                disabled={!!loading}
                onClick={() => startCheckout(plan)}
              >
                {(loading === `checkout-stripe-${plan.stripePriceIdMonth}` ||
                  loading === `checkout-whop-${plan.id}` ||
                  loading === `checkout-paypal-${plan.id}`) && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Start trial
                {paymentMethod !== 'stripe'
                  ? ` with ${providerLabels[paymentMethod]}`
                  : ''}
              </Button>
            </div>
          ))}
        </div>
      )}

      {hasStripeCustomer && paymentProvider === 'STRIPE' && (
        <Button
          variant="outline"
          disabled={!!loading}
          onClick={openStripePortal}
        >
          {loading === 'portal-stripe' && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          Manage subscription
        </Button>
      )}

      {hasWhopSubscription && paymentProvider === 'WHOP' && (
        <Button variant="outline" disabled={!!loading} onClick={openWhopPortal}>
          {loading === 'portal-whop' && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          Manage subscription (Whop)
        </Button>
      )}

      {hasPayPalSubscription && paymentProvider === 'PAYPAL' && (
        <Button
          variant="outline"
          disabled={!!loading}
          onClick={openPayPalPortal}
        >
          {loading === 'portal-paypal' && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          Manage subscription (PayPal)
        </Button>
      )}

      {hasSubscription && (
        <Button variant="ghost" size="sm" onClick={() => router.refresh()}>
          Refresh status
        </Button>
      )}
    </div>
  )
}
