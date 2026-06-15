'use client'

import { useCallback, useEffect, useState } from 'react'
import type { OrganizationWithSubscription } from '@/types'

export function useOrganization(organizationId?: string) {
  const [organization, setOrganization] =
    useState<OrganizationWithSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetch = useCallback(async () => {
    if (!organizationId) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const res = await window.fetch(`/api/organizations/${organizationId}`)
      if (!res.ok) throw new Error('Failed to fetch organization')
      const data = await res.json()
      setOrganization(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'))
    } finally {
      setLoading(false)
    }
  }, [organizationId])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { organization, loading, error, refetch: fetch }
}
