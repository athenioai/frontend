'use client'

import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import {
  MessageSquare,
  Calendar,
  ArrowRight,
  Bot,
  UserRound,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOTION } from '@/lib/motion'
import { formatDate, formatTime } from '@/lib/format'
import type {
  TimelineEntry,
  TimelineEntryType,
  TimelineMessage,
  TimelineAppointment,
  TimelineStatusChange,
} from '@/lib/services/interfaces/lead-service'

const FILTERS: { value: TimelineEntryType | 'all'; label: string }[] = [
  { value: 'all', label: 'Tudo' },
  { value: 'message', label: 'Mensagens' },
  { value: 'appointment', label: 'Agendamentos' },
  { value: 'status_change', label: 'Status' },
]

const STATUS_LABELS: Record<string, string> = {
  new: 'Novo',
  contacted: 'Contactado',
  qualified: 'Qualificado',
  converted: 'Convertido',
  lost: 'Perdido',
}

interface TimelineProps {
  entries: TimelineEntry[]
}

export function Timeline({ entries }: TimelineProps) {
  const [filter, setFilter] = useState<TimelineEntryType | 'all'>('all')

  const filtered = useMemo(
    () => (filter === 'all' ? entries : entries.filter((e) => e.type === filter)),
    [entries, filter],
  )

  return (
    <div>
      {/* Filter tabs */}
      <div className="mb-5 flex gap-1 rounded-xl bg-surface-2 p-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'relative rounded-lg px-3 py-1.5 text-[12px] font-medium transition-colors',
              filter === f.value
                ? 'text-text-primary'
                : 'text-text-muted hover:text-text-primary',
            )}
          >
            {filter === f.value && (
              <motion.div
                layoutId="timeline-tab"
                className="absolute inset-0 rounded-lg bg-surface-1 shadow-sm"
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative">{f.label}</span>
          </button>
        ))}
      </div>

      {/* Timeline entries */}
      {filtered.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-xl border border-dashed border-border-default/60">
          <p className="text-[13px] text-text-subtle">Nenhum evento encontrado</p>
        </div>
      ) : (
        <div className="relative space-y-0">
          {/* Vertical line */}
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-border-default" />

          {filtered.map((entry, idx) => (
            <motion.div
              key={`${entry.type}-${entry.timestamp}-${idx}`}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: MOTION.duration.fast,
                delay: Math.min(idx * 0.03, 0.3),
                ease: MOTION.ease.out,
              }}
              className="relative flex gap-3 py-2"
            >
              <TimelineIcon type={entry.type} />
              <div className="min-w-0 flex-1 pt-0.5">
                <TimelineContent entry={entry} />
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

function TimelineIcon({ type }: { type: TimelineEntryType }) {
  const config = {
    message: { icon: MessageSquare, bg: 'bg-teal/10', color: 'text-teal' },
    appointment: { icon: Calendar, bg: 'bg-violet/10', color: 'text-violet' },
    status_change: { icon: ArrowRight, bg: 'bg-amber/10', color: 'text-amber' },
  }[type]

  const Icon = config.icon

  return (
    <div
      className={cn(
        'relative z-10 flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full',
        config.bg,
      )}
    >
      <Icon className={cn('h-3.5 w-3.5', config.color)} />
    </div>
  )
}

function TimelineContent({ entry }: { entry: TimelineEntry }) {
  switch (entry.type) {
    case 'message':
      return <MessageEntry data={entry.data as TimelineMessage} />
    case 'appointment':
      return <AppointmentEntry data={entry.data as TimelineAppointment} />
    case 'status_change':
      return <StatusChangeEntry data={entry.data as TimelineStatusChange} />
  }
}

function MessageEntry({ data }: { data: TimelineMessage }) {
  const isLead = data.role === 'lead'
  const agentLabel = data.agent === 'human' ? 'Humano' : data.agent.charAt(0).toUpperCase() + data.agent.slice(1)

  return (
    <div className="rounded-xl border border-border-default bg-surface-1 p-3">
      <div className="flex items-center gap-2">
        {isLead ? (
          <UserRound className="h-3 w-3 text-text-subtle" />
        ) : (
          <Bot className="h-3 w-3 text-teal" />
        )}
        <span className="text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
          {isLead ? 'Lead' : agentLabel}
        </span>
        <span className="text-[11px] text-text-subtle">
          {formatTime(data.created_at)}
        </span>
      </div>
      <p className="mt-1.5 text-[13px] leading-relaxed text-text-muted">
        {data.content}
      </p>
    </div>
  )
}

function AppointmentEntry({ data }: { data: TimelineAppointment }) {
  const isCancelled = data.status === 'cancelled'

  return (
    <div className={cn(
      'rounded-xl border p-3',
      isCancelled
        ? 'border-danger/20 bg-danger/[0.03]'
        : 'border-violet/20 bg-violet/[0.03]',
    )}>
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-text-primary">
          {data.service_type}
        </span>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[11px] font-medium',
            isCancelled
              ? 'bg-danger/10 text-danger'
              : 'bg-emerald/10 text-emerald',
          )}
        >
          {isCancelled ? 'Cancelado' : 'Confirmado'}
        </span>
      </div>
      <p className="mt-1 text-[12px] text-text-muted">
        {formatDate(data.date)} &middot; {data.start_time} - {data.end_time}
      </p>
    </div>
  )
}

function StatusChangeEntry({ data }: { data: TimelineStatusChange }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[12px] font-medium text-text-muted">
        {STATUS_LABELS[data.old_status] ?? data.old_status}
      </span>
      <ArrowRight className="h-3 w-3 text-text-subtle" />
      <span className="rounded-full bg-accent/10 px-2.5 py-1 text-[12px] font-medium text-accent">
        {STATUS_LABELS[data.new_status] ?? data.new_status}
      </span>
      <span className="ml-auto text-[11px] text-text-subtle">
        {formatTime(data.changed_at)}
      </span>
    </div>
  )
}
