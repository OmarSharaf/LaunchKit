import type { Metadata } from 'next'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { DemoBanner } from '@/components/demo/demo-banner'
import { DemoCoachMarks } from '@/components/demo/demo-coach-marks'
import { DEMO_ORG, DEMO_USER } from '@/lib/demo-data'
import { APP_NAME } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Live Demo',
  description: `Explore the full ${APP_NAME} dashboard without signing in.`,
}

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <DemoBanner />
      <DashboardShell
        basePath="/demo"
        isDemo
        userName={DEMO_USER.name}
        userEmail={DEMO_USER.email}
        orgName={DEMO_ORG.name}
        planName={DEMO_ORG.plan}
        organizations={[
          { id: 'demo-1', name: DEMO_ORG.name, planName: DEMO_ORG.plan },
        ]}
        activeOrgId="demo-1"
        showAdmin={true}
      >
        {children}
      </DashboardShell>
      <DemoCoachMarks />
    </div>
  )
}
