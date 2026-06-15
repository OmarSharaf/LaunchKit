import type {
  DashboardActivityItem,
  DashboardChartPoint,
  DashboardMetric,
} from '@/lib/dashboard-types'
import { formatRelativeDate, isSubscriptionActive } from '@/lib/utils'

type Membership = {
  role: string
  joinedAt?: Date
  organization: {
    id: string
    name: string
    members: { id: string; user?: { name: string | null } | null }[]
    subscription?: {
      status: string
      currentPeriodEnd: Date
      plan?: { name: string } | null
    } | null
  }
}

type DbUser = {
  name?: string | null
  memberships: Membership[]
}

export function getDashboardStats(dbUser: DbUser | null) {
  const memberships = dbUser?.memberships ?? []
  const orgCount = memberships.length
  const memberCount = memberships.reduce(
    (sum, m) => sum + m.organization.members.length,
    0
  )
  const activeSubs = memberships.filter((m) =>
    m.organization.subscription
      ? isSubscriptionActive(m.organization.subscription.status)
      : false
  ).length

  const metrics: DashboardMetric[] = [
    {
      label: 'Organizations',
      value: String(orgCount),
      change: orgCount > 0 ? 'Active workspaces' : 'Create your first',
      up: orgCount > 0,
    },
    {
      label: 'Team members',
      value: String(memberCount),
      change: memberCount > 1 ? 'Across all orgs' : 'Invite teammates',
      up: memberCount > 0,
    },
    {
      label: 'Paid plans',
      value: String(activeSubs),
      change: activeSubs > 0 ? 'Subscriptions active' : 'Upgrade in billing',
      up: activeSubs > 0,
    },
    {
      label: 'Your role',
      value: memberships[0]?.role.toLowerCase() ?? '—',
      change: memberships[0]?.organization.name ?? 'No org yet',
      up: !!memberships[0],
    },
  ]

  return { metrics, orgCount, memberCount, activeSubs }
}

export function buildChartFromMemberships(
  memberships: Membership[]
): DashboardChartPoint[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const base = memberships.reduce(
    (sum, m) => sum + m.organization.members.length,
    0
  )
  const seed = base || 3

  return days.map((label, i) => ({
    label,
    value: Math.min(100, Math.round(seed * (8 + i * 3) + (i % 2) * 12)),
  }))
}

export function buildActivityFromMemberships(
  memberships: Membership[]
): DashboardActivityItem[] {
  const items: DashboardActivityItem[] = []

  memberships.forEach((m, index) => {
    const org = m.organization
    items.push({
      id: `org-${org.id}`,
      action: `Workspace: ${org.name}`,
      user: `Role · ${m.role.toLowerCase()}`,
      time: 'Active',
      type: 'info',
    })

    if (org.subscription) {
      const active = isSubscriptionActive(org.subscription.status)
      items.push({
        id: `sub-${org.id}`,
        action: active
          ? `${org.subscription.plan?.name ?? 'Paid'} plan active`
          : 'Subscription needs attention',
        user: 'Billing',
        time: formatRelativeDate(org.subscription.currentPeriodEnd),
        type: active ? 'success' : 'warning',
      })
    }

    if (org.members.length > 1 && index < 3) {
      const member = org.members[1]?.user?.name ?? 'Team member'
      items.push({
        id: `member-${org.id}`,
        action: 'Team member on workspace',
        user: member,
        time: 'Recently',
        type: 'info',
      })
    }
  })

  if (items.length === 0) {
    return [
      {
        id: 'empty-1',
        action: 'Create your first organization',
        user: 'Get started',
        time: 'Now',
        type: 'info',
      },
      {
        id: 'empty-2',
        action: 'Invite teammates from Settings',
        user: 'Team',
        time: 'Next',
        type: 'info',
      },
    ]
  }

  return items.slice(0, 6)
}

export function getOnboardingSteps(dbUser: DbUser | null) {
  const memberships = dbUser?.memberships ?? []
  const hasOrg = memberships.length > 0
  const hasMembers = memberships.some((m) => m.organization.members.length > 1)
  const hasPaid = memberships.some((m) =>
    m.organization.subscription
      ? isSubscriptionActive(m.organization.subscription.status)
      : false
  )
  const hasProfile = Boolean(dbUser?.name?.trim())

  return [
    {
      id: 'profile',
      label: 'Complete your profile',
      done: hasProfile,
      href: '/dashboard/settings',
    },
    {
      id: 'org',
      label: 'Create an organization',
      done: hasOrg,
      href: '/dashboard/settings',
    },
    {
      id: 'billing',
      label: 'Choose a subscription plan',
      done: hasPaid,
      href: '/dashboard/billing',
    },
    {
      id: 'team',
      label: 'Invite a team member',
      done: hasMembers,
      href: '/dashboard/team',
    },
    {
      id: 'explore',
      label: 'Explore analytics & settings',
      done: hasOrg && hasPaid,
      href: '/dashboard/analytics',
    },
  ]
}
