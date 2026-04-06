'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import {
  Bot,
  Trash2,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  MessagesSquare,
  SlidersHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MOTION, fadeInUp, staggerContainer } from '@/lib/motion'
import { formatRelativeTime } from '@/lib/format'
import { deleteChatSession } from '../actions'
import { DeleteDialog } from './delete-dialog'
import type { ChatSession, Pagination } from '@/lib/services/interfaces/chat-service'
import Link from 'next/link'

const AGENTS = [
  { value: '', label: 'Todos os agentes' },
  { value: 'horos', label: 'Horos' },
]

function getAgentStyle(agent: string) {
  switch (agent) {
    case 'horos':
      return { accent: 'bg-accent', badge: 'bg-accent/10 text-accent' }
    default:
      return { accent: 'bg-violet', badge: 'bg-violet/10 text-violet' }
  }
}

interface SessionListProps {
  sessions: ChatSession[]
  pagination: Pagination
  currentAgent?: string
}

export function SessionList({ sessions, pagination, currentAgent }: SessionListProps) {
  const router = useRouter()
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isDeleting, startDeleteTransition] = useTransition()

  const totalPages = Math.ceil(pagination.total / pagination.limit)

  function handleFilterChange(agent: string) {
    const params = new URLSearchParams()
    if (agent) params.set('agent', agent)
    router.push(`/conversas${params.toString() ? `?${params}` : ''}`)
  }

  function handlePageChange(page: number) {
    const params = new URLSearchParams()
    if (currentAgent) params.set('agent', currentAgent)
    if (page > 1) params.set('page', String(page))
    router.push(`/conversas${params.toString() ? `?${params}` : ''}`)
  }

  function handleDelete(sessionId: string) {
    startDeleteTransition(async () => {
      const result = await deleteChatSession(sessionId)
      if (result.success) {
        setDeleteTarget(null)
        router.refresh()
      }
    })
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
        >
          <h1 className="font-title text-2xl font-bold text-text-primary">
            Conversas
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Historico de conversas com seus agentes de IA
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: MOTION.duration.slow,
            ease: MOTION.ease.out,
            delay: 0.08,
          }}
          className="mt-5 flex items-center gap-2.5"
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-text-subtle" />
          <select
            value={currentAgent ?? ''}
            onChange={(e) => handleFilterChange(e.target.value)}
            className="h-8 rounded-lg border border-border-default bg-surface-1 px-3 text-sm text-text-primary outline-none transition-colors hover:border-border-hover focus:border-accent/40 focus:ring-2 focus:ring-accent/15"
          >
            {AGENTS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </motion.div>
      </div>

      {/* Session list */}
      {sessions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
          className="flex flex-col items-center justify-center py-24"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2">
            <MessagesSquare className="h-8 w-8 text-text-subtle" />
          </div>
          <p className="mt-4 font-title text-lg font-semibold text-text-primary">
            Nenhuma conversa ainda
          </p>
          <p className="mt-1 text-sm text-text-muted">
            As conversas com seus leads aparecerao aqui
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="space-y-3"
        >
          {sessions.map((session) => {
            const style = getAgentStyle(session.agent)
            const agentLabel =
              session.agent.charAt(0).toUpperCase() + session.agent.slice(1)
            const roleLabel =
              session.lastRole === 'assistant' ? agentLabel : 'Cliente'

            return (
              <motion.article
                key={session.sessionId}
                variants={fadeInUp}
                transition={{
                  duration: MOTION.duration.normal,
                  ease: MOTION.ease.out,
                }}
                className="card-surface card-surface-interactive group relative overflow-hidden"
              >
                {/* Accent bar */}
                <div
                  className={`absolute inset-y-0 left-0 w-0.5 ${style.accent}`}
                />

                {/* Main content */}
                <Link
                  href={`/conversas/${session.sessionId}`}
                  className="block p-4 pl-5"
                >
                  {/* Top row: badge + time */}
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${style.badge}`}
                    >
                      <Bot className="h-3 w-3" />
                      {agentLabel}
                    </span>
                    <span className="ml-auto text-xs text-text-subtle">
                      {formatRelativeTime(session.lastMessageAt)}
                    </span>
                  </div>

                  {/* Message preview */}
                  <p className="mt-2.5 line-clamp-1 text-sm leading-relaxed text-text-primary">
                    {session.lastMessage}
                  </p>

                  {/* Meta */}
                  <div className="mt-2 flex items-center gap-2 text-[11px] text-text-muted">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {session.messageCount}
                    </span>
                    <span className="text-text-subtle/50">·</span>
                    <span>Ultimo: {roleLabel}</span>
                  </div>
                </Link>

                {/* Delete button */}
                <div className="absolute right-3 top-3 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="text-text-subtle hover:bg-danger/10 hover:text-danger"
                    onClick={() => setDeleteTarget(session.sessionId)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </motion.article>
            )
          })}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: MOTION.duration.normal }}
          className="mt-8 flex items-center justify-center gap-4"
        >
          <Button
            variant="ghost"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <span className="text-xs tabular-nums text-text-muted">
            {pagination.page} de {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={pagination.page >= totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Proximo
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}

      {/* Delete dialog */}
      <DeleteDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        isDeleting={isDeleting}
      />
    </>
  )
}
