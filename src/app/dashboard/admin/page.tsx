import { DashboardPageHeader } from '@/components/dashboard/dashboard-page-header'
import { MetricsGrid } from '@/components/dashboard/metrics-grid'
import { AdminConsole } from '@/components/admin/admin-console'
import { requireAuth } from '@/lib/auth'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { isPlatformAdmin } from '@/lib/platform-admin'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'

export const metadata = { title: 'Admin' }

export default async function AdminPage() {
  if (!isFeatureEnabled('ADMIN_DASHBOARD')) {
    redirect('/dashboard')
  }

  const user = await requireAuth()
  if (!(await isPlatformAdmin(user.id, user.email))) {
    redirect('/dashboard')
  }

  const [
    organizations,
    users,
    activeSubscriptions,
    auditLogs,
    signupsLast7Days,
    pendingInvitations,
    suspendedUsers,
  ] = await Promise.all([
    prisma.organization.count(),
    prisma.user.count(),
    prisma.subscription.count({ where: { status: 'ACTIVE' } }),
    prisma.auditLog.count(),
    prisma.user.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.invitation.count({ where: { status: 'PENDING' } }),
    prisma.user.count({
      where: { status: { in: ['SUSPENDED', 'BANNED'] } },
    }),
  ])

  const metrics = [
    {
      label: 'Organizations',
      value: String(organizations),
      change: 'Platform-wide',
      up: true,
    },
    {
      label: 'Users',
      value: String(users),
      change: 'Registered accounts',
      up: true,
    },
    {
      label: 'Signups (7d)',
      value: String(signupsLast7Days),
      change: 'New accounts',
      up: signupsLast7Days > 0,
    },
    {
      label: 'Active subscriptions',
      value: String(activeSubscriptions),
      change: 'Paying orgs',
      up: true,
    },
    {
      label: 'Pending invites',
      value: String(pendingInvitations),
      change: 'Awaiting acceptance',
      up: pendingInvitations === 0,
    },
    {
      label: 'Blocked users',
      value: String(suspendedUsers),
      change: 'Suspended or banned',
      up: suspendedUsers === 0,
    },
    {
      label: 'Audit events',
      value: String(auditLogs),
      change: 'All time',
      up: true,
    },
  ]

  return (
    <AdminConsole
      overview={
        <>
          <DashboardPageHeader
            title="Platform admin"
            description="Manage all signups, users, organizations, and platform settings."
          />
          <MetricsGrid metrics={metrics} />
        </>
      }
    />
  )
}
