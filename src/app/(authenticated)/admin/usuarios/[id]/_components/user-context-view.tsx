'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { UserConversasPanel } from './user-conversas-panel'
import { UserAgendaCalendar } from './user-agenda-calendar'
import {
  ArrowLeft,
  BarChart3,
  MessagesSquare,
  CalendarDays,
  Settings,
  MessageSquare,
  CalendarCheck,
  Target,
  Clock,
  FileDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MOTION, fadeInUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/format'
import type { AdminUser } from '@/lib/services/interfaces/admin-user-service'
import type { UserDashboardData } from '@/lib/services/interfaces/admin-user-data-service'
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
  dashboard: UserDashboardData | null
  sessions: ChatSession[]
  appointments: Appointment[]
  calendarConfig: CalendarConfig | null
  activeTab: string
}

export function UserContextView({
  user,
  dashboard,
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

            {/* Contract download */}
            {user.contractUrl && (
              <a
                href={user.contractUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-medium text-accent ring-1 ring-accent/25 transition-all hover:bg-accent/[0.08] hover:ring-accent/40"
              >
                <FileDown className="h-4 w-4" />
                Contrato
              </a>
            )}
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
          <DashboardTab dashboard={dashboard} />
        )}
        {activeTab === 'conversas' && (
          <UserConversasPanel sessions={sessions} userId={user.id} />
        )}
        {activeTab === 'agenda' && <UserAgendaCalendar appointments={appointments} />}
        {activeTab === 'configuracoes' && (
          <ConfigTab config={calendarConfig} />
        )}
      </motion.div>
    </motion.div>
  )
}

// ── Dashboard tab (uses real API metrics) ──

function DashboardTab({ dashboard }: { dashboard: UserDashboardData | null }) {
  if (!dashboard) {
    return (
      <EmptyState
        icon={BarChart3}
        title="Sem dados"
        sub="Não foi possível carregar as métricas deste usuário"
      />
    )
  }

  const appointmentSuccessRate =
    dashboard.appointments.thisMonth > 0
      ? Math.round(
          ((dashboard.appointments.thisMonth - dashboard.appointments.cancelledThisMonth) /
            dashboard.appointments.thisMonth) *
            100,
        )
      : 100

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-surface p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
            Conversas este mês
          </p>
          <p className="mt-2 font-title text-2xl font-bold text-accent">
            {dashboard.chats.activeSessionsThisMonth}
          </p>
          <p className="mt-1 text-xs text-text-subtle">
            {dashboard.chats.messagesThisMonth} mensagens
          </p>
        </div>
        <div className="card-surface p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
            Agendamentos este mês
          </p>
          <p className="mt-2 font-title text-2xl font-bold text-emerald">
            {dashboard.appointments.thisMonth}
          </p>
          <div className="mt-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-text-subtle">{appointmentSuccessRate}% confirmados</span>
              <span className="text-danger">{dashboard.appointments.cancelledThisMonth} cancelados</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-emerald" style={{ width: `${appointmentSuccessRate}%` }} />
            </div>
          </div>
        </div>
        <div className="card-surface p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
            Taxa de conversão
          </p>
          <p className="mt-2 font-title text-2xl font-bold text-gold">
            {Math.round(dashboard.leads.conversionRate * 100)}%
          </p>
          <div className="mt-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-text-subtle">{dashboard.leads.thisMonth} leads este mês</span>
              <span className="text-text-subtle">{dashboard.leads.total} total</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-gold" style={{ width: `${Math.round(dashboard.leads.conversionRate * 100)}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Totals */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-subtle">Total agendamentos</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet/20 to-violet/5">
              <CalendarCheck className="h-4 w-4 text-violet" />
            </div>
          </div>
          <p className="mt-3 font-title text-3xl font-bold text-text-primary">{dashboard.appointments.total}</p>
        </div>
        <div className="card-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-subtle">Total leads</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald/20 to-emerald/5">
              <Target className="h-4 w-4 text-emerald" />
            </div>
          </div>
          <p className="mt-3 font-title text-3xl font-bold text-text-primary">{dashboard.leads.total}</p>
        </div>
        <div className="card-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-subtle">Total mensagens</p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold/20 to-gold/5">
              <MessageSquare className="h-4 w-4 text-gold" />
            </div>
          </div>
          <p className="mt-3 font-title text-3xl font-bold text-text-primary">{dashboard.chats.totalMessages.toLocaleString('pt-BR')}</p>
          <p className="mt-1 text-xs text-text-subtle">{dashboard.chats.activeSessionsThisMonth} sessões ativas</p>
        </div>
      </div>
    </div>
  )
}

// ── Config tab (matches /configuracoes layout with tabs) ──

function ConfigTab({ config }: { config: CalendarConfig | null }) {
  return (
    <div>
      {/* Tabs (same as /configuracoes) */}
      <div className="border-b border-border-default">
        <nav className="-mb-px flex gap-1">
          <div className="relative flex items-center gap-2 px-4 py-3 text-sm font-medium text-accent">
            <CalendarDays className="h-4 w-4" />
            Agenda
            <div className="absolute inset-x-0 -bottom-px h-0.5 bg-accent" />
          </div>
        </nav>
      </div>

      {/* Content */}
      <div className="mt-8 max-w-3xl">
        {!config ? (
          <EmptyState
            icon={Settings}
            title="Sem configuração"
            sub="Este usuário ainda não configurou a agenda"
          />
        ) : (
          <form>
            {/* Business hours */}
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
              Horários de funcionamento
            </h3>
            <div className="mt-4 space-y-1.5">
              {config.business_hours.map((bh) => {
                const isOpen = bh.horario !== 'Fechado'
                return (
                  <div
                    key={bh.dia}
                    className="flex items-center gap-4 rounded-xl bg-surface-1 px-4 py-3 ring-1 ring-border-default/50"
                  >
                    <span className="w-20 shrink-0 text-sm font-medium text-text-primary">
                      {bh.dia}
                    </span>
                    <div
                      className={cn(
                        'relative h-5 w-9 shrink-0 rounded-full',
                        isOpen ? 'bg-accent' : 'bg-surface-2',
                      )}
                    >
                      <span
                        className={cn(
                          'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm',
                          isOpen && 'translate-x-4',
                        )}
                      />
                    </div>
                    {isOpen ? (
                      <div className="flex items-center gap-1.5 text-sm text-text-muted">
                        <Clock className="h-3.5 w-3.5 text-text-subtle" />
                        {bh.horario.replace(' as ', ' às ')}
                      </div>
                    ) : (
                      <span className="text-xs text-text-subtle">Fechado</span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Rules */}
            <h3 className="mt-8 text-xs font-semibold uppercase tracking-wider text-text-subtle">
              Regras de agendamento
            </h3>
            <div className="mt-4 space-y-1.5">
              <ConfigRow label="Duração do slot" hint={`${config.slot_duration_minutes} min`} />
              <ConfigRow label="Antecedência para agendar" hint={`${config.min_advance_hours}h`} />
              <ConfigRow label="Antecedência para cancelar" hint={`${config.min_cancel_advance_hours}h`} />
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function ConfigRow({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-surface-1 px-4 py-3 ring-1 ring-border-default/50">
      <p className="text-sm font-medium text-text-primary">{label}</p>
      <span className="text-sm font-semibold text-text-primary">{hint}</span>
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
