import type { Metadata } from 'next'
import { ActivityChart } from '@/components/dashboard/activity-chart'
import { DashboardPageHeader } from '@/components/dashboard/dashboard-page-header'
import { MetricsGrid } from '@/components/dashboard/metrics-grid'
import { getDbUserWithMemberships, requireAuth } from '@/lib/auth'
import {
  buildChartFromMemberships,
  getDashboardStats,
} from '@/lib/dashboard-stats'
import { BarChart3 } from 'lucide-react'
import { EmptyState } from '@/components/dashboard/empty-state'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const metadata: Metadata = { title: 'Analytics' }

export default async function AnalyticsPage() {
  await requireAuth()
  const dbUser = await getDbUserWithMemberships()
  const memberships = dbUser?.memberships ?? []
  const { metrics } = getDashboardStats(dbUser)
  const chartData = buildChartFromMemberships(memberships)

  const totalMembers = memberships.reduce(
    (sum, m) => sum + m.organization.members.length,
    0
  )

  return (
    <div className="flex flex-col gap-8">
      <DashboardPageHeader
        title="Analytics"
        description="Workspace insights derived from your organizations and team size."
      />

      {memberships.length === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No analytics yet"
          description="Create an organization to unlock workspace metrics and engagement charts."
          actionLabel="Create organization"
          actionHref="/dashboard/settings"
        />
      ) : (
        <>
          <MetricsGrid metrics={metrics} />
          <ActivityChart
            data={chartData}
            title="Engagement index (estimated)"
          />
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Workspaces
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{memberships.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{totalMembers}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Primary org
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="truncate text-lg font-bold">
                  {memberships[0]?.organization.name}
                </p>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">About these metrics</CardTitle>
              <CardDescription>
                Connect your product analytics (Posthog, Mixpanel, etc.) to
                replace estimates with live data.
              </CardDescription>
            </CardHeader>
          </Card>
        </>
      )}
    </div>
  )
}
