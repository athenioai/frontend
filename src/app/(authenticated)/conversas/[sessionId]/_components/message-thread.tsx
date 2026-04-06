'use client'

import { useState, useTransition } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, Bot, Calendar, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MOTION, fadeInUp, staggerContainer } from '@/lib/motion'
import { formatDate, formatTime } from '@/lib/format'
import { loadMoreMessages } from '../../actions'
import type { ChatMessage, Pagination } from '@/lib/services/interfaces/chat-service'
import Link from 'next/link'

function getAgentBadgeStyle(agent: string) {
  switch (agent) {
    case 'horos':
      return 'bg-accent/10 text-accent'
    default:
      return 'bg-violet/10 text-violet'
  }
}

interface MessageThreadProps {
  sessionId: string
  initialMessages: ChatMessage[]
  initialPagination: Pagination
}

export function MessageThread({
  sessionId,
  initialMessages,
  initialPagination,
}: MessageThreadProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [currentPage, setCurrentPage] = useState(initialPagination.page)
  const [isLoadingMore, startLoadMore] = useTransition()

  const hasMore = currentPage * initialPagination.limit < initialPagination.total
  const agent = messages[0]?.agent ?? 'ai'
  const agentLabel = agent.charAt(0).toUpperCase() + agent.slice(1)
  const startDate = messages.length > 0 ? formatDate(messages[0].createdAt) : ''

  function handleLoadMore() {
    const nextPage = currentPage + 1
    startLoadMore(async () => {
      const result = await loadMoreMessages(sessionId, nextPage)
      if (result.success && result.data) {
        setMessages((prev) => [...result.data!, ...prev])
        setCurrentPage(nextPage)
      }
    })
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
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${getAgentBadgeStyle(agent)}`}
        >
          <Bot className="h-3 w-3" />
          {agentLabel}
        </span>

        {startDate && (
          <span className="text-xs text-text-subtle">
            Iniciada em {startDate}
          </span>
        )}
      </div>

      {/* Messages — scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl px-4 py-6 lg:px-6">
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
                        ? 'rounded-tl-xl rounded-tr-sm rounded-bl-xl rounded-br-xl bg-accent/[0.08] ring-1 ring-accent/[0.06]'
                        : 'rounded-tl-sm rounded-tr-xl rounded-bl-xl rounded-br-xl bg-surface-2'
                    }`}
                  >
                    <p
                      className={`mb-1 text-[10px] font-semibold uppercase tracking-wider ${
                        isAssistant ? 'text-accent/50' : 'text-text-subtle'
                      }`}
                    >
                      {isAssistant ? agentLabel : 'Cliente'}
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
                      className={`mt-1.5 text-[10px] ${
                        isAssistant ? 'text-accent/35' : 'text-text-subtle/70'
                      }`}
                    >
                      {formatTime(message.createdAt)}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
