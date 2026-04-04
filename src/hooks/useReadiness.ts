'use client'

import { useState, useEffect, useCallback } from 'react'
import { clientApi } from '@/lib/api/client-api'

interface ReadinessResult {
  ready: boolean
  checks: {
    company_profile: boolean
    products: boolean
    knowledge_base: boolean
    whatsapp: boolean
    orchestrator_config: boolean
  }
}

export type { ReadinessResult }

export function useReadiness() {
  const [readiness, setReadiness] = useState<ReadinessResult | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchReadiness = useCallback(async () => {
    setLoading(true)
    try {
      const data = await clientApi<ReadinessResult>('/api/company/readiness')
      setReadiness(data)
    } catch {
      // silently fail -- banner just won't show
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReadiness()
  }, [fetchReadiness])

  return { readiness, loading, refetch: fetchReadiness }
}
