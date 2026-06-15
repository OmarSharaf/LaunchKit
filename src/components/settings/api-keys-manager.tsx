'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import { formatRelativeDate } from '@/lib/utils'
import { Key, Trash2 } from 'lucide-react'

interface ApiKeyRow {
  id: string
  name: string
  prefix: string
  lastUsedAt: string | null
  createdAt: string
}

interface ApiKeysManagerProps {
  organizationId: string
  initialKeys: ApiKeyRow[]
}

export function ApiKeysManager({
  organizationId,
  initialKeys,
}: ApiKeysManagerProps) {
  const [keys, setKeys] = useState(initialKeys)
  const [name, setName] = useState('')
  const [newKey, setNewKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    try {
      const res = await fetch(`/api/organizations/${organizationId}/api-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? 'Failed to create key')
      }

      setKeys((prev) => [data.apiKey, ...prev])
      setNewKey(data.apiKey.key)
      setName('')
      toast({
        title: 'API key created',
        description: 'Copy it now — it won’t be shown again.',
      })
    } catch (err) {
      toast({
        title: 'Error',
        description:
          err instanceof Error ? err.message : 'Failed to create key',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleRevoke(keyId: string) {
    setLoading(true)
    try {
      const res = await fetch(
        `/api/organizations/${organizationId}/api-keys/${keyId}`,
        { method: 'DELETE' }
      )

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Failed to revoke key')
      }

      setKeys((prev) => prev.filter((k) => k.id !== keyId))
      toast({ title: 'API key revoked' })
    } catch (err) {
      toast({
        title: 'Error',
        description:
          err instanceof Error ? err.message : 'Failed to revoke key',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {newKey && (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
          <p className="text-sm font-medium">Your new API key</p>
          <p className="mt-2 break-all font-mono text-sm">{newKey}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => {
              void navigator.clipboard.writeText(newKey)
              toast({ title: 'Copied to clipboard' })
            }}
          >
            Copy key
          </Button>
        </div>
      )}

      <form onSubmit={handleCreate} className="flex flex-wrap gap-3">
        <Input
          placeholder="Key name (e.g. Production)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="max-w-xs"
          disabled={loading}
        />
        <Button type="submit" disabled={loading || !name.trim()}>
          Create API key
        </Button>
      </form>

      {keys.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No API keys yet. Create one to integrate with external services.
        </p>
      ) : (
        <ul className="divide-y divide-border rounded-xl border border-border">
          {keys.map((key) => (
            <li
              key={key.id}
              className="flex items-center justify-between gap-4 px-4 py-3.5 text-sm"
            >
              <div className="flex items-center gap-3">
                <Key className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{key.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {key.prefix}…
                    {key.lastUsedAt
                      ? ` · Last used ${formatRelativeDate(key.lastUsedAt)}`
                      : ' · Never used'}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Revoke ${key.name}`}
                disabled={loading}
                onClick={() => handleRevoke(key.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
