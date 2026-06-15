import { Info } from 'lucide-react'

export function DemoAdminNotice() {
  return (
    <div
      className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm"
      role="status"
    >
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <p>
        <span className="font-medium">Admin demo mode</span> — sample platform
        data only. Suspend, delete, and settings changes are disabled. Configure{' '}
        <code className="rounded bg-muted px-1 py-0.5 text-xs">
          PLATFORM_ADMIN_EMAILS
        </code>{' '}
        for the real console.
      </p>
    </div>
  )
}
