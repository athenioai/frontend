'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { StatusBadge, FUNNEL_COLORS, TEMPERATURE_COLORS } from '@/components/common/status-badge'
import { useApi } from '@/hooks/useApi'
import { useWebSocket } from '@/hooks/useWebSocket'
import { clientApi } from '@/lib/api/client-api'
import { formatRelativeTime } from '@/lib/utils/format'
import { fadeInUp, MOTION } from '@/lib/motion'
import { Send, UserCheck, ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Message } from '@/lib/types'

const INPUT_CLASS = 'h-11 rounded-xl border-border-default bg-[rgba(240,237,232,0.04)] text-text-primary placeholder:text-text-subtle transition-all duration-200 focus:border-accent/30 focus:ring-2 focus:ring-accent/10'

interface ChatViewProps {
  leadId: string
  leadName: string
  leadPhone: string
  funnelStage: string
  temperature: string
  isHumanTakeover: boolean
  onBack?: () => void
}

export function ChatView({
  leadId,
  leadName,
  leadPhone,
  funnelStage,
  temperature,
  isHumanTakeover,
  onBack,
}: ChatViewProps) {
  const { data: fetchedMessages, loading } = useApi<Message[]>(`/conversations/${leadId}`)
  const { lastMessage } = useWebSocket()
  const [localMessages, setLocalMessages] = useState<Message[]>([])
  const [inputText, setInputText] = useState('')
  const [sending, setSending] = useState(false)
  const [takingOver, setTakingOver] = useState(false)
  const [humanTakeover, setHumanTakeover] = useState(isHumanTakeover)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Sync fetched messages
  useEffect(() => {
    if (fetchedMessages) {
      setLocalMessages(fetchedMessages)
    }
  }, [fetchedMessages])

  // Handle WebSocket new messages
  useEffect(() => {
    if (
      lastMessage?.type === 'new_message' &&
      lastMessage.payload?.lead_id === leadId
    ) {
      const msg = lastMessage.payload as unknown as Message
      setLocalMessages((prev) => {
        // Avoid duplicates
        if (prev.some((m) => m.id === msg.id)) return prev
        return [...prev, msg]
      })
    }
  }, [lastMessage, leadId])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [localMessages])

  const handleSend = useCallback(async () => {
    if (!inputText.trim() || sending) return
    setSending(true)
    try {
      const msg = await clientApi<Message>(`/conversations/${leadId}/messages`, {
        method: 'POST',
        body: JSON.stringify({ content: inputText.trim() }),
      })
      setLocalMessages((prev) => [...prev, msg])
      setInputText('')
    } catch {
      toast.error('Falha ao enviar mensagem')
    } finally {
      setSending(false)
    }
  }, [inputText, sending, leadId])

  const handleTakeOver = useCallback(async () => {
    setTakingOver(true)
    try {
      await clientApi(`/conversations/${leadId}/takeover`, { method: 'POST' })
      setHumanTakeover(true)
      toast.success('Conversa assumida')
    } catch {
      toast.error('Falha ao assumir conversa')
    } finally {
      setTakingOver(false)
    }
  }, [leadId])

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border-default px-4 py-3">
        {/* Back button (mobile) */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-[rgba(255,255,255,0.05)] hover:text-text-primary md:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-title text-[15px] font-bold text-text-primary">
              {leadName}
            </p>
            <StatusBadge status={funnelStage} colorMap={FUNNEL_COLORS} className="text-[10px]" />
            <StatusBadge status={temperature} colorMap={TEMPERATURE_COLORS} className="text-[10px]" />
          </div>
          <p className="text-[12px] text-text-subtle">{leadPhone}</p>
        </div>

        {!humanTakeover && (
          <Button
            onClick={handleTakeOver}
            disabled={takingOver}
            variant="outline"
            className="h-9 shrink-0 gap-1.5 rounded-xl border-accent/20 text-[12px] text-accent transition-all hover:bg-accent/5 hover:border-accent/40"
          >
            {takingOver ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <UserCheck className="h-3.5 w-3.5" />
            )}
            Assumir conversa
          </Button>
        )}
      </div>

      {/* Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-5 w-5 animate-spin text-accent" />
          </div>
        ) : localMessages.length === 0 ? (
          <p className="py-20 text-center text-[13px] text-text-subtle">
            Nenhuma mensagem ainda
          </p>
        ) : (
          <AnimatePresence initial={false}>
            {localMessages.map((msg) => {
              const isInbound = msg.sender === 'lead'
              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: MOTION.duration.normal, ease: MOTION.ease.out }}
                  className={`flex ${isInbound ? 'justify-start' : 'justify-end'}`}
                >
                  <div className="max-w-[75%] space-y-1">
                    <div
                      className={`rounded-2xl px-4 py-2.5 text-[13px] leading-relaxed ${
                        isInbound
                          ? 'rounded-bl-md bg-surface-2 text-text-primary'
                          : 'rounded-br-md bg-gradient-to-br from-accent/12 to-accent/6 text-text-primary'
                      }`}
                    >
                      {msg.text}
                    </div>

                    <div className={`flex items-center gap-2 ${isInbound ? '' : 'justify-end'}`}>
                      {/* Model badge for outbound */}
                      {!isInbound && (
                        <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[10px] text-text-subtle">
                          {msg.model ?? 'humano'}
                        </span>
                      )}
                      <span className="text-[10px] text-text-subtle/60">
                        {formatRelativeTime(msg.created_at)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-border-default p-4">
        <div className="flex gap-2">
          <Input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Digite sua mensagem..."
            className={`${INPUT_CLASS} flex-1`}
            disabled={sending}
          />
          <Button
            onClick={handleSend}
            disabled={!inputText.trim() || sending}
            className="h-11 w-11 shrink-0 rounded-xl bg-accent p-0 text-primary-foreground shadow-[0_0_16px_rgba(79,209,197,0.12)] transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_24px_rgba(79,209,197,0.18)] disabled:opacity-50"
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
