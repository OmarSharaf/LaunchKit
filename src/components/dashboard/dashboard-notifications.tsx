'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface NotificationItem {
  id: string
  title: string
  body: string
  time: string
  read: boolean
}

interface DashboardNotificationsProps {
  items: NotificationItem[]
  demoOnly?: boolean
}

export function DashboardNotifications({
  items,
  demoOnly = false,
}: DashboardNotificationsProps) {
  const [open, setOpen] = useState(false)
  const unread = items.filter((i) => !i.read).length

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Notifications"
        aria-expanded={open}
        title={demoOnly ? 'Demo only — sample notifications' : undefined}
        onClick={() => setOpen(!open)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
            {unread}
          </span>
        )}
      </Button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
            <div className="border-b border-border px-4 py-3">
              <p className="text-sm font-semibold">Notifications</p>
              <p className="text-xs text-muted-foreground">{unread} unread</p>
            </div>
            <ul className="max-h-72 overflow-y-auto">
              {items.map((item) => (
                <li
                  key={item.id}
                  className={cn(
                    'border-b border-border px-4 py-3 last:border-0',
                    !item.read && 'bg-primary/5'
                  )}
                >
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {item.body}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {item.time}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
