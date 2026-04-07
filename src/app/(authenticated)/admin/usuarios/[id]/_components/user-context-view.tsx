'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import {
  ArrowLeft,
  BarChart3,
  MessagesSquare,
  CalendarDays,
  Settings,
  Bot,
  MessageSquare,
  CalendarCheck,
  CalendarX2,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MOTION, fadeInUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { formatDate, formatRelativeTime } from '@/lib/format'
import type { AdminUser } from '@/lib/services/interfaces/admin-user-service'
import type { ChatSession } from '@/lib/services/interfaces/chat-service'
import type { Appointment } from '@/lib/services/interfaces/appointment-service'
import type { CalendarConfig } from '@/lib/services/interfaces/calendar-config-service'
import Link from 'next/link'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'conversas', label: 'Conversas', icon: MessagesSquare },
  { id: 'agenda', label: 'Agenda', icon: CalendarDays },
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
]

interface UserContextViewProps {
  user: AdminUser
  sessions: ChatSession[]
  appointments: Appointment[]
  calendarConfig: CalendarConfig | null
  activeTab: string
}

export function UserContextView({
  user,
  sessions,
  appointments,
  calendarConfig,
  activeTab,
}: UserContextViewProps) {
  const router = useRouter()

  const initials = (user.name ?? user.email.split('@')[0])
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const isActive = user.name !== null

  function changeTab(id: string) {
    const params = new URLSearchParams()
    if (id !== 'dashboard') params.set('tab', id)
    const qs = params.toString()
    router.push(`/admin/usuarios/${user.id}${qs ? `?${qs}` : ''}`)
  }

  const confirmedAppointments = appointments.filter(
    (a) => a.status === 'confirmed',
  ).length
  const cancelledAppointments = appointments.filter(
    (a) => a.status === 'cancelled',
  ).length

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      {/* Back + Hero header */}
      <motion.div
        variants={fadeInUp}
        transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
      >
        <Link href="/admin/usuarios">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>

        <div className="card-hero relative overflow-hidden p-6">
          <div className="relative z-10 flex items-center gap-5">
            {/* Avatar */}
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/25 to-accent/5 text-xl font-bold text-accent ring-1 ring-accent/20">
              {initials}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3">
                <h1 className="truncate font-title text-xl font-bold text-text-primary">
                  {user.name ?? user.email.split('@')[0]}
                </h1>
                <span
                  className={cn(
                    'shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                    isActive
                      ? 'bg-success/10 text-success'
                      : 'bg-gold/10 text-gold',
                  )}
                >
                  {isActive ? 'Ativo' : 'Pendente'}
                </span>
              </div>
              <p className="mt-0.5 truncate text-sm text-text-muted">
                {user.email}
              </p>
              <div className="mt-2 flex items-center gap-4 text-xs text-text-subtle">
                <span>Membro desde {formatDate(user.createdAt)}</span>
                <span className="text-text-subtle/30">·</span>
                <span className="capitalize">{user.role}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <motion.div
        variants={fadeInUp}
        transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
        className="mt-6 border-b border-border-default"
      >
        <nav className="-mb-px flex gap-1">
          {TABS.map((tab) => {
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => changeTab(tab.id)}
                className={cn(
                  'relative flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors duration-150',
                  active
                    ? 'text-accent'
                    : 'text-text-muted hover:text-text-primary',
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
                {active && (
                  <motion.div
                    layoutId="user-tab-indicator"
                    className="absolute inset-x-0 -bottom-px h-0.5 bg-accent"
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  />
                )}
              </button>
            )
          })}
        </nav>
      </motion.div>

      {/* Tab content */}
      <motion.div
        variants={fadeInUp}
        transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
        className="mt-8"
      >
        {activeTab === 'dashboard' && (
          <DashboardTab
            sessions={sessions}
            appointments={appointments}
            confirmedAppointments={confirmedAppointments}
            cancelledAppointments={cancelledAppointments}
          />
        )}
        {activeTab === 'conversas' && <ConversasTab sessions={sessions} />}
        {activeTab === 'agenda' && <AgendaTab appointments={appointments} />}
        {activeTab === 'configuracoes' && (
          <ConfigTab config={calendarConfig} />
        )}
      </motion.div>
    </motion.div>
  )
}

// ── Dashboard tab ──

function DashboardTab({
  sessions,
  appointments,
  confirmedAppointments,
  cancelledAppointments,
}: {
  sessions: ChatSession[]
  appointments: Appointment[]
  confirmedAppointments: number
  cancelledAppointments: number
}) {
  const totalMessages = sessions.reduce((s, c) => s + c.messageCount, 0)

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Conversas"
        value={String(sessions.length)}
        sub={`${totalMessages} mensagens`}
        icon={MessagesSquare}
        color="accent"
      />
      <StatCard
        label="Agendamentos"
        value={String(appointments.length)}
        sub={`${confirmedAppointments} confirmados`}
        icon={CalendarCheck}
        color="violet"
      />
      <StatCard
        label="Cancelamentos"
        value={String(cancelledAppointments)}
        sub={
          appointments.length > 0
            ? `${Math.round((cancelledAppointments / appointments.length) * 100)}% do total`
            : 'Nenhum agendamento'
        }
        icon={CalendarX2}
        color="danger"
      />
      <StatCard
        label="Mensagens"
        value={totalMessages.toLocaleString('pt-BR')}
        sub={`${sessions.length} sessões`}
        icon={MessageSquare}
        color="gold"
      />
    </div>
  )
}

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
}: {
  label: string
  value: string
  sub: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}) {
  const colorMap: Record<string, { bg: string; text: string }> = {
    accent: { bg: 'from-accent/20 to-accent/5', text: 'text-accent' },
    violet: { bg: 'from-violet/20 to-violet/5', text: 'text-violet' },
    danger: { bg: 'from-danger/20 to-danger/5', text: 'text-danger' },
    gold: { bg: 'from-gold/20 to-gold/5', text: 'text-gold' },
    emerald: { bg: 'from-emerald/20 to-emerald/5', text: 'text-emerald' },
  }
  const c = colorMap[color] ?? colorMap.accent

  return (
    <div className="card-surface p-5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
          {label}
        </p>
        <div
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br',
            c.bg,
          )}
        >
          <Icon className={cn('h-4 w-4', c.text)} />
        </div>
      </div>
      <p className="mt-3 font-title text-3xl font-bold text-text-primary">
        {value}
      </p>
      <p className="mt-1 text-xs text-text-subtle">{sub}</p>
    </div>
  )
}

// ── Conversas tab ──

function ConversasTab({ sessions }: { sessions: ChatSession[] }) {
  if (sessions.length === 0) {
    return (
      <EmptyState
        icon={MessagesSquare}
        title="Nenhuma conversa"
        sub="Este usuário ainda não tem conversas registradas"
      />
    )
  }

  return (
    <div className="space-y-2">
      {sessions.map((session) => {
        const agentLabel =
          session.agent.charAt(0).toUpperCase() + session.agent.slice(1)
        return (
          <Link
            key={session.sessionId}
            href={`/conversas/${session.sessionId}`}
            className="card-surface card-surface-interactive group relative flex items-start gap-4 overflow-hidden p-4 pl-5"
          >
            <div className="absolute inset-y-0 left-0 w-0.5 bg-accent" />
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Bot className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-text-primary">
                  {agentLabel}
                </span>
                <span className="shrink-0 text-[11px] text-text-subtle">
                  {formatRelativeTime(session.lastMessageAt)}
                </span>
              </div>
              <p className="mt-0.5 truncate text-xs text-text-muted">
                {session.lastMessage}
              </p>
              <div className="mt-1 flex items-center gap-1.5 text-[10px] text-text-subtle">
                <MessageSquare className="h-2.5 w-2.5" />
                <span>{session.messageCount} mensagens</span>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

// ── Agenda tab ──

function AgendaTab({ appointments }: { appointments: Appointment[] }) {
  if (appointments.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Nenhum agendamento"
        sub="Este usuário ainda não tem agendamentos registrados"
      />
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {appointments.map((apt) => {
        const confirmed = apt.status === 'confirmed'
        return (
          <div
            key={apt.id}
            className="card-surface relative overflow-hidden p-4 pl-5"
          >
            <div
              className={cn(
                'absolute inset-y-0 left-0 w-0.5',
                confirmed ? 'bg-success' : 'bg-danger',
              )}
            />
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold',
                  confirmed
                    ? 'bg-success/10 text-success'
                    : 'bg-danger/10 text-danger',
                )}
              >
                {confirmed ? (
                  <CalendarCheck className="h-3 w-3" />
                ) : (
                  <CalendarX2 className="h-3 w-3" />
                )}
                {confirmed ? 'Confirmado' : 'Cancelado'}
              </span>
              <span className="text-[11px] text-text-subtle">
                {formatDate(apt.date)}
              </span>
            </div>
            <p className="mt-2 text-sm font-semibold text-text-primary">
              {apt.leadName}
            </p>
            <p className="mt-0.5 text-xs text-text-muted">{apt.serviceType}</p>
            <p className="mt-1.5 text-xs tabular-nums text-text-subtle">
              {apt.startTime.slice(0, 5)} – {apt.endTime.slice(0, 5)}
            </p>
          </div>
        )
      })}
    </div>
  )
}

// ── Config tab ──

function ConfigTab({ config }: { config: CalendarConfig | null }) {
  if (!config) {
    return (
      <EmptyState
        icon={Settings}
        title="Sem configuração"
        sub="Este usuário ainda não configurou a agenda"
      />
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Business hours */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
          Horários de funcionamento
        </h3>
        <div className="mt-3 space-y-1.5">
          {config.business_hours.map((bh) => (
            <div
              key={bh.dia}
              className="flex items-center gap-4 rounded-xl bg-surface-1 px-4 py-3 ring-1 ring-border-default/50"
            >
              <span className="w-20 shrink-0 text-sm font-medium text-text-primary">
                {bh.dia}
              </span>
              {bh.horario === 'Fechado' ? (
                <span className="text-xs text-text-subtle">Fechado</span>
              ) : (
                <div className="flex items-center gap-1.5 text-sm text-text-muted">
                  <Clock className="h-3.5 w-3.5 text-text-subtle" />
                  {bh.horario.replace(' as ', ' às ')}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
          Regras de agendamento
        </h3>
        <div className="mt-3 space-y-1.5">
          <ConfigRow
            label="Duração do slot"
            value={`${config.slot_duration_minutes} min`}
          />
          <ConfigRow
            label="Antecedência para agendar"
            value={`${config.min_advance_hours}h`}
          />
          <ConfigRow
            label="Antecedência para cancelar"
            value={`${config.min_cancel_advance_hours}h`}
          />
        </div>
      </div>
    </div>
  )
}

function ConfigRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-surface-1 px-4 py-3 ring-1 ring-border-default/50">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-sm font-semibold text-text-primary">{value}</span>
    </div>
  )
}

// ── Empty state ──

function EmptyState({
  icon: Icon,
  title,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  sub: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-2">
        <Icon className="h-7 w-7 text-text-subtle/50" />
      </div>
      <p className="mt-4 font-title text-base font-semibold text-text-muted">
        {title}
      </p>
      <p className="mt-1 text-sm text-text-subtle">{sub}</p>
    </div>
  )
}
