import { AdminConsole } from '@/components/admin/admin-console'
import { DashboardPageHeader } from '@/components/dashboard/dashboard-page-header'
import { MetricsGrid } from '@/components/dashboard/metrics-grid'
import { DEMO_ADMIN_METRICS } from '@/lib/demo-admin-data'
import { APP_NAME } from '@/lib/site'

export const metadata = {
  title: 'Admin Demo',
  description: `Explore the ${APP_NAME} platform admin console with sample data — no login required.`,
}

export default function DemoAdminPage() {
  return (
    <AdminConsole
      isDemo
      overview={
        <>
          <DashboardPageHeader
            title="Platform admin"
            description="Manage all signups, users, organizations, and platform settings."
          />
          <MetricsGrid metrics={[...DEMO_ADMIN_METRICS]} />
        </>
      }
    />
  )
}
