'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { AdminAuditLogsPanel } from '@/components/admin/admin-audit-logs-panel'
import { AdminBillingPanel } from '@/components/admin/admin-billing-panel'
import { AdminInvitationsPanel } from '@/components/admin/admin-invitations-panel'
import { AdminOrganizationsPanel } from '@/components/admin/admin-organizations-panel'
import { AdminSettingsPanel } from '@/components/admin/admin-settings-panel'
import { AdminUsersPanel } from '@/components/admin/admin-users-panel'

const TABS = [
  { id: 'users', label: 'Users' },
  { id: 'organizations', label: 'Organizations' },
  { id: 'invitations', label: 'Invitations' },
  { id: 'billing', label: 'Billing' },
  { id: 'audit', label: 'Audit log' },
  { id: 'settings', label: 'Settings' },
] as const

type TabId = (typeof TABS)[number]['id']

interface AdminConsoleProps {
  overview: React.ReactNode
}

export function AdminConsole({ overview }: AdminConsoleProps) {
  const [active, setActive] = useState<TabId>('users')

  return (
    <div className="flex flex-col gap-8">
      {overview}

      <div
        className="flex gap-1 overflow-x-auto border-b border-border pb-px"
        role="tablist"
        aria-label="Admin sections"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active === tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              'shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors',
              active === tab.id
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {active === 'users' && <AdminUsersPanel />}
        {active === 'organizations' && <AdminOrganizationsPanel />}
        {active === 'invitations' && <AdminInvitationsPanel />}
        {active === 'billing' && <AdminBillingPanel />}
        {active === 'audit' && <AdminAuditLogsPanel />}
        {active === 'settings' && <AdminSettingsPanel />}
      </div>
    </div>
  )
}
