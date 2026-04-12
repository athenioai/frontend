'use client'

import { useCallback, useEffect, useRef, useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  ArrowLeft,
  Bot,
  Calendar,
  ChevronUp,
  Clock,
  Flame,
  SendHorizontal,
  UserRound,
  UserCheck,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MOTION, fadeInUp, staggerContainer } from '@/lib/motion'
import { formatDate, formatTime } from '@/lib/format'
import { loadMoreMessages, sendMessageToLead, activateHandoff, deactivateHandoff, getWsToken } from '../../actions'
import type { ChatMessage, Pagination } from '@/lib/services/interfaces/chat-service'
import Link from 'next/link'

const AGENT_CONFIG: Record<string, { color: string; bgLight: string; bgBubble: string; ringBubble: string; label: string; icon: typeof Bot }> = {
  ares:   { color: '#D4820A', bgLight: 'rgba(212,130,10,0.10)', bgBubble: 'rgba(212,130,10,0.08)', ringBubble: 'rgba(212,130,10,0.06)', label: 'Ares',   icon: Flame },
  kairos: { color: '#C8784A', bgLight: 'rgba(200,120,74,0.10)', bgBubble: 'rgba(200,120,74,0.08)', ringBubble: 'rgba(200,120,74,0.06)', label: 'Kairos', icon: Zap },
  horos:  { color: '#4FD1C5', bgLight: 'rgba(79,209,197,0.10)', bgBubble: 'rgba(79,209,197,0.08)', ringBubble: 'rgba(79,209,197,0.06)', label: 'Horos',  icon: Clock },
  human:  { color: '#D4820A', bgLight: 'rgba(212,130,10,0.10)', bgBubble: 'rgba(212,130,10,0.08)', ringBubble: 'rgba(212,130,10,0.06)', label: 'Humano', icon: UserRound },
}

function getAgentConfig(agent: string, userName?: string) {
  const config = AGENT_CONFIG[agent] ?? { color: '#888', bgLight: 'rgba(136,136,136,0.10)', bgBubble: 'rgba(136,136,136,0.08)', ringBubble: 'rgba(136,136,136,0.06)', label: agent.charAt(0).toUpperCase() + agent.slice(1), icon: Bot }
  if (agent === 'human' && userName) {
    return { ...config, label: userName }
  }
  return config
}

interface MessageThreadProps {
  sessionId: string
  userName: string
  leadName: string
  initialMessages: ChatMessage[]
  initialPagination: Pagination
  initialHandoff: boolean
}

export function MessageThread({
  sessionId,
  userName,
  leadName,
  initialMessages,
  initialPagination,
  initialHandoff,
}: MessageThreadProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [currentPage, setCurrentPage] = useState(initialPagination.page)
  const [isLoadingMore, startLoadMore] = useTransition()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Takeover state
  const [isTakeover, setIsTakeover] = useState(initialHandoff)
  const [inputValue, setInputValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const hasMore = currentPage > 1

  // Find the last AI agent (not human) to know which agent to "return to"
  const lastAiAgent = [...messages].reverse().find((m) => m.role === 'assistant' && m.agent !== 'human')?.agent ?? 'ai'
  const aiConfig = getAgentConfig(lastAiAgent)
  const AiIcon = aiConfig.icon

  // Header shows current state
  const headerAgent = isTakeover ? 'human' : lastAiAgent
  const headerConfig = getAgentConfig(headerAgent, userName)
  const HeaderIcon = headerConfig.icon
  const startDate = messages.length > 0 ? formatDate(messages[0].createdAt) : ''

  // Scroll to bottom on initial load
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [])

  // WebSocket — real-time message updates
  useEffect(() => {
    let ws: WebSocket | null = null
    let canceled = false

    async function connect() {
      const token = await getWsToken()
      if (!token || canceled) return

      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'
      const wsUrl = apiUrl.replace(/^http/, 'ws') + `/ws?token=${encodeURIComponent(token)}`
      ws = new WebSocket(wsUrl)

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.type === 'new_message' && data.sessionId === sessionId) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === data.message.id)) return prev
              return [...prev, data.message]
            })
            scrollToBottom()
          }
        } catch {
          // ignore malformed messages
        }
      }

      ws.onclose = () => {
        if (!canceled) {
          setTimeout(connect, 3000)
        }
      }
    }

    connect()

    return () => {
      canceled = true
      ws?.close()
    }
  }, [sessionId])

  function scrollToBottom() {
    requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
      }
    })
  }

  // Focus textarea and scroll to bottom when takeover activates
  useEffect(() => {
    if (isTakeover) {
      scrollToBottom()
      requestAnimationFrame(() => textareaRef.current?.focus())
    }
  }, [isTakeover])

  const handleLoadMore = useCallback(() => {
    const prevPage = currentPage - 1
    if (prevPage < 1) return

    const container = scrollRef.current
    const prevScrollHeight = container?.scrollHeight ?? 0

    startLoadMore(async () => {
      const result = await loadMoreMessages(sessionId, prevPage)
      if (result.success && result.data) {
        setMessages((prev) => [...result.data!, ...prev])
        setCurrentPage(prevPage)

        requestAnimationFrame(() => {
          if (container) {
            container.scrollTop = container.scrollHeight - prevScrollHeight
          }
        })
      }
    })
  }, [currentPage, sessionId])

  const handleTextareaInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }, [])

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  async function handleTakeover() {
    const result = await activateHandoff(sessionId)
    if (result.success) {
      setIsTakeover(true)
    }
  }

  async function handleReturn() {
    const result = await deactivateHandoff(sessionId)
    if (result.success) {
      setIsTakeover(false)
    }
  }

  async function handleSend() {
    const content = inputValue.trim()
    if (!content) return

    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sessionId,
      agent: 'human',
      role: 'assistant',
      content,
      appointmentId: null,
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, newMessage])
    setInputValue('')

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    scrollToBottom()

    const result = await sendMessageToLead(sessionId, content)
    if (!result.success) {
      setMessages((prev) => prev.filter((m) => m.id !== newMessage.id))
    }
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header bar */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border-default bg-surface-1 px-4 py-3">
        <Link href="/conversas" className="lg:hidden">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>

        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
          style={{ backgroundColor: headerConfig.bgLight, color: headerConfig.color }}
        >
          <HeaderIcon className="h-3 w-3" />
          {headerConfig.label}
        </span>

        {startDate && (
          <span className="text-xs text-text-subtle">
            Iniciada em {startDate}
          </span>
        )}
      </div>

      {/* Messages — scrollable */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6 lg:px-6 2xl:max-w-4xl">
          {/* Load more */}
          {hasMore && (
            <div className="mb-6 flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="text-text-muted"
              >
                {isLoadingMore ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-3 w-3 animate-spin rounded-full border-2 border-text-subtle/30 border-t-text-muted" />
                    Carregando...
                  </span>
                ) : (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" />
                    Carregar mais mensagens
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Messages */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-3"
          >
            {messages.map((message) => {
              const isAssistant = message.role === 'assistant'
              const msgConfig = getAgentConfig(message.agent, userName)
              const MsgIcon = msgConfig.icon

              return (
                <motion.div
                  key={message.id}
                  variants={fadeInUp}
                  transition={{
                    duration: MOTION.duration.normal,
                    ease: MOTION.ease.out,
                  }}
                  className={`flex ${isAssistant ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-3 ${
                      isAssistant
                        ? 'rounded-tl-xl rounded-tr-sm rounded-bl-xl rounded-br-xl ring-1'
                        : 'rounded-tl-sm rounded-tr-xl rounded-bl-xl rounded-br-xl bg-surface-2'
                    }`}
                    style={isAssistant ? { backgroundColor: msgConfig.bgBubble, '--tw-ring-color': msgConfig.ringBubble } as React.CSSProperties : undefined}
                  >
                    <p
                      className="mb-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider"
                      style={isAssistant ? { color: `${msgConfig.color}80` } : undefined}
                    >
                      {isAssistant && <MsgIcon className="h-2.5 w-2.5" />}
                      <span className={!isAssistant ? 'text-text-subtle' : ''}>
                        {isAssistant ? msgConfig.label : leadName}
                      </span>
                    </p>

                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-primary">
                      {message.content}
                    </p>

                    {message.appointmentId && (
                      <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-success/10 px-2.5 py-1.5 ring-1 ring-success/10">
                        <Calendar className="h-3 w-3 text-success" />
                        <span className="text-[11px] font-medium text-success">
                          Agendamento criado
                        </span>
                      </div>
                    )}

                    <p
                      className="mt-1.5 text-[10px]"
                      style={isAssistant ? { color: `${msgConfig.color}59` } : undefined}
                    >
                      <span className={!isAssistant ? 'text-text-subtle/70' : ''}>
                        {formatTime(message.createdAt)}
                      </span>
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>

      {/* ── Input bar ── */}
      <div className="shrink-0 border-t border-border-default">
        <AnimatePresence mode="wait" initial={false}>
          {!isTakeover ? (
            <motion.div
              key="observe"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-between px-4 py-3 lg:px-6"
            >
              <div className="flex items-center gap-2 text-sm" style={{ color: aiConfig.color }}>
                <AiIcon className="h-4 w-4" />
                <span>{aiConfig.label} respondendo</span>
              </div>
              <button
                onClick={handleTakeover}
                className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium text-accent ring-1 ring-accent/25 transition-all duration-200 hover:bg-accent/[0.08] hover:ring-accent/40"
              >
                <UserRound className="h-4 w-4" />
                Assumir conversa
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="takeover"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2, ease: MOTION.ease.out }}
            >
              {/* Status strip */}
              <div className="flex items-center justify-between border-b border-accent/[0.08] bg-accent/[0.04] px-4 py-2 lg:px-6">
                <div className="flex items-center gap-2 text-sm font-semibold text-accent">
                  <UserCheck className="h-4 w-4" />
                  Você está respondendo.
                </div>
                <button
                  onClick={handleReturn}
                  className="flex items-center gap-1.5 text-xs transition-colors hover:text-text-muted"
                  style={{ color: aiConfig.color }}
                >
                  <AiIcon className="h-3.5 w-3.5" />
                  Devolver para {aiConfig.label}
                </button>
              </div>

              {/* Input */}
              <div className="flex items-end gap-2.5 px-4 py-3 lg:px-6">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={handleTextareaInput}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua mensagem..."
                  rows={1}
                  className="flex-1 resize-none rounded-xl bg-surface-2 px-4 py-2.5 text-sm leading-relaxed text-text-primary outline-none ring-1 ring-transparent placeholder:text-text-subtle transition-shadow focus:ring-accent/25"
                  style={{ maxHeight: 120 }}
                />
                <button
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary-foreground transition-all duration-150 hover:brightness-110 disabled:opacity-25 disabled:hover:brightness-100"
                  style={{
                    boxShadow: inputValue.trim()
                      ? '0 0 16px rgba(212, 130, 10, 0.15)'
                      : 'none',
                  }}
                >
                  <SendHorizontal className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
