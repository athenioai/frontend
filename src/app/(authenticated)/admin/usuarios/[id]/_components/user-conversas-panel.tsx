'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  Bot,
  MessageSquare,
  MessagesSquare,
  ArrowLeft,
  Calendar,
  ChevronUp,
  SendHorizontal,
  UserRound,
  UserCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MOTION } from '@/lib/motion'
import { formatRelativeTime, formatDate, formatTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  loadUserMessages,
  loadMoreUserMessages,
} from '../actions'
import type { ChatSession, ChatMessage, Pagination } from '@/lib/services/interfaces/chat-service'

interface UserConversasPanelProps {
  sessions: ChatSession[]
  userId: string
}

export function UserConversasPanel({ sessions, userId }: UserConversasPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
  })
  const [isLoading, startLoad] = useTransition()
  const [isLoadingMore, startLoadMore] = useTransition()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Takeover
  const [isTakeover, setIsTakeover] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function selectSession(sessionId: string) {
    setSelectedId(sessionId)
    setMessages([])
    setIsTakeover(false)
    setInputValue('')

    startLoad(async () => {
      const result = await loadUserMessages(userId, sessionId)
      if (result.success && result.data && result.pagination) {
        setMessages(result.data)
        setPagination(result.pagination)
        requestAnimationFrame(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
          }
        })
      }
    })
  }

  function handleLoadMore() {
    if (!selectedId) return
    const prevPage = pagination.page - 1
    if (prevPage < 1) return

    const container = scrollRef.current
    const prevScrollHeight = container?.scrollHeight ?? 0

    startLoadMore(async () => {
      const result = await loadMoreUserMessages(userId, selectedId, prevPage)
      if (result.success && result.data && result.pagination) {
        setMessages((prev) => [...result.data!, ...prev])
        setPagination(result.pagination)
        requestAnimationFrame(() => {
          if (container) {
            container.scrollTop = container.scrollHeight - prevScrollHeight
          }
        })
      }
    })
  }

  // Takeover handlers
  useEffect(() => {
    if (isTakeover) {
      requestAnimationFrame(() => {
        if (scrollRef.current)
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        textareaRef.current?.focus()
      })
    }
  }, [isTakeover])

  function handleTextareaInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setInputValue(e.target.value)
    const el = e.target
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleSend() {
    const content = inputValue.trim()
    if (!content || !selectedId) return

    const agent = messages[0]?.agent ?? 'ai'
    const newMessage: ChatMessage = {
      id: crypto.randomUUID(),
      sessionId: selectedId,
      agent,
      role: 'assistant',
      content,
      appointmentId: null,
      createdAt: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, newMessage])
    setInputValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    requestAnimationFrame(() => {
      if (scrollRef.current)
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    })
  }

  const hasMore = pagination.page > 1
  const selectedSession = sessions.find((s) => s.sessionId === selectedId)
  const agent = messages[0]?.agent ?? selectedSession?.agent ?? 'ai'
  const agentLabel = agent.charAt(0).toUpperCase() + agent.slice(1)

  return (
    <div className="flex h-[600px] overflow-hidden rounded-xl border border-border-default lg:h-[700px]">
      {/* ── Left panel: sessions ── */}
      <div
        className={cn(
          'flex w-full flex-col bg-surface-1 lg:w-[340px] lg:shrink-0',
          selectedId ? 'hidden lg:flex' : 'flex',
        )}
      >
        {/* Header */}
        <div className="shrink-0 px-4 pt-4 pb-3">
          <p className="text-sm font-semibold text-text-primary">Conversas</p>
        </div>
        <div className="mx-4 h-px bg-gradient-to-r from-accent/10 via-[rgba(28,27,24,0.06)] to-transparent" />

        {/* Session list */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <MessagesSquare className="h-8 w-8 text-text-subtle/50" />
              <p className="mt-3 text-sm text-text-muted">Nenhuma conversa</p>
            </div>
          ) : (
            <div className="space-y-0.5">
              {sessions.map((session) => {
                const isActive = session.sessionId === selectedId
                const label =
                  session.agent.charAt(0).toUpperCase() +
                  session.agent.slice(1)

                return (
                  <button
                    key={session.sessionId}
                    onClick={() => selectSession(session.sessionId)}
                    className={cn(
                      'group flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-all duration-150',
                      isActive
                        ? 'bg-accent/[0.08]'
                        : 'hover:bg-[rgba(255,255,255,0.03)]',
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors',
                        isActive
                          ? 'bg-accent/15 text-accent'
                          : 'bg-surface-2 text-text-subtle',
                      )}
                    >
                      <Bot className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <span
                          className={cn(
                            'text-[13px] font-semibold',
                            isActive ? 'text-accent' : 'text-text-primary',
                          )}
                        >
                          {label}
                        </span>
                        <span className="shrink-0 text-[10px] text-text-subtle">
                          {formatRelativeTime(session.lastMessageAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-text-muted">
                        {session.lastMessage}
                      </p>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-text-subtle">
                        <MessageSquare className="h-2.5 w-2.5" />
                        <span>{session.messageCount}</span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="hidden w-px bg-gradient-to-b from-transparent via-accent/15 to-transparent lg:block" />

      {/* ── Right panel: messages ── */}
      <div
        className={cn(
          'flex min-w-0 flex-1 flex-col bg-surface-1',
          selectedId ? 'flex' : 'hidden lg:flex',
        )}
      >
        {!selectedId ? (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2">
              <MessagesSquare className="h-7 w-7 text-text-subtle/50" />
            </div>
            <p className="mt-4 font-title text-base font-semibold text-text-muted">
              Selecione uma conversa
            </p>
            <p className="mt-1 text-sm text-text-subtle">
              Escolha uma conversa ao lado para ver as mensagens
            </p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex shrink-0 items-center gap-3 border-b border-border-default px-4 py-3">
              <button
                onClick={() => setSelectedId(null)}
                className="lg:hidden"
              >
                <Button variant="ghost" size="icon-sm">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </button>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent">
                <Bot className="h-3 w-3" />
                {agentLabel}
              </span>
              {messages.length > 0 && (
                <span className="text-xs text-text-subtle">
                  {formatDate(messages[0].createdAt)}
                </span>
              )}
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-text-subtle/30 border-t-text-muted" />
                </div>
              ) : (
                <div className="mx-auto max-w-2xl px-4 py-6">
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
                            Carregar mais
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  <div className="space-y-3">
                    {messages.map((msg) => {
                      const isAssistant = msg.role === 'assistant'
                      return (
                        <div
                          key={msg.id}
                          className={`flex ${isAssistant ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[75%] px-4 py-3 ${
                              isAssistant
                                ? 'rounded-tl-xl rounded-tr-sm rounded-bl-xl rounded-br-xl bg-accent/[0.08] ring-1 ring-accent/[0.06]'
                                : 'rounded-tl-sm rounded-tr-xl rounded-bl-xl rounded-br-xl bg-surface-2'
                            }`}
                          >
                            <p
                              className={`mb-1 text-[10px] font-semibold uppercase tracking-wider ${
                                isAssistant
                                  ? 'text-accent/50'
                                  : 'text-text-subtle'
                              }`}
                            >
                              {isAssistant ? agentLabel : 'Cliente'}
                            </p>
                            <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-primary">
                              {msg.content}
                            </p>
                            {msg.appointmentId && (
                              <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-success/10 px-2.5 py-1.5 ring-1 ring-success/10">
                                <Calendar className="h-3 w-3 text-success" />
                                <span className="text-[11px] font-medium text-success">
                                  Agendamento criado
                                </span>
                              </div>
                            )}
                            <p
                              className={`mt-1.5 text-[10px] ${
                                isAssistant
                                  ? 'text-accent/35'
                                  : 'text-text-subtle/70'
                              }`}
                            >
                              {formatTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Input bar */}
            <div className="shrink-0 border-t border-border-default">
              <AnimatePresence mode="wait" initial={false}>
                {!isTakeover ? (
                  <motion.div
                    key="observe"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div className="flex items-center gap-2 text-sm text-text-subtle">
                      <Bot className="h-4 w-4" />
                      <span>IA respondendo</span>
                    </div>
                    <button
                      onClick={() => setIsTakeover(true)}
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
                    <div className="flex items-center justify-between border-b border-accent/[0.08] bg-accent/[0.04] px-4 py-2">
                      <div className="flex items-center gap-2 text-sm font-semibold text-accent">
                        <UserCheck className="h-4 w-4" />
                        Você está respondendo.
                      </div>
                      <button
                        onClick={() => setIsTakeover(false)}
                        className="flex items-center gap-1.5 text-xs text-text-subtle transition-colors hover:text-text-muted"
                      >
                        <Bot className="h-3.5 w-3.5" />
                        Devolver para IA
                      </button>
                    </div>
                    <div className="flex items-end gap-2.5 px-4 py-3">
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
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary-foreground transition-all duration-150 hover:brightness-110 disabled:opacity-25"
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
          </>
        )}
      </div>
    </div>
  )
}
