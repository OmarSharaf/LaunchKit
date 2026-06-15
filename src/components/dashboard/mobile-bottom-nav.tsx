'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  CreditCard,
  LayoutDashboard,
  MoreHorizontal,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const MOBILE_NAV = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/team', label: 'Team', icon: Users, exact: false },
  {
    href: '/dashboard/billing',
    label: 'Billing',
    icon: CreditCard,
    exact: false,
  },
  {
    href: '/dashboard/settings',
    label: 'More',
    icon: MoreHorizontal,
    exact: false,
  },
] as const

interface MobileBottomNavProps {
  basePath?: '/dashboard' | '/demo'
}

export function MobileBottomNav({
  basePath = '/dashboard',
}: MobileBottomNavProps) {
  const pathname = usePathname()

  const items =
    basePath === '/demo'
      ? MOBILE_NAV.map((item) => ({
          ...item,
          href: item.href.replace('/dashboard', '/demo'),
        }))
      : MOBILE_NAV

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur md:hidden"
      aria-label="Mobile navigation"
    >
      <ul className="flex items-stretch justify-around">
        {items.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={cn(
                  'flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors',
                  active ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
      <div className="h-safe-area-inset-bottom" />
    </nav>
  )
}
