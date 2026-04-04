'use client'

import { useState, useEffect, useCallback } from 'react'
import { clientApi } from '@/lib/api/client-api'
import type { ReadinessResult } from '@/lib/types'

export function useReadiness() {
  const [readiness, setReadiness] = useState<ReadinessResult | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchReadiness = useCallback(async () => {
    setLoading(true)
    try {
      const data = await clientApi<ReadinessResult>('/api/company/readiness')
      setReadiness(data)
    } catch {
      // silently fail — banner just won't show
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReadiness()
  }, [fetchReadiness])

  return { readiness, loading, refetch: fetchReadiness }
}
