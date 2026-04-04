'use client'

import { useState, useEffect, useCallback } from 'react'
import { clientApi } from '@/lib/api/client-api'
import { toast } from 'sonner'

interface UseApiOptions {
  skip?: boolean
}

interface UseApiResult<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useApi<T>(url: string, options?: UseApiOptions): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(!options?.skip)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await clientApi<T>(url)
      setData(result)
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Unknown error')
      setError(e)

      if (e.message.includes('403')) {
        toast.error('Voce nao tem permissao para esta acao')
      } else if (e.message.includes('429')) {
        toast.error('Muitas requisicoes. Aguarde um momento.')
      } else if (e.message.includes('500')) {
        toast.error('Erro interno. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    if (options?.skip) return
    fetchData()
  }, [fetchData, options?.skip])

  return { data, loading, error, refetch: fetchData }
}
