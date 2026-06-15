'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'organization', label: 'Organization' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'team', label: 'Team' },
  { id: 'api-keys', label: 'API keys' },
] as const

export type SettingsTabId = (typeof TABS)[number]['id']

interface SettingsTabsProps {
  defaultTab?: SettingsTabId
  showTeam?: boolean
  showApiKeys?: boolean
  profile: React.ReactNode
  organization: React.ReactNode
  notifications: React.ReactNode
  team?: React.ReactNode
  apiKeys?: React.ReactNode
}

export function SettingsTabs({
  defaultTab = 'profile',
  showTeam = false,
  showApiKeys = false,
  profile,
  organization,
  notifications,
  team,
  apiKeys,
}: SettingsTabsProps) {
  const [active, setActive] = useState<SettingsTabId>(defaultTab)

  const visibleTabs = TABS.filter((tab) => {
    if (tab.id === 'team') return showTeam
    if (tab.id === 'api-keys') return showApiKeys
    return true
  })

  const panels: Record<SettingsTabId, React.ReactNode> = {
    profile,
    organization,
    notifications,
    team: team ?? null,
    'api-keys': apiKeys ?? null,
  }

  return (
    <div className="flex flex-col gap-6">
      <div
        className="flex gap-1 overflow-x-auto border-b border-border pb-px"
        role="tablist"
        aria-label="Settings sections"
      >
        {visibleTabs.map((tab) => (
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
      <div role="tabpanel">{panels[active]}</div>
    </div>
  )
}
