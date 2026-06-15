import { getDbUserWithMemberships, requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { getActiveOrgId } from '@/lib/org-context'
import { redirect } from 'next/navigation'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { isFeatureEnabled } from '@/lib/feature-flags'
import { isPlatformAdmin } from '@/lib/platform-admin'
import { isSubscriptionActive } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const user = await requireAuth()
  const dbUser = await getDbUserWithMemberships()

  if (dbUser?.status === 'SUSPENDED' || dbUser?.status === 'BANNED') {
    const supabase = await createClient()
    await supabase.auth.signOut()
    const reason =
      dbUser.suspendedReason ??
      (dbUser.status === 'BANNED'
        ? 'Your account has been banned.'
        : 'Your account has been suspended.')
    redirect(`/auth/login?error=${encodeURIComponent(reason)}`)
  }

  const platformAdmin = await isPlatformAdmin(user.id, user.email)

  const membershipIds = dbUser?.memberships.map((m) => m.organization.id) ?? []
  const activeOrgId = await getActiveOrgId(membershipIds)

  const activeMembership =
    dbUser?.memberships.find((m) => m.organization.id === activeOrgId) ??
    dbUser?.memberships[0]

  const org = activeMembership?.organization

  const organizations =
    dbUser?.memberships.map(({ organization: o, role }) => {
      const sub = o.subscription
      const active = sub ? isSubscriptionActive(sub.status) : false
      return {
        id: o.id,
        name: o.name,
        planName: active ? (sub?.plan?.name ?? 'Active') : 'Free',
        role,
      }
    }) ?? []

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/')
  }

  return (
    <DashboardShell
      userName={dbUser?.name ?? 'User'}
      userEmail={user.email ?? ''}
      orgName={org?.name}
      planName={
        org?.subscription && isSubscriptionActive(org.subscription.status)
          ? org.subscription.plan?.name
          : 'Free'
      }
      organizations={organizations.map(({ id, name, planName }) => ({
        id,
        name,
        planName,
      }))}
      activeOrgId={activeOrgId}
      showAudit={isFeatureEnabled('AUDIT_LOG')}
      showAdmin={isFeatureEnabled('ADMIN_DASHBOARD') && platformAdmin}
      signOutAction={signOut}
    >
      {children}
    </DashboardShell>
  )
}
