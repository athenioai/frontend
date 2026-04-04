'use client'

import { useState, useEffect, useCallback } from 'react'
import { clientApi } from '@/lib/api/client-api'
import { toast } from 'sonner'

interface UseApiOptions {
  autoFetch?: boolean
}

const ERROR_MESSAGES: Record<number, string> = {
  403: 'Voce nao tem permissao para esta acao',
  404: 'Recurso nao encontrado',
  409: 'Este recurso ja existe',
  429: 'Muitas requisicoes. Aguarde um momento.',
  500: 'Erro interno. Tente novamente.',
  503: 'Servico temporariamente indisponivel',
}

export function useApi<T>(url: string, options: UseApiOptions = {}) {
  const { autoFetch = true } = options
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(autoFetch)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await clientApi<T>(url)
      setData(result)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido'
      setError(message)

      // Extract status code from error message pattern "API error: {status}"
      const statusMatch = message.match(/(\d{3})/)
      const status = statusMatch ? parseInt(statusMatch[1]) : 500
      const toastMessage = ERROR_MESSAGES[status] ?? message

      if (status === 401) {
        window.location.href = '/login'
      } else {
        toast.error(toastMessage)
      }
    } finally {
      setLoading(false)
    }
  }, [url])

  useEffect(() => {
    if (autoFetch) fetchData()
  }, [autoFetch, fetchData])

  return { data, loading, error, refetch: fetchData }
}
