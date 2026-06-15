import { Clock, GitBranch, ShieldCheck, Zap } from 'lucide-react'
import { STATS } from '@/lib/marketing'

const STAT_ICONS = [Zap, GitBranch, ShieldCheck, Clock] as const

export function StatsBar() {
  return (
    <section className="border-b border-border bg-muted/30 py-12">
      <div className="container">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {STATS.map((stat, index) => {
            const Icon = STAT_ICONS[index] ?? Zap
            return (
              <div
                key={stat.label}
                className="marketing-card-hover rounded-2xl border border-border/80 bg-card/70 p-5 text-center shadow-sm"
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {stat.label}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
