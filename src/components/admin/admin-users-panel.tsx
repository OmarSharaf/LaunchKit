'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  Shield,
  ShieldOff,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface AdminUser {
  id: string
  email: string
  name: string | null
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED'
  suspendedReason: string | null
  isPlatformAdmin: boolean
  emailVerified: boolean
  organizationCount: number
  createdAt: string
}

interface UserDetail {
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

type StatusFilter = 'ALL' | 'ACTIVE' | 'SUSPENDED' | 'BANNED'

export function AdminUsersPanel() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [recentOnly, setRecentOnly] = useState(false)
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<UserDetail | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  const loadUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ limit: '50' })
      if (search.trim()) params.set('search', search.trim())
      if (statusFilter !== 'ALL') params.set('status', statusFilter)
      if (recentOnly) params.set('recentDays', '7')

      const res = await fetch(`/api/admin/users?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load users')
      setUsers(data.users ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, recentOnly])

  useEffect(() => {
    void loadUsers()
  }, [loadUsers])

  async function fetchDetail(id: string) {
    setDetailLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${id}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load user')
      setDetail(data.user)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user')
      setExpandedId(null)
    } finally {
      setDetailLoading(false)
    }
  }

  async function toggleDetail(id: string) {
    if (expandedId === id) {
      setExpandedId(null)
      setDetail(null)
      return
    }
    setExpandedId(id)
    setDetail(null)
    await fetchDetail(id)
  }

  async function updateUser(
    id: string,
    body: Record<string, unknown>
  ): Promise<void> {
    setActionId(id)
    setError(null)
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Update failed')
      await loadUsers()
      if (expandedId === id) await fetchDetail(id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setActionId(null)
    }
  }

  async function deleteUser(id: string, email: string) {
    if (!window.confirm(`Delete user ${email}? This cannot be undone.`)) return
    setActionId(id)
    setError(null)
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Delete failed')
      setExpandedId(null)
      setDetail(null)
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setActionId(null)
    }
  }

  function banUser(id: string) {
    const reason = window.prompt('Ban reason (shown to user on login):')
    if (reason === null) return
    void updateUser(id, {
      status: 'BANNED',
      suspendedReason: reason.trim() || 'Banned by platform admin',
    })
  }

  const filters: { id: StatusFilter; label: string }[] = [
    { id: 'ALL', label: 'All' },
    { id: 'ACTIVE', label: 'Active' },
    { id: 'SUSPENDED', label: 'Suspended' },
    { id: 'BANNED', label: 'Banned' },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Users & signups</CardTitle>
        <CardDescription>
          Filter signups, view membership details, suspend, ban, or grant
          platform admin.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            placeholder="Search by email or name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Button type="button" variant="outline" onClick={() => loadUsers()}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <Button
              key={f.id}
              type="button"
              size="sm"
              variant={statusFilter === f.id ? 'default' : 'outline'}
              onClick={() => setStatusFilter(f.id)}
            >
              {f.label}
            </Button>
          ))}
          <Button
            type="button"
            size="sm"
            variant={recentOnly ? 'default' : 'outline'}
            onClick={() => setRecentOnly((v) => !v)}
          >
            Last 7 days
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
        ) : users.length === 0 ? (
          <p className="text-sm text-muted-foreground">No users found.</p>
        ) : (
          <div className="space-y-2">
            {users.map((user) => (
              <div
                key={user.id}
                className="rounded-xl border border-border bg-card"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => toggleDetail(user.id)}
                  >
                    <p className="font-medium">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.name ?? '—'} · {user.organizationCount} org
                      {user.organizationCount !== 1 ? 's' : ''} ·{' '}
                      {new Date(user.createdAt).toLocaleDateString()}
                      {user.isPlatformAdmin && (
                        <Badge variant="secondary" className="ml-2">
                          Platform admin
                        </Badge>
                      )}
                    </p>
                    {user.suspendedReason && user.status !== 'ACTIVE' && (
                      <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                        {user.suspendedReason}
                      </p>
                    )}
                  </button>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant={
                        user.status === 'ACTIVE' ? 'success' : 'secondary'
                      }
                    >
                      {user.status.toLowerCase()}
                    </Badge>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleDetail(user.id)}
                    >
                      {expandedId === user.id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {expandedId === user.id && (
                  <div className="border-t border-border px-4 py-4">
                    {detailLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    ) : detail ? (
                      <div className="space-y-4">
                        <div className="grid gap-2 text-sm sm:grid-cols-3">
                          <p>
                            <span className="text-muted-foreground">
                              Verified:
                            </span>{' '}
                            {detail.emailVerified ? 'Yes' : 'No'}
                          </p>
                          <p>
                            <span className="text-muted-foreground">
                              Audit events:
                            </span>{' '}
                            {detail.stats.auditLogs}
                          </p>
                          <p>
                            <span className="text-muted-foreground">
                              Invites sent:
                            </span>{' '}
                            {detail.stats.invitations}
                          </p>
                        </div>

                        {detail.memberships.length > 0 && (
                          <ul className="divide-y divide-border rounded-lg border border-border text-sm">
                            {detail.memberships.map((m) => (
                              <li
                                key={m.organization.id}
                                className="flex flex-wrap justify-between gap-2 px-3 py-2"
                              >
                                <span className="font-medium">
                                  {m.organization.name}
                                </span>
                                <span className="text-muted-foreground">
                                  {m.role.toLowerCase()} ·{' '}
                                  {m.organization.planName ?? 'Free'}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}

                        <div className="flex flex-wrap gap-2">
                          {user.status === 'ACTIVE' ? (
                            <>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={actionId === user.id}
                                onClick={() =>
                                  updateUser(user.id, {
                                    status: 'SUSPENDED',
                                    suspendedReason:
                                      'Suspended by platform admin',
                                  })
                                }
                              >
                                Suspend
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                disabled={actionId === user.id}
                                onClick={() => banUser(user.id)}
                              >
                                Ban
                              </Button>
                            </>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              disabled={actionId === user.id}
                              onClick={() =>
                                updateUser(user.id, {
                                  status: 'ACTIVE',
                                  suspendedReason: null,
                                })
                              }
                            >
                              Reactivate
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={actionId === user.id}
                            onClick={() =>
                              updateUser(user.id, {
                                isPlatformAdmin: !user.isPlatformAdmin,
                              })
                            }
                          >
                            {user.isPlatformAdmin ? (
                              <>
                                <ShieldOff className="h-3.5 w-3.5" />
                                Revoke admin
                              </>
                            ) : (
                              <>
                                <Shield className="h-3.5 w-3.5" />
                                Grant admin
                              </>
                            )}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            className={cn('text-destructive')}
                            disabled={actionId === user.id}
                            onClick={() => deleteUser(user.id, user.email)}
                          >
                            Delete user
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
