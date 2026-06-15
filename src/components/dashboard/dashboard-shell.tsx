'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  ArrowLeft,
  BarChart3,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Menu,
  ScrollText,
  Settings,
  Shield,
  Users,
  X,
} from 'lucide-react'
import { BrandLogo } from '@/components/brand/brand-logo'
import { buildCommandItems } from '@/components/dashboard/command-palette-types'
import { DashboardCommandMenu } from '@/components/dashboard/dashboard-command-menu'
import { DashboardNotifications } from '@/components/dashboard/dashboard-notifications'
import { MobileBottomNav } from '@/components/dashboard/mobile-bottom-nav'
import {
  OrgSwitcher,
  type OrgOption,
} from '@/components/dashboard/org-switcher'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { Button } from '@/components/ui/button'
import { DEMO_NOTIFICATIONS } from '@/lib/demo-data'
import { cn } from '@/lib/utils'

type BasePath = '/dashboard' | '/demo'

function getNavItems(
  basePath: BasePath,
  options?: { showAudit?: boolean; showAdmin?: boolean }
) {
  const items = [
    { href: basePath, label: 'Overview', icon: LayoutDashboard, exact: true },
    {
      href: `${basePath}/analytics`,
      label: 'Analytics',
      icon: BarChart3,
      exact: false,
    },
    {
      href: `${basePath}/team`,
      label: 'Team',
      icon: Users,
      exact: false,
    },
    {
      href: `${basePath}/billing`,
      label: 'Billing',
      icon: CreditCard,
      exact: false,
    },
    {
      href: `${basePath}/settings`,
      label: 'Settings',
      icon: Settings,
      exact: false,
    },
  ] as const

  const extra = []
  if (options?.showAudit && basePath === '/dashboard') {
    extra.push({
      href: '/dashboard/audit',
      label: 'Audit log',
      icon: ScrollText,
      exact: false,
    })
  }
  if (options?.showAdmin && basePath === '/dashboard') {
    extra.push({
      href: '/dashboard/admin',
      label: 'Admin',
      icon: Shield,
      exact: false,
    })
  }

  return [...items, ...extra]
}

interface DashboardShellProps {
  children: React.ReactNode
  userName: string
  userEmail: string
  orgName?: string
  planName?: string
  organizations?: OrgOption[]
  activeOrgId?: string
  basePath?: BasePath
  isDemo?: boolean
  showAudit?: boolean
  showAdmin?: boolean
  signOutAction?: () => Promise<void>
}

export function DashboardShell({
  children,
  userName,
  userEmail,
  orgName,
  planName,
  organizations = [],
  activeOrgId,
  basePath = '/dashboard',
  isDemo = false,
  showAudit = false,
  showAdmin = false,
  signOutAction,
}: DashboardShellProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const initials =
    userName[0]?.toUpperCase() ?? userEmail[0]?.toUpperCase() ?? 'U'
  const navItems = getNavItems(basePath, { showAudit, showAdmin })
  const commandItems = buildCommandItems(basePath, { showAudit, showAdmin })

  const orgSwitcherData =
    organizations.length > 0
      ? organizations
      : orgName
        ? [{ id: 'default', name: orgName, planName }]
        : []

  const sidebar = (
    <>
      <div className="flex h-16 items-center border-b border-border px-4">
        <BrandLogo size="sm" href={isDemo ? '/' : '/'} />
      </div>

      {orgSwitcherData.length > 0 && (
        <OrgSwitcher
          organizations={orgSwitcherData}
          activeOrgId={activeOrgId ?? orgSwitcherData[0]?.id}
        />
      )}

      <nav className="flex-1 space-y-0.5 p-3" aria-label="Dashboard">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-primary/10 text-primary shadow-sm'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-3">
        <div className="mb-2 flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-violet-600 text-sm font-semibold text-primary-foreground shadow-sm">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{userName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {userEmail}
            </p>
          </div>
        </div>
        {isDemo ? (
          <Link
            href="/"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Exit demo
          </Link>
        ) : (
          signOutAction && (
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </form>
          )
        )}
      </div>
    </>
  )

  const topBarExtras = (
    <>
      <DashboardCommandMenu
        items={commandItems}
        isDemo={isDemo}
        signOutAction={signOutAction}
      />
      <DashboardNotifications items={DEMO_NOTIFICATIONS} demoOnly={isDemo} />
      <ThemeToggle />
    </>
  )

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 flex-col border-r border-border bg-card/50 backdrop-blur md:flex">
        {sidebar}
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between gap-2 border-b border-border bg-card/50 px-4 backdrop-blur md:hidden">
          <BrandLogo size="sm" href={isDemo ? '/' : '/'} />
          <div className="flex items-center gap-1">
            <DashboardNotifications
              items={DEMO_NOTIFICATIONS}
              demoOnly={isDemo}
            />
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </header>

        {mobileOpen && (
          <div className="flex max-h-[min(70vh,calc(100vh-4rem))] flex-col overflow-y-auto border-b border-border bg-card md:hidden">
            {sidebar}
          </div>
        )}

        <div className="hidden h-16 items-center justify-between gap-4 border-b border-border bg-card/30 px-6 md:flex">
          <div className="min-w-0">
            {isDemo ? (
              <p className="truncate text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Live demo</span>
                {' — '}
                edit mock data in{' '}
                <code className="text-xs">src/lib/demo-data.ts</code>
              </p>
            ) : (
              <p className="truncate text-sm text-muted-foreground">
                {orgName ? (
                  <>
                    <span className="font-medium text-foreground">
                      {orgName}
                    </span>
                    {' · '}
                    {planName ?? 'Free'} plan
                  </>
                ) : (
                  'Complete setup in Settings to unlock all features'
                )}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">{topBarExtras}</div>
        </div>

        <main className="flex-1 overflow-auto bg-gradient-to-b from-muted/20 to-background pb-20 md:pb-8">
          <div className="container max-w-6xl py-8">{children}</div>
        </main>
      </div>

      <MobileBottomNav basePath={basePath} />
    </div>
  )
}
