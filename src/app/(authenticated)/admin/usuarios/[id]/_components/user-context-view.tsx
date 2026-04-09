'use client'

import { useState, useTransition } from 'react'
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
  FileDown,
  Save,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MOTION, fadeInUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/format'
import type { AdminUser } from '@/lib/services/interfaces/admin-user-service'
import type { UserDashboardData } from '@/lib/services/interfaces/admin-user-data-service'
import type { ChatSession } from '@/lib/services/interfaces/chat-service'
import type { Appointment } from '@/lib/services/interfaces/appointment-service'
import type { CalendarConfig, BusinessHour } from '@/lib/services/interfaces/calendar-config-service'
import { updateUserCalendarConfig } from '../actions'
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
          <ConfigTab config={calendarConfig} userId={user.id} />
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

// ── Config tab (editable, same layout as /configuracoes) ──

const CONFIG_DAYS = ['Domingo', 'Segunda', 'Terca', 'Quarta', 'Quinta', 'Sexta', 'Sabado']

const DEFAULT_BH: BusinessHour[] = [
  { dia: 'Domingo', horario: 'Fechado' },
  { dia: 'Segunda', horario: '09:00 as 18:00' },
  { dia: 'Terca', horario: '09:00 as 18:00' },
  { dia: 'Quarta', horario: '09:00 as 18:00' },
  { dia: 'Quinta', horario: '09:00 as 18:00' },
  { dia: 'Sexta', horario: '09:00 as 18:00' },
  { dia: 'Sabado', horario: '09:00 as 12:00' },
]

interface DayState { open: boolean; start: string; end: string }

function parseBH(h: string): DayState {
  if (h === 'Fechado') return { open: false, start: '09:00', end: '18:00' }
  const p = h.split(' as ')
  return { open: true, start: p[0] ?? '09:00', end: p[1] ?? '18:00' }
}

function ConfigTab({ config, userId }: { config: CalendarConfig | null; userId: string }) {
  const hours = config?.business_hours ?? DEFAULT_BH

  const [days, setDays] = useState<DayState[]>(
    CONFIG_DAYS.map((dia) => {
      const f = hours.find((h) => h.dia === dia)
      return parseBH(f?.horario ?? 'Fechado')
    }),
  )
  const [slotDuration, setSlotDuration] = useState(config?.slot_duration_minutes ?? 30)
  const [minAdvance, setMinAdvance] = useState(config?.min_advance_hours ?? 1)
  const [minCancelAdvance, setMinCancelAdvance] = useState(config?.min_cancel_advance_hours ?? 2)
  const [isSaving, startSave] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateDay(i: number, patch: Partial<DayState>) {
    setDays((prev) => prev.map((d, idx) => (idx === i ? { ...d, ...patch } : d)))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)

    const businessHours: BusinessHour[] = CONFIG_DAYS.map((dia, i) => ({
      dia,
      horario: days[i].open ? `${days[i].start} as ${days[i].end}` : 'Fechado',
    }))

    startSave(async () => {
      const result = await updateUserCalendarConfig(userId, {
        business_hours: businessHours,
        slot_duration_minutes: slotDuration,
        min_advance_hours: minAdvance,
        min_cancel_advance_hours: minCancelAdvance,
      })
      if (result.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      } else {
        setError(result.error ?? 'Erro ao salvar')
      }
    })
  }

  const inputClass =
    'h-9 rounded-lg border border-border-default bg-surface-2 px-3 text-sm text-text-primary outline-none transition-colors hover:border-border-hover focus:border-accent/40 focus:ring-1 focus:ring-accent/15'

  return (
    <div>
      <div className="border-b border-border-default">
        <nav className="-mb-px flex gap-1">
          <div className="relative flex items-center gap-2 px-4 py-3 text-sm font-medium text-accent">
            <CalendarDays className="h-4 w-4" />
            Agenda
            <div className="absolute inset-x-0 -bottom-px h-0.5 bg-accent" />
          </div>
        </nav>
      </div>

      <div className="mt-8 max-w-3xl">
        <form onSubmit={handleSubmit}>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
            Horários de funcionamento
          </h3>
          <div className="mt-4 space-y-1.5">
            {CONFIG_DAYS.map((dia, i) => (
              <div key={dia} className="flex items-center gap-4 rounded-xl bg-surface-1 px-4 py-3 ring-1 ring-border-default/50">
                <span className="w-20 shrink-0 text-sm font-medium text-text-primary">{dia}</span>
                <button
                  type="button"
                  onClick={() => updateDay(i, { open: !days[i].open })}
                  className={cn('relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200', days[i].open ? 'bg-accent' : 'bg-surface-2')}
                >
                  <span className={cn('absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200', days[i].open && 'translate-x-4')} />
                </button>
                {days[i].open ? (
                  <div className="flex items-center gap-2">
                    <input type="time" value={days[i].start} onChange={(e) => updateDay(i, { start: e.target.value })} className={`${inputClass} h-8 text-xs`} />
                    <span className="text-[11px] text-text-subtle">às</span>
                    <input type="time" value={days[i].end} onChange={(e) => updateDay(i, { end: e.target.value })} className={`${inputClass} h-8 text-xs`} />
                  </div>
                ) : (
                  <span className="text-xs text-text-subtle">Fechado</span>
                )}
              </div>
            ))}
          </div>

          <h3 className="mt-8 text-xs font-semibold uppercase tracking-wider text-text-subtle">
            Regras de agendamento
          </h3>
          <div className="mt-4 space-y-1.5">
            <SettingRow label="Duração do slot" hint="10 a 120 minutos" value={slotDuration} onChange={setSlotDuration} min={10} max={120} unit="min" inputClass={inputClass} />
            <SettingRow label="Antecedência para agendar" hint="0 a 72 horas" value={minAdvance} onChange={setMinAdvance} min={0} max={72} unit="h" inputClass={inputClass} />
            <SettingRow label="Antecedência para cancelar" hint="0 a 72 horas" value={minCancelAdvance} onChange={setMinCancelAdvance} min={0} max={72} unit="h" inputClass={inputClass} />
          </div>

          {error && (
            <div className="mt-4 rounded-lg bg-danger/8 px-3 py-2.5">
              <p className="text-sm text-danger">{error}</p>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="h-9 gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-primary-foreground shadow-[0_0_16px_rgba(212,130,10,0.12)] transition-all hover:brightness-110 disabled:opacity-50"
            >
              {isSaving ? (
                <><span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />Salvando...</>
              ) : saved ? (
                <><Check className="h-3.5 w-3.5" />Salvo</>
              ) : (
                <><Save className="h-3.5 w-3.5" />Salvar configuração</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function SettingRow({ label, hint, value, onChange, min, max, unit, inputClass }: {
  label: string; hint: string; value: number; onChange: (v: number) => void; min: number; max: number; unit: string; inputClass: string
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-surface-1 px-4 py-3 ring-1 ring-border-default/50">
      <div>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-[11px] text-text-subtle">{hint}</p>
      </div>
      <div className="flex items-center gap-2">
        <input type="number" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} className={`${inputClass} h-8 w-16 text-center text-xs`} />
        <span className="text-xs text-text-subtle">{unit}</span>
      </div>
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
