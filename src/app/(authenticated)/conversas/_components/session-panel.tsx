'use client'

import { useState, useTransition, useMemo } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Bot, Clock, Flame, MessageSquare, MessagesSquare, Search, Trash2, UserRound, X, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/format'
import { deleteChatSession } from '../actions'
import { DeleteDialog } from './delete-dialog'
import type { ChatSession, Pagination } from '@/lib/services/interfaces/chat-service'
import Link from 'next/link'

const AGENTS = [
  { value: '', label: 'Todos agentes' },
  { value: 'horos', label: 'Horos' },
  { value: 'kairos', label: 'Kairos' },
  { value: 'human', label: 'Humano' },
]

const CHANNELS = [
  { value: '', label: 'Todos canais' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'sms', label: 'SMS' },
]

const AGENT_CONFIG: Record<string, { color: string; bg: string; label: string; icon: typeof Bot }> = {
  ares:   { color: '#D4820A', bg: 'rgba(212,130,10,0.15)', label: 'Ares',   icon: Flame },
  kairos: { color: '#C8784A', bg: 'rgba(200,120,74,0.15)', label: 'Kairos', icon: Zap },
  horos:  { color: '#4FD1C5', bg: 'rgba(79,209,197,0.15)', label: 'Horos',  icon: Clock },
  human:  { color: '#D4820A', bg: 'rgba(212,130,10,0.15)', label: 'Humano', icon: UserRound },
}

function getAgentConfig(agent: string) {
  return AGENT_CONFIG[agent] ?? { color: '#888', bg: 'rgba(136,136,136,0.15)', label: agent.charAt(0).toUpperCase() + agent.slice(1), icon: Bot }
}

function ChannelIcon({ channel }: { channel: string | null }) {
  switch (channel) {
    case 'whatsapp':
      return (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      )
    case 'telegram':
      return (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      )
    case 'instagram':
      return (
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 1 0 0-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 1 1-2.882 0 1.441 1.441 0 0 1 2.882 0z" />
        </svg>
      )
    case 'sms':
      return <MessageSquare className="h-3.5 w-3.5" />
    default:
      return null
  }
}

function getChannelColor(channel: string | null) {
  switch (channel) {
    case 'whatsapp':
      return 'text-green-500'
    case 'telegram':
      return 'text-blue-400'
    case 'instagram':
      return 'text-pink-500'
    case 'sms':
      return 'text-text-subtle'
    default:
      return 'text-text-subtle'
  }
}

interface SessionPanelProps {
  initialSessions: ChatSession[]
  initialPagination: Pagination
}

export function SessionPanel({ initialSessions }: SessionPanelProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [sessions, setSessions] = useState(initialSessions)
  const [agentFilter, setAgentFilter] = useState('')
  const [channelFilter, setChannelFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [isDeleting, startDelete] = useTransition()

  const filtered = useMemo(() => {
    let result = sessions
    if (agentFilter) result = result.filter((s) => s.agent === agentFilter)
    if (channelFilter) result = result.filter((s) => s.channel === channelFilter)
    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase()
      result = result.filter((s) => s.leadName?.toLowerCase().includes(term))
    }
    return result
  }, [sessions, agentFilter, channelFilter, searchQuery])

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

  const hasFilters = agentFilter || channelFilter || searchQuery

  return (
    <div className="flex h-full flex-col bg-surface-1">
      {/* Header */}
      <div className="shrink-0 px-5 pt-6 pb-3">
        <h2 className="font-title text-lg font-bold text-text-primary">Conversas</h2>

        {/* Search */}
        <div className="mt-3 relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-subtle" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome..."
            className="h-8 w-full rounded-lg border border-border-default bg-surface-2 pl-8 pr-8 text-xs text-text-primary outline-none placeholder:text-text-subtle transition-colors focus:border-accent/40"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-text-subtle hover:text-text-muted"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="mt-2 flex items-center gap-2">
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="h-7 flex-1 rounded-lg border border-border-default bg-surface-2 px-2 text-xs text-text-primary outline-none transition-colors hover:border-border-hover focus:border-accent/40"
          >
            {AGENTS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="h-7 flex-1 rounded-lg border border-border-default bg-surface-2 px-2 text-xs text-text-primary outline-none transition-colors hover:border-border-hover focus:border-accent/40"
          >
            {CHANNELS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {hasFilters && (
          <button
            onClick={() => { setAgentFilter(''); setChannelFilter(''); setSearchQuery('') }}
            className="mt-1.5 text-[10px] text-accent hover:underline"
          >
            Limpar filtros
          </button>
        )}
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
              const activeAgent = session.handoff ? 'human' : session.agent
              const ac = getAgentConfig(activeAgent)
              const AgentIcon = ac.icon
              const roleLabel =
                session.lastRole === 'assistant' ? ac.label : (session.leadName ?? 'Cliente')
              const displayName = session.leadName ?? 'Desconhecido'

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
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors"
                    style={{ backgroundColor: ac.bg, color: ac.color }}
                  >
                    <AgentIcon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className={cn(
                          'text-[13px] font-semibold truncate',
                          isActive ? 'text-accent' : 'text-text-primary',
                        )}
                      >
                        {displayName}
                      </span>
                      <div className="flex shrink-0 items-center gap-1.5">
                        <span className="text-[10px] text-text-subtle">
                          {formatRelativeTime(session.lastMessageAt)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setDeleteTarget(session.sessionId)
                          }}
                          className="flex h-5 w-5 items-center justify-center rounded-md text-text-subtle opacity-0 transition-all group-hover:opacity-100 hover:bg-danger/10 hover:text-danger"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-0.5 truncate text-xs leading-relaxed text-text-muted">
                      {session.lastMessage}
                    </p>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-text-subtle">
                      {session.channel && (
                        <>
                          <span className={getChannelColor(session.channel)}>
                            <ChannelIcon channel={session.channel} />
                          </span>
                          <span>·</span>
                        </>
                      )}
                      <AgentIcon className="h-2.5 w-2.5" style={{ color: ac.color }} />
                      <span>{ac.label}</span>
                      <span>·</span>
                      <MessageSquare className="h-2.5 w-2.5" />
                      <span>{session.messageCount}</span>
                      <span>·</span>
                      <span>{roleLabel}</span>
                    </div>
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
