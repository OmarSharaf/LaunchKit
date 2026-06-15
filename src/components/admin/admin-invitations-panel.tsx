'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, RefreshCw, X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

interface AdminInvitation {
  id: string
  email: string
  role: string
  status: string
  expiresAt: string
  organizationName: string
  invitedByEmail: string
  createdAt: string
}

export function AdminInvitationsPanel() {
  const [invitations, setInvitations] = useState<AdminInvitation[]>([])
  const [status, setStatus] = useState<'PENDING' | 'ACCEPTED' | 'EXPIRED'>(
    'PENDING'
  )
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadInvitations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/admin/invitations?status=${status}&limit=50`
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load invitations')
      setInvitations(data.invitations ?? [])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load invitations'
      )
    } finally {
      setLoading(false)
    }
  }, [status])

  useEffect(() => {
    void loadInvitations()
  }, [loadInvitations])

  async function revokeInvitation(id: string, email: string) {
    if (!window.confirm(`Revoke invitation for ${email}?`)) return
    setActionId(id)
    try {
      const res = await fetch(`/api/admin/invitations/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Revoke failed')
      await loadInvitations()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Revoke failed')
    } finally {
      setActionId(null)
    }
  }

  const tabs = [
    { id: 'PENDING' as const, label: 'Pending' },
    { id: 'ACCEPTED' as const, label: 'Accepted' },
    { id: 'EXPIRED' as const, label: 'Expired' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invitations</CardTitle>
        <CardDescription>
          All team invites across organizations — revoke pending invites when
          needed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              type="button"
              size="sm"
              variant={status === tab.id ? 'default' : 'outline'}
              onClick={() => setStatus(tab.id)}
            >
              {tab.label}
            </Button>
          ))}
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={loadInvitations}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : invitations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No {status.toLowerCase()} invitations.
          </p>
        ) : (
          <ul className="divide-y divide-border rounded-xl border border-border text-sm">
            {invitations.map((inv) => (
              <li
                key={inv.id}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="font-medium">{inv.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {inv.organizationName} · {inv.role.toLowerCase()} · invited
                    by {inv.invitedByEmail}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Expires {new Date(inv.expiresAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{inv.status.toLowerCase()}</Badge>
                  {status === 'PENDING' && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      disabled={actionId === inv.id}
                      onClick={() => revokeInvitation(inv.id, inv.email)}
                    >
                      {actionId === inv.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <X className="h-3.5 w-3.5" />
                      )}
                      Revoke
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
