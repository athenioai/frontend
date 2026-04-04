'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from './useAuth'

type ConnectionStatus = 'connected' | 'reconnecting' | 'disconnected'

interface WSMessage {
  type: string
  payload: Record<string, unknown>
}

export function useWebSocket() {
  const { session } = useAuth()
  const [connected, setConnected] = useState<ConnectionStatus>('disconnected')
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null)
  const [messages, setMessages] = useState<WSMessage[]>([])
  const wsRef = useRef<WebSocket | null>(null)
  const retriesRef = useRef(0)
  const maxRetryDelay = 30000

  const connect = useCallback(() => {
    if (!session?.access_token) return

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3003'
    const wsUrl = apiUrl.replace(/^http/, 'ws')
    const ws = new WebSocket(`${wsUrl}/ws?token=${session.access_token}`)
    wsRef.current = ws

    ws.onopen = () => {
      setConnected('connected')
      retriesRef.current = 0
    }

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as WSMessage
        setLastMessage(msg)
        setMessages((prev) => [...prev, msg])
      } catch {
        // ignore malformed messages
      }
    }

    ws.onclose = () => {
      setConnected('reconnecting')
      const delay = Math.min(1000 * Math.pow(2, retriesRef.current), maxRetryDelay)
      retriesRef.current += 1
      setTimeout(connect, delay)
    }

    ws.onerror = () => {
      ws.close()
    }
  }, [session?.access_token])

  useEffect(() => {
    connect()
    return () => {
      wsRef.current?.close()
    }
  }, [connect])

  return { connected, lastMessage, messages }
}
