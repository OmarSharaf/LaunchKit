import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  CreditCard,
  LayoutDashboard,
  ScrollText,
  Settings,
  Shield,
  Users,
} from 'lucide-react'

export interface CommandItem {
  id: string
  label: string
  href: string
  icon: LucideIcon
  keywords?: string
}

export function buildCommandItems(
  basePath: '/dashboard' | '/demo',
  options?: { showAudit?: boolean; showAdmin?: boolean }
): CommandItem[] {
  const items: CommandItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      href: basePath,
      icon: LayoutDashboard,
    },
    {
      id: 'analytics',
      label: 'Analytics',
      href: `${basePath}/analytics`,
      icon: BarChart3,
    },
    { id: 'team', label: 'Team', href: `${basePath}/team`, icon: Users },
    {
      id: 'billing',
      label: 'Billing',
      href: `${basePath}/billing`,
      icon: CreditCard,
    },
    {
      id: 'settings',
      label: 'Settings',
      href: `${basePath}/settings`,
      icon: Settings,
    },
  ]

  if (options?.showAudit && basePath === '/dashboard') {
    items.push({
      id: 'audit',
      label: 'Audit log',
      href: '/dashboard/audit',
      icon: ScrollText,
    })
  }
  if (options?.showAdmin) {
    items.push({
      id: 'admin',
      label: 'Admin',
      href: basePath === '/demo' ? '/demo/admin' : '/dashboard/admin',
      icon: Shield,
    })
  }

  return items
}
