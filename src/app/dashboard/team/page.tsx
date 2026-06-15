import type { Metadata } from 'next'
import Link from 'next/link'
import { DashboardPageHeader } from '@/components/dashboard/dashboard-page-header'
import { TeamMemberList } from '@/components/dashboard/team-member-list'
import type { DashboardTeamMember } from '@/lib/dashboard-types'
import { getDbUserWithMemberships, requireAuth } from '@/lib/auth'
import { Users } from 'lucide-react'
import { EmptyState } from '@/components/dashboard/empty-state'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const metadata: Metadata = { title: 'Team' }

export default async function TeamPage() {
  await requireAuth()
  const dbUser = await getDbUserWithMemberships()
  const primary = dbUser?.memberships[0]
  const org = primary?.organization

  const members: DashboardTeamMember[] =
    org?.members.map((m) => {
      const isYou = m.user?.id === dbUser?.id
      return {
        id: m.user?.id ?? m.userId,
        name: m.user?.name ?? m.user?.email?.split('@')[0] ?? 'Member',
        email: m.user?.email ?? '—',
        role: isYou ? 'You' : 'Member',
        status: 'active' as const,
      }
    }) ?? []

  const isAdmin = primary?.role === 'ADMIN' || primary?.role === 'SUPER_ADMIN'

  return (
    <div className="flex flex-col gap-8">
      <DashboardPageHeader
        title="Team"
        description={
          org
            ? `Members in ${org.name} — invite colleagues from Settings.`
            : 'Create an organization to manage your team.'
        }
      />

      {!org ? (
        <EmptyState
          icon={Users}
          title="No team yet"
          description="Create an organization first, then invite colleagues from Settings."
          actionLabel="Go to settings"
          actionHref="/dashboard/settings"
        />
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{org.name}</CardTitle>
              <CardDescription>
                {members.length} member{members.length !== 1 ? 's' : ''} ·{' '}
                {primary.role.toLowerCase()} access
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0 sm:p-0">
              <TeamMemberList members={members} />
            </CardContent>
          </Card>

          {isAdmin && (
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">Invite more people</p>
                  <p className="text-sm text-muted-foreground">
                    Send email invitations from organization settings.
                  </p>
                </div>
                <Button asChild>
                  <Link href="/dashboard/settings">Invite in settings</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}
