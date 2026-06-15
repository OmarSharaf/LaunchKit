'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface SubscriptionRow {
  id: string
  status: string
  paymentProvider: string
  cancelAtPeriodEnd: boolean
  currentPeriodEnd: string
  planName: string
  planAmount: number
  organization: {
    id: string
    name: string
    slug: string
    memberCount: number
  }
}

interface BillingSummary {
  mrrFormatted: string
  activeCount: number
}

export function AdminBillingPanel() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionRow[]>([])
  const [summary, setSummary] = useState<BillingSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadBilling = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/subscriptions?limit=50')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load billing')
      setSubscriptions(data.subscriptions ?? [])
      setSummary(data.summary ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load billing')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadBilling()
  }, [loadBilling])

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Billing & subscriptions</CardTitle>
          <CardDescription>
            Revenue overview and all organization subscriptions.
          </CardDescription>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={loadBilling}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {summary && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Est. MRR</p>
              <p className="text-2xl font-bold">{summary.mrrFormatted}</p>
            </div>
            <div className="rounded-xl border border-border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Active subs</p>
              <p className="text-2xl font-bold">{summary.activeCount}</p>
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : subscriptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No subscriptions yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Organization</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Provider</th>
                  <th className="px-4 py-3 font-medium">Renews</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {subscriptions.map((sub) => (
                  <tr key={sub.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{sub.organization.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {sub.organization.memberCount} members
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      {sub.planName} · ${(sub.planAmount / 100).toFixed(0)}/mo
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          sub.status === 'ACTIVE' ? 'success' : 'secondary'
                        }
                      >
                        {sub.status.toLowerCase()}
                        {sub.cancelAtPeriodEnd ? ' (canceling)' : ''}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {sub.paymentProvider.toLowerCase()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
