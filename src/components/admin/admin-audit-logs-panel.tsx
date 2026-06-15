'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, RefreshCw } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { DEMO_ADMIN_AUDIT_LOGS } from '@/lib/demo-admin-data'
import { formatRelativeDate } from '@/lib/utils'

interface AuditLogRow {
  id: string
  action: string
  entity: string
  entityId: string | null
  userEmail: string | null
  organizationName: string | null
  createdAt: string
}

interface AdminAuditLogsPanelProps {
  isDemo?: boolean
}

export function AdminAuditLogsPanel({
  isDemo = false,
}: AdminAuditLogsPanelProps) {
  const [logs, setLogs] = useState<AuditLogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadLogs = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (isDemo) {
        setLogs(DEMO_ADMIN_AUDIT_LOGS)
        return
      }

      const res = await fetch('/api/admin/audit-logs?limit=50')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load audit logs')
      setLogs(data.logs ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }, [isDemo])

  useEffect(() => {
    void loadLogs()
  }, [loadLogs])

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Audit log</CardTitle>
          <CardDescription>
            Platform-wide trail of admin actions, billing, and org changes.
          </CardDescription>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={loadLogs}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {error && (
          <p className="mb-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No audit events yet.</p>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border">
            {logs.map((log) => (
              <li
                key={log.id}
                className="flex flex-col gap-1 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium">{log.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {log.entity}
                    {log.entityId ? ` · ${log.entityId.slice(0, 8)}…` : ''}
                    {log.organizationName ? ` · ${log.organizationName}` : ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                  {log.userEmail && <span>{log.userEmail}</span>}
                  <Badge variant="outline">
                    {formatRelativeDate(new Date(log.createdAt))}
                  </Badge>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
