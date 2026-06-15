'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export function AdminSettingsPanel() {
  const [signupsEnabled, setSignupsEnabled] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.signupsEnabled !== undefined) {
          setSignupsEnabled(data.signupsEnabled)
        }
      })
      .catch(() => setError('Failed to load settings'))
      .finally(() => setLoading(false))
  }, [])

  async function save(nextValue: boolean) {
    setSaving(true)
    setError(null)
    setSaved(false)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ signupsEnabled: nextValue }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Save failed')
      setSignupsEnabled(data.signupsEnabled)
      setSaved(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform settings</CardTitle>
        <CardDescription>
          Control signups and other global policies for your deployment.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col gap-4 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">Allow new signups</p>
            <p className="text-sm text-muted-foreground">
              When disabled, email registration and new OAuth accounts are
              blocked. Existing users can still sign in.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant={signupsEnabled ? 'default' : 'outline'}
              disabled={saving || signupsEnabled}
              onClick={() => save(true)}
            >
              Enabled
            </Button>
            <Button
              type="button"
              variant={!signupsEnabled ? 'destructive' : 'outline'}
              disabled={saving || !signupsEnabled}
              onClick={() => save(false)}
            >
              Disabled
            </Button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {saved && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400">
            Settings saved.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
