'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Activity, CreditCard, TrendingUp, Users } from 'lucide-react'
import { DEMO_CHART_WEEKLY, DEMO_METRICS } from '@/lib/demo-data'
import { DEMO_DASHBOARD_PATH } from '@/lib/site'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'team', label: 'Team', icon: Users },
] as const

type TabId = (typeof TABS)[number]['id']

export function HeroVisual() {
  const [tab, setTab] = useState<TabId>('overview')
  const max = Math.max(...DEMO_CHART_WEEKLY.map((d) => d.value))

  return (
    <div className="group relative mx-auto mt-16 block max-w-5xl animate-fade-in-up">
      <div
        className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/20 via-violet-500/15 to-blue-500/20 opacity-70 blur-2xl transition-opacity group-hover:opacity-100"
        aria-hidden
      />
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl shadow-primary/10 ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-[1.01]">
        <div className="flex items-center gap-2 border-b border-border bg-muted/60 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-2 text-xs text-muted-foreground">
            Interactive preview — tabs switch views
          </span>
        </div>

        <div className="flex gap-1 border-b border-border bg-muted/30 p-2">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                tab === id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        <div className="grid gap-px bg-border lg:grid-cols-12">
          <div className="space-y-2 bg-card p-4 lg:col-span-2">
            <div className="h-3 w-16 rounded bg-primary/30" />
            {TABS.map((t) => (
              <div
                key={t.id}
                className={cn(
                  'h-8 rounded-lg',
                  tab === t.id
                    ? 'bg-primary/15 ring-1 ring-primary/30'
                    : 'bg-muted/80'
                )}
              />
            ))}
          </div>

          <div className="bg-card p-5 lg:col-span-10">
            {tab === 'overview' && (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Overview
                    </p>
                    <p className="text-lg font-semibold">Good morning, Alex</p>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <TrendingUp className="h-3 w-3" />
                    +12.4%
                  </span>
                </div>
                <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {DEMO_METRICS.slice(0, 4).map((m) => (
                    <div
                      key={m.label}
                      className="rounded-lg border border-border/80 bg-muted/30 p-3"
                    >
                      <p className="text-[10px] text-muted-foreground">
                        {m.label}
                      </p>
                      <p className="text-sm font-bold">{m.value}</p>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-border/80 bg-muted/20 p-4">
                  <div className="flex h-24 items-end justify-between gap-2">
                    {DEMO_CHART_WEEKLY.map((bar) => (
                      <div
                        key={bar.label}
                        className="flex flex-1 flex-col items-center gap-1"
                      >
                        <div
                          className="w-full rounded-t-md bg-gradient-to-t from-primary to-primary/60"
                          style={{ height: `${(bar.value / max) * 100}%` }}
                        />
                        <span className="text-[10px] text-muted-foreground">
                          {bar.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            {tab === 'billing' && (
              <div className="space-y-4">
                <p className="text-lg font-semibold">Pro plan · $29/mo</p>
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
                  Subscription active — Stripe, PayPal &amp; Whop supported
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Customer portal &amp; webhooks included</li>
                  <li>• Org-scoped billing in Prisma</li>
                  <li>• Edit plans in prisma/seed.ts</li>
                </ul>
              </div>
            )}
            {tab === 'team' && (
              <div className="space-y-3">
                <p className="text-lg font-semibold">Team · 5 members</p>
                {['Alex Rivera', 'Sarah Mitchell', 'James Kim'].map((name) => (
                  <div
                    key={name}
                    className="flex items-center gap-3 rounded-lg border border-border p-3"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
                      {name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{name}</p>
                      <p className="text-xs text-muted-foreground">Active</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Link
        href={DEMO_DASHBOARD_PATH}
        className="mt-4 block text-center text-sm text-muted-foreground transition-colors hover:text-primary"
      >
        Open the full interactive demo dashboard →
      </Link>
    </div>
  )
}
