export const DEMO_ADMIN_METRICS = [
  { label: 'Organizations', value: '48', change: 'Platform-wide', up: true },
  { label: 'Users', value: '312', change: 'Registered accounts', up: true },
  { label: 'Signups (7d)', value: '23', change: 'New accounts', up: true },
  {
    label: 'Active subscriptions',
    value: '36',
    change: 'Paying orgs',
    up: true,
  },
  {
    label: 'Pending invites',
    value: '5',
    change: 'Awaiting acceptance',
    up: false,
  },
  {
    label: 'Blocked users',
    value: '2',
    change: 'Suspended or banned',
    up: false,
  },
  { label: 'Audit events', value: '1,204', change: 'All time', up: true },
] as const

export const DEMO_ADMIN_USERS = [
  {
    id: 'demo-user-1',
    email: 'alex@acme.co',
    name: 'Alex Rivera',
    status: 'ACTIVE' as const,
    suspendedReason: null,
    isPlatformAdmin: true,
    emailVerified: true,
    organizationCount: 2,
    createdAt: '2026-06-10T14:22:00.000Z',
  },
  {
    id: 'demo-user-2',
    email: 'sarah@nimbus.io',
    name: 'Sarah Mitchell',
    status: 'ACTIVE' as const,
    suspendedReason: null,
    isPlatformAdmin: false,
    emailVerified: true,
    organizationCount: 1,
    createdAt: '2026-06-12T09:15:00.000Z',
  },
  {
    id: 'demo-user-3',
    email: 'spam@badactor.test',
    name: null,
    status: 'SUSPENDED' as const,
    suspendedReason: 'Abuse reports — manual review',
    isPlatformAdmin: false,
    emailVerified: false,
    organizationCount: 0,
    createdAt: '2026-06-08T18:40:00.000Z',
  },
  {
    id: 'demo-user-4',
    email: 'james@flowstack.dev',
    name: 'James Okonkwo',
    status: 'ACTIVE' as const,
    suspendedReason: null,
    isPlatformAdmin: false,
    emailVerified: true,
    organizationCount: 1,
    createdAt: '2026-06-14T11:05:00.000Z',
  },
  {
    id: 'demo-user-5',
    email: 'banned@example.com',
    name: 'Bad Actor',
    status: 'BANNED' as const,
    suspendedReason: 'Chargeback fraud',
    isPlatformAdmin: false,
    emailVerified: true,
    organizationCount: 1,
    createdAt: '2026-05-20T08:00:00.000Z',
  },
]

export const DEMO_ADMIN_USER_DETAILS: Record<
  string,
  {
    id: string
    email: string
    name: string | null
    status: string
    suspendedReason: string | null
    isPlatformAdmin: boolean
    emailVerified: boolean
    createdAt: string
    stats: { auditLogs: number; apiKeys: number; invitations: number }
    memberships: {
      role: string
      joinedAt: string
      organization: {
        id: string
        name: string
        slug: string
        planName: string | null
        subscriptionStatus: string | null
      }
    }[]
  }
> = {
  'demo-user-1': {
    id: 'demo-user-1',
    email: 'alex@acme.co',
    name: 'Alex Rivera',
    status: 'ACTIVE',
    suspendedReason: null,
    isPlatformAdmin: true,
    emailVerified: true,
    createdAt: '2026-06-10T14:22:00.000Z',
    stats: { auditLogs: 42, apiKeys: 3, invitations: 8 },
    memberships: [
      {
        role: 'SUPER_ADMIN',
        joinedAt: '2026-01-15T10:00:00.000Z',
        organization: {
          id: 'demo-org-1',
          name: 'Acme Corporation',
          slug: 'acme',
          planName: 'Pro',
          subscriptionStatus: 'ACTIVE',
        },
      },
      {
        role: 'MEMBER',
        joinedAt: '2026-03-01T12:00:00.000Z',
        organization: {
          id: 'demo-org-2',
          name: 'Studio North',
          slug: 'studio-north',
          planName: 'Starter',
          subscriptionStatus: 'ACTIVE',
        },
      },
    ],
  },
  'demo-user-2': {
    id: 'demo-user-2',
    email: 'sarah@nimbus.io',
    name: 'Sarah Mitchell',
    status: 'ACTIVE',
    suspendedReason: null,
    isPlatformAdmin: false,
    emailVerified: true,
    createdAt: '2026-06-12T09:15:00.000Z',
    stats: { auditLogs: 12, apiKeys: 1, invitations: 2 },
    memberships: [
      {
        role: 'ADMIN',
        joinedAt: '2026-02-20T08:30:00.000Z',
        organization: {
          id: 'demo-org-3',
          name: 'Nimbus Labs',
          slug: 'nimbus-labs',
          planName: 'Pro',
          subscriptionStatus: 'ACTIVE',
        },
      },
    ],
  },
}

export const DEMO_ADMIN_ORGANIZATIONS = [
  {
    id: 'demo-org-1',
    name: 'Acme Corporation',
    slug: 'acme',
    memberCount: 12,
    planName: 'Pro',
    subscriptionStatus: 'ACTIVE',
    createdAt: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 'demo-org-2',
    name: 'Studio North',
    slug: 'studio-north',
    memberCount: 5,
    planName: 'Starter',
    subscriptionStatus: 'ACTIVE',
    createdAt: '2026-03-01T12:00:00.000Z',
  },
  {
    id: 'demo-org-3',
    name: 'Nimbus Labs',
    slug: 'nimbus-labs',
    memberCount: 8,
    planName: 'Pro',
    subscriptionStatus: 'ACTIVE',
    createdAt: '2026-02-20T08:30:00.000Z',
  },
  {
    id: 'demo-org-4',
    name: 'Flowstack',
    slug: 'flowstack',
    memberCount: 3,
    planName: null,
    subscriptionStatus: null,
    createdAt: '2026-06-01T16:45:00.000Z',
  },
]

export const DEMO_ADMIN_INVITATIONS = [
  {
    id: 'demo-inv-1',
    email: 'morgan@acme.co',
    role: 'MEMBER',
    status: 'PENDING',
    expiresAt: '2026-06-22T12:00:00.000Z',
    organizationName: 'Acme Corporation',
    invitedByEmail: 'alex@acme.co',
    createdAt: '2026-06-15T12:00:00.000Z',
  },
  {
    id: 'demo-inv-2',
    email: 'priya@nimbus.io',
    role: 'ADMIN',
    status: 'PENDING',
    expiresAt: '2026-06-20T09:00:00.000Z',
    organizationName: 'Nimbus Labs',
    invitedByEmail: 'sarah@nimbus.io',
    createdAt: '2026-06-13T09:00:00.000Z',
  },
  {
    id: 'demo-inv-3',
    email: 'old@example.com',
    role: 'MEMBER',
    status: 'EXPIRED',
    expiresAt: '2026-05-01T00:00:00.000Z',
    organizationName: 'Studio North',
    invitedByEmail: 'alex@acme.co',
    createdAt: '2026-04-24T00:00:00.000Z',
  },
]

export const DEMO_ADMIN_SUBSCRIPTIONS = {
  summary: { mrrFormatted: '$2,844', activeCount: 36 },
  subscriptions: [
    {
      id: 'demo-sub-1',
      status: 'ACTIVE',
      paymentProvider: 'STRIPE',
      cancelAtPeriodEnd: false,
      currentPeriodEnd: '2026-07-15T00:00:00.000Z',
      planName: 'Pro',
      planAmount: 2900,
      organization: {
        id: 'demo-org-1',
        name: 'Acme Corporation',
        slug: 'acme',
        memberCount: 12,
      },
    },
    {
      id: 'demo-sub-2',
      status: 'ACTIVE',
      paymentProvider: 'WHOP',
      cancelAtPeriodEnd: false,
      currentPeriodEnd: '2026-07-01T00:00:00.000Z',
      planName: 'Starter',
      planAmount: 900,
      organization: {
        id: 'demo-org-2',
        name: 'Studio North',
        slug: 'studio-north',
        memberCount: 5,
      },
    },
    {
      id: 'demo-sub-3',
      status: 'PAST_DUE',
      paymentProvider: 'PAYPAL',
      cancelAtPeriodEnd: false,
      currentPeriodEnd: '2026-06-20T00:00:00.000Z',
      planName: 'Pro',
      planAmount: 2900,
      organization: {
        id: 'demo-org-3',
        name: 'Nimbus Labs',
        slug: 'nimbus-labs',
        memberCount: 8,
      },
    },
  ],
}

export const DEMO_ADMIN_AUDIT_LOGS = [
  {
    id: 'demo-audit-1',
    action: 'admin.user.updated',
    entity: 'user',
    entityId: 'demo-user-3',
    userEmail: 'alex@acme.co',
    organizationName: null,
    createdAt: '2026-06-14T16:30:00.000Z',
  },
  {
    id: 'demo-audit-2',
    action: 'admin.settings.updated',
    entity: 'platform_settings',
    entityId: 'settings-1',
    userEmail: 'alex@acme.co',
    organizationName: null,
    createdAt: '2026-06-13T10:00:00.000Z',
  },
  {
    id: 'demo-audit-3',
    action: 'invitation.created',
    entity: 'invitation',
    entityId: 'demo-inv-1',
    userEmail: 'alex@acme.co',
    organizationName: 'Acme Corporation',
    createdAt: '2026-06-15T12:00:00.000Z',
  },
  {
    id: 'demo-audit-4',
    action: 'organization.created',
    entity: 'organization',
    entityId: 'demo-org-4',
    userEmail: 'james@flowstack.dev',
    organizationName: 'Flowstack',
    createdAt: '2026-06-01T16:45:00.000Z',
  },
]

export const DEMO_ADMIN_SETTINGS = { signupsEnabled: true }

export function filterDemoAdminUsers(options: {
  search?: string
  status?: 'ALL' | 'ACTIVE' | 'SUSPENDED' | 'BANNED'
  recentOnly?: boolean
}) {
  const q = options.search?.trim().toLowerCase()
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000

  return DEMO_ADMIN_USERS.filter((user) => {
    if (
      options.status &&
      options.status !== 'ALL' &&
      user.status !== options.status
    ) {
      return false
    }
    if (options.recentOnly && new Date(user.createdAt).getTime() < cutoff) {
      return false
    }
    if (!q) return true
    return (
      user.email.toLowerCase().includes(q) ||
      (user.name?.toLowerCase().includes(q) ?? false)
    )
  })
}

export function filterDemoAdminOrganizations(search?: string) {
  const q = search?.trim().toLowerCase()
  if (!q) return DEMO_ADMIN_ORGANIZATIONS
  return DEMO_ADMIN_ORGANIZATIONS.filter(
    (org) =>
      org.name.toLowerCase().includes(q) || org.slug.toLowerCase().includes(q)
  )
}

export function filterDemoAdminInvitations(
  status: 'PENDING' | 'ACCEPTED' | 'EXPIRED'
) {
  return DEMO_ADMIN_INVITATIONS.filter((inv) => inv.status === status)
}
