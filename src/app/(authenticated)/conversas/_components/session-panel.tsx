'use client'

import { useState, useTransition } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Bot, Trash2, MessagesSquare, SlidersHorizontal, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/format'
import { deleteChatSession } from '../actions'
import { DeleteDialog } from './delete-dialog'
import type { ChatSession, Pagination } from '@/lib/services/interfaces/chat-service'
import Link from 'next/link'

const AGENTS = [
  { value: '', label: 'Todos' },
  { value: 'horos', label: 'Horos' },
]

interface SessionPanelProps {
  initialSessions: ChatSession[]
  initialPagination: Pagination
}

export function SessionPanel({ initialSessions }: SessionPanelProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sessions, setSessions] = useState(initialSessions)
  const [filter, setFilter] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isDeleting, startDelete] = useTransition()

  const filtered = filter ? sessions.filter((s) => s.agent === filter) : sessions

  const activeSessionId = pathname.startsWith('/conversas/')
    ? pathname.split('/conversas/')[1]?.split('/')[0]
    : null

  function handleDelete(sessionId: string) {
    startDelete(async () => {
      const result = await deleteChatSession(sessionId)
      if (result.success) {
        setSessions((prev) => prev.filter((s) => s.sessionId !== sessionId))
        setDeleteTarget(null)
        if (activeSessionId === sessionId) {
          router.push('/conversas')
        }
      }
    })
  }

  return (
    <div className="flex h-full flex-col bg-surface-1">
      {/* Header */}
      <div className="shrink-0 px-5 pt-6 pb-3">
        <h2 className="font-title text-lg font-bold text-text-primary">Conversas</h2>
        <div className="mt-3 flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-text-subtle" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="h-7 rounded-lg border border-border-default bg-surface-2 px-2.5 text-xs text-text-primary outline-none transition-colors hover:border-border-hover focus:border-accent/40"
          >
            {AGENTS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-gradient-to-r from-accent/10 via-[rgba(28,27,24,0.06)] to-transparent" />

      {/* Session list */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-2">
              <MessagesSquare className="h-6 w-6 text-text-subtle/50" />
            </div>
            <p className="mt-3 text-sm text-text-muted">Nenhuma conversa</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {filtered.map((session) => {
              const isActive = session.sessionId === activeSessionId
              const agentLabel =
                session.agent.charAt(0).toUpperCase() + session.agent.slice(1)
              const roleLabel =
                session.lastRole === 'assistant' ? agentLabel : 'Cliente'

              return (
                <Link
                  key={session.sessionId}
                  href={`/conversas/${session.sessionId}`}
                  className={cn(
                    'group relative flex items-start gap-3 rounded-xl px-3 py-3 transition-all duration-150',
                    isActive
                      ? 'bg-accent/[0.08]'
                      : 'hover:bg-[rgba(255,255,255,0.03)]',
                  )}
                >
                  {/* Agent avatar */}
                  <div
                    className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors',
                      isActive
                        ? 'bg-accent/15 text-accent'
                        : 'bg-surface-2 text-text-subtle',
                    )}
                  >
                    <Bot className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className={cn(
                          'text-[13px] font-semibold',
                          isActive ? 'text-accent' : 'text-text-primary',
                        )}
                      >
                        {agentLabel}
                      </span>
                      <span className="shrink-0 text-[10px] text-text-subtle">
                        {formatRelativeTime(session.lastMessageAt)}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-xs leading-relaxed text-text-muted">
                      {session.lastMessage}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-text-subtle">
                      <MessageSquare className="h-2.5 w-2.5" />
                      <span>{session.messageCount}</span>
                      <span>·</span>
                      <span>{roleLabel}</span>
                    </div>
                  </div>

                  {/* Delete */}
                  <div className="absolute right-2 top-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setDeleteTarget(session.sessionId)
                      }}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-text-subtle transition-colors hover:bg-danger/10 hover:text-danger"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      <DeleteDialog
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
        isDeleting={isDeleting}
      />
    </div>
  )
}
