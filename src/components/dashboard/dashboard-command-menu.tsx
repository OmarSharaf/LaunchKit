'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, Search } from 'lucide-react'
import type { CommandItem } from '@/components/dashboard/command-palette-types'

interface DashboardCommandMenuProps {
  items: CommandItem[]
  isDemo?: boolean
  signOutAction?: () => Promise<void>
}

export function DashboardCommandMenu({
  items,
  isDemo = false,
  signOutAction,
}: DashboardCommandMenuProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const router = useRouter()

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const filtered = items.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.keywords?.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-md border border-input bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent lg:flex"
        aria-label="Open command palette"
        title={isDemo ? 'Demo only — navigation works' : undefined}
      >
        <Search className="h-4 w-4" />
        <span className="text-xs">Search…</span>
        <kbd className="pointer-events-none ml-2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-background/80 p-4 pt-[15vh] backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Command palette"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 border-b border-border px-4">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search pages…"
                className="h-12 flex-1 bg-transparent text-sm outline-none"
              />
            </div>
            <ul className="max-h-72 overflow-y-auto p-2">
              {filtered.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-accent"
                      onClick={() => {
                        setOpen(false)
                        setQuery('')
                        router.push(item.href)
                      }}
                    >
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      {item.label}
                    </button>
                  </li>
                )
              })}
              {isDemo && (
                <li className="mt-1 border-t border-border px-3 py-2 text-xs text-muted-foreground">
                  Sign out is disabled in demo mode
                </li>
              )}
              {!isDemo && signOutAction && (
                <li className="mt-1 border-t border-border pt-1">
                  <form action={signOutAction}>
                    <button
                      type="submit"
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </form>
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </>
  )
}
