'use client'

import { useCallback, useEffect, useState } from 'react'
import { Loader2, RefreshCw, Trash2 } from 'lucide-react'
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

interface AdminOrganization {
  id: string
  name: string
  slug: string
  memberCount: number
  planName: string | null
  subscriptionStatus: string | null
  createdAt: string
}

export function AdminOrganizationsPanel() {
  const [organizations, setOrganizations] = useState<AdminOrganization[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadOrganizations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({ limit: '50' })
      if (search.trim()) params.set('search', search.trim())
      const res = await fetch(`/api/admin/organizations?${params}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load organizations')
      setOrganizations(data.organizations ?? [])
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load organizations'
      )
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    void loadOrganizations()
  }, [loadOrganizations])

  async function deleteOrganization(id: string, name: string) {
    if (
      !window.confirm(`Delete organization "${name}" and all related data?`)
    ) {
      return
    }
    setActionId(id)
    setError(null)
    try {
      const res = await fetch(`/api/admin/organizations/${id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Delete failed')
      await loadOrganizations()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setActionId(null)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organizations</CardTitle>
        <CardDescription>
          All workspaces on the platform — billing, members, and data.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Input
            placeholder="Search by name or slug…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => loadOrganizations()}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
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
        ) : organizations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No organizations found.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-border bg-muted/40 text-left text-xs text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Organization</th>
                  <th className="px-4 py-3 font-medium">Members</th>
                  <th className="px-4 py-3 font-medium">Plan</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {organizations.map((org) => (
                  <tr key={org.id}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{org.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {org.slug}
                      </p>
                    </td>
                    <td className="px-4 py-3">{org.memberCount}</td>
                    <td className="px-4 py-3">
                      {org.planName ? (
                        <Badge variant="secondary">{org.planName}</Badge>
                      ) : (
                        <span className="text-muted-foreground">Free</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(org.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        disabled={actionId === org.id}
                        onClick={() => deleteOrganization(org.id, org.name)}
                      >
                        {actionId === org.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
