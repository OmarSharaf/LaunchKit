import Link from 'next/link'
import { Github, Play, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DEMO_ADMIN_PATH, DEMO_DASHBOARD_PATH, GITHUB_REPO } from '@/lib/site'

export function DemoBanner() {
  return (
    <div className="relative overflow-hidden border-b border-primary/20 bg-gradient-to-r from-primary/15 via-violet-500/10 to-primary/5">
      <div className="container relative flex flex-wrap items-center justify-center gap-3 py-3 text-center text-sm sm:justify-between sm:text-left">
        <p className="flex items-center justify-center gap-2 font-medium">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden />
          <span>
            Live demo — full dashboard with analytics, team, billing, settings
            &amp; platform admin
          </span>
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button size="sm" variant="outline" asChild>
            <Link href="/">Homepage</Link>
          </Button>
          <Button size="sm" variant="ghost" className="gap-1.5" asChild>
            <Link
              href={`${GITHUB_REPO}/blob/main/src/components/dashboard/dashboard-shell.tsx`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github className="h-3.5 w-3.5" />
              Fork this layout
            </Link>
          </Button>
          <Button size="sm" variant="ghost" className="gap-1.5" asChild>
            <Link href={DEMO_ADMIN_PATH}>
              <Play className="h-3.5 w-3.5" />
              Admin demo
            </Link>
          </Button>
          <Button size="sm" variant="ghost" className="gap-1.5" asChild>
            <Link href={DEMO_DASHBOARD_PATH}>
              <Play className="h-3.5 w-3.5" />
              Overview
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth/register">Get started</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
