import type {
  User,
  Organization,
  OrganizationMember,
  Subscription,
  Plan,
  Invitation,
  AuditLog,
  UserRole,
  SubscriptionStatus,
} from '@prisma/client'

export type {
  User,
  Organization,
  OrganizationMember,
  Subscription,
  Plan,
  Invitation,
  AuditLog,
  UserRole,
  SubscriptionStatus,
}

export type OrganizationWithSubscription = Organization & {
  subscription:
    | (Subscription & {
        plan: Plan
      })
    | null
}

export type MembershipWithOrg = OrganizationMember & {
  organization: OrganizationWithSubscription
}

export type MemberWithUser = OrganizationMember & {
  user: User
}

export type ApiResponse<T = null> =
  | { success: true; data: T }
  | { success: false; error: string }

export interface NavItem {
  title: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string | number
  disabled?: boolean
  external?: boolean
}

export interface NavSection {
  title?: string
  items: NavItem[]
}

export type ColorScheme = 'light' | 'dark' | 'system'
