'use client'

import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import { Input } from '@/components/ui/input'
import { StatusBadge } from '@/components/common/status-badge'
import { EmptyState } from '@/components/common/empty-state'
import { formatRelativeTime } from '@/lib/utils/format'
import { MessageSquare, Search } from 'lucide-react'
import { fadeInUp, staggerContainer, MOTION } from '@/lib/motion'
import type { ConversationSummary } from '@/lib/types'

const INPUT_CLASS = 'h-11 rounded-xl border-border-default bg-[rgba(240,237,232,0.04)] text-text-primary placeholder:text-text-subtle transition-all duration-200 focus:border-accent/30 focus:ring-2 focus:ring-accent/10'

const CONVERSATION_STATUS_COLORS: Record<string, 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'orange' | 'purple'> = {
  Ativo: 'green',
  Bot: 'blue',
  Humano: 'purple',
  Whale: 'yellow',
}

type FilterType = 'all' | 'bot' | 'human' | 'whale'

interface ConversationListProps {
  conversations: ConversationSummary[]
  selectedLeadId: string | null
  onSelect: (leadId: string) => void
}

function getConversationStatus(c: ConversationSummary): string {
  if (c.is_whale) return 'Whale'
  if (c.is_human_takeover) return 'Humano'
  return 'Bot'
}

export function ConversationList({ conversations, selectedLeadId, onSelect }: ConversationListProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')

  const filtered = useMemo(() => {
    let result = conversations

    // Apply filter
    if (filter === 'bot') result = result.filter((c) => !c.is_human_takeover && !c.is_whale)
    else if (filter === 'human') result = result.filter((c) => c.is_human_takeover)
    else if (filter === 'whale') result = result.filter((c) => c.is_whale)

    // Apply search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (c) =>
          c.lead_name.toLowerCase().includes(q) ||
          c.lead_phone.includes(q)
      )
    }

    return result
  }, [conversations, search, filter])

  return (
    <div className="flex h-full flex-col">
      {/* Search + Filter */}
      <div className="space-y-3 border-b border-border-default p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome ou telefone..."
            className={`${INPUT_CLASS} pl-10`}
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as FilterType)}
          className="h-9 w-full rounded-lg border border-border-default bg-[rgba(240,237,232,0.04)] px-3 text-[13px] text-text-muted transition-all duration-200 focus:border-accent/30 focus:outline-none focus:ring-2 focus:ring-accent/10"
        >
          <option value="all">Todos</option>
          <option value="bot">Bot</option>
          <option value="human">Humano</option>
          <option value="whale">Whale</option>
        </select>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-4">
            <EmptyState
              icon={MessageSquare}
              title="Nenhuma conversa"
              description="As conversas aparecerao quando leads entrarem em contato."
            />
          </div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-0.5 p-2"
          >
            {filtered.map((conversation) => {
              const isSelected = conversation.lead_id === selectedLeadId
              const status = getConversationStatus(conversation)
              return (
                <motion.button
                  key={conversation.id}
                  variants={fadeInUp}
                  transition={{ duration: MOTION.duration.normal, ease: MOTION.ease.out }}
                  onClick={() => onSelect(conversation.lead_id)}
                  className={`group relative w-full rounded-xl p-3 text-left transition-all duration-200 ${
                    isSelected
                      ? 'bg-accent/5 ring-1 ring-accent/20'
                      : 'hover:bg-[rgba(255,255,255,0.03)]'
                  }`}
                >
                  {/* Active indicator */}
                  {isSelected && (
                    <motion.span
                      layoutId="conversation-active"
                      className="absolute left-0 top-1/2 h-6 w-[2px] -translate-y-1/2 rounded-r-full bg-accent shadow-[0_0_8px_rgba(79,209,197,0.5)]"
                      transition={{ duration: 0.2, ease: MOTION.ease.out }}
                    />
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[14px] font-medium text-text-primary">
                          {conversation.lead_name}
                        </p>
                        <StatusBadge
                          status={status}
                          colorMap={CONVERSATION_STATUS_COLORS}
                          className="shrink-0 text-[10px]"
                        />
                      </div>
                      <p className="mt-0.5 truncate text-[12px] text-text-subtle">
                        {conversation.last_message_preview
                          ? conversation.last_message_preview.length > 60
                            ? conversation.last_message_preview.slice(0, 60) + '...'
                            : conversation.last_message_preview
                          : 'Sem mensagens'}
                      </p>
                    </div>
                    <span className="shrink-0 text-[11px] text-text-subtle">
                      {conversation.last_message_at
                        ? formatRelativeTime(conversation.last_message_at)
                        : ''}
                    </span>
                  </div>
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </div>
    </div>
  )
}
