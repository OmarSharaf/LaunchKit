'use client'

import { useTransition } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { switchOrganization } from '@/app/dashboard/actions'
import { cn } from '@/lib/utils'

export interface OrgOption {
  id: string
  name: string
  planName?: string
}

interface OrgSwitcherProps {
  organizations: OrgOption[]
  activeOrgId?: string
}

export function OrgSwitcher({ organizations, activeOrgId }: OrgSwitcherProps) {
  const [pending, startTransition] = useTransition()

  if (organizations.length <= 1) {
    const org = organizations[0]
    if (!org) return null
    return (
      <div className="border-b border-border bg-muted/20 px-4 py-3">
        <p className="truncate text-sm font-semibold">{org.name}</p>
        <p className="text-xs text-muted-foreground">
          {org.planName ?? 'Free'} plan
        </p>
      </div>
    )
  }

  return (
    <div className="border-b border-border bg-muted/20 p-3">
      <label htmlFor="org-switcher" className="sr-only">
        Switch organization
      </label>
      <div className="relative">
        <select
          id="org-switcher"
          disabled={pending}
          value={activeOrgId ?? organizations[0]?.id}
          onChange={(e) => {
            startTransition(() => switchOrganization(e.target.value))
          }}
          className="w-full appearance-none rounded-lg border border-border bg-background py-2.5 pl-3 pr-9 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        >
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name} · {org.planName ?? 'Free'}
            </option>
          ))}
        </select>
        <ChevronsUpDown
          className={cn(
            'pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground',
            pending && 'animate-pulse'
          )}
          aria-hidden
        />
      </div>
      {activeOrgId && (
        <p className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
          <Check className="h-3 w-3 text-emerald-600" />
          Active workspace
        </p>
      )}
    </div>
  )
}
