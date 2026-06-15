import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Building2, Mail, Users } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { AcceptInvitationButton } from '@/components/auth/accept-invitation-button'
import { APP_NAME } from '@/lib/site'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Accept Invitation',
}

interface InvitePageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function InvitePage({ searchParams }: InvitePageProps) {
  const user = await requireAuth()
  const { token } = await searchParams

  if (!token) {
    redirect('/dashboard')
  }

  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { organization: true },
  })

  if (!invitation || invitation.status !== 'PENDING') {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <h1 className="text-lg font-semibold">Invitation unavailable</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This invitation is invalid or has already been used.
        </p>
        <Link
          href="/dashboard"
          className="mt-4 inline-block text-sm text-primary"
        >
          Go to dashboard
        </Link>
      </div>
    )
  }

  if (invitation.expiresAt < new Date()) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center">
        <h1 className="text-lg font-semibold">Invitation expired</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ask your team admin to send a new invitation.
        </p>
      </div>
    )
  }

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
  const memberCount = await prisma.organizationMember.count({
    where: { organizationId: invitation.organizationId },
  })

  const initials = invitation.organization.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-border bg-card p-6 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet-600 text-xl font-bold text-primary-foreground shadow-md">
          {initials || <Building2 className="h-8 w-8" />}
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          Join {invitation.organization.name}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You&apos;ve been invited to collaborate on {APP_NAME}.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Badge variant="secondary" className="capitalize">
            {invitation.role.toLowerCase()}
          </Badge>
          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {memberCount} member{memberCount !== 1 ? 's' : ''}
          </span>
        </div>
        <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Mail className="h-3.5 w-3.5" />
          Signed in as {dbUser?.email}
        </p>
      </div>

      <AcceptInvitationButton token={token} />

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/dashboard" className="text-primary hover:underline">
          Skip for now
        </Link>
      </p>
    </div>
  )
}
