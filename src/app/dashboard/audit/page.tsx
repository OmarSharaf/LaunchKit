import { DashboardPageHeader } from '@/components/dashboard/dashboard-page-header'
import { getDbUserWithMemberships, requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { formatRelativeDate } from '@/lib/utils'
import { redirect } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ScrollText } from 'lucide-react'
import { EmptyState } from '@/components/dashboard/empty-state'

export const metadata = { title: 'Audit Log' }

export default async function AuditLogPage() {
  if (!isFeatureEnabled('AUDIT_LOG')) {
    redirect('/dashboard')
  }

  await requireAuth()
  const dbUser = await getDbUserWithMemberships()
  const org = dbUser?.memberships[0]?.organization

  if (!org) {
    redirect('/dashboard/settings')
  }

  const logs = await prisma.auditLog.findMany({
    where: { organizationId: org.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: {
      user: { select: { name: true, email: true } },
    },
  })

  return (
    <div className="flex flex-col gap-8">
      <DashboardPageHeader
        title="Audit log"
        description="Track sensitive actions across your organization for compliance and security."
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScrollText className="h-5 w-5 text-primary" />
            Recent activity
          </CardTitle>
          <CardDescription>
            Showing the last {logs.length} events for {org.name}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <EmptyState
              icon={ScrollText}
              title="No audit events yet"
              description="Invites, billing changes, and API key actions will appear here automatically."
              actionLabel="Go to settings"
              actionHref="/dashboard/settings"
            />
          ) : (
            <ul className="divide-y divide-border">
              {logs.map((log) => (
                <li
                  key={log.id}
                  className="flex flex-col gap-1 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{log.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {log.user?.name ?? log.user?.email ?? 'System'} ·{' '}
                      {log.entity}
                      {log.entityId ? ` (${log.entityId.slice(0, 8)}…)` : ''}
                    </p>
                  </div>
                  <time
                    className="text-xs text-muted-foreground"
                    dateTime={log.createdAt.toISOString()}
                  >
                    {formatRelativeDate(log.createdAt)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
