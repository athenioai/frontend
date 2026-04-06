'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Dialog } from '@base-ui/react/dialog'
import {
  CalendarCheck,
  CalendarX2,
  ChevronLeft,
  ChevronRight,
  Settings,
  X,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MOTION } from '@/lib/motion'
import { formatDate, formatISODate, addDays } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Appointment } from '@/lib/services/interfaces/appointment-service'
import Link from 'next/link'

const HOUR_HEIGHT = 72
const START_HOUR = 7
const END_HOUR = 20
const TOTAL_HOURS = END_HOUR - START_HOUR

const DAY_NAMES = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

const STATUS_TABS = [
  { value: '', label: 'Todos' },
  { value: 'confirmed', label: 'Confirmados' },
  { value: 'cancelled', label: 'Cancelados' },
] as const

interface CalendarViewProps {
  appointments: Appointment[]
  weekStart: string
  currentStatus?: 'confirmed' | 'cancelled'
}

export function CalendarView({
  appointments,
  weekStart,
  currentStatus,
}: CalendarViewProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<Appointment | null>(null)

  const monday = new Date(weekStart + 'T00:00:00')
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i))

  const todayStr = formatISODate(new Date())

  // Group appointments by date
  const byDate = new Map<string, Appointment[]>()
  for (const apt of appointments) {
    const list = byDate.get(apt.date) ?? []
    list.push(apt)
    byDate.set(apt.date, list)
  }

  // Month label from the week
  const monthLabel = monday.toLocaleDateString('pt-BR', {
    month: 'long',
    year: 'numeric',
  })

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams()
    const merged: Record<string, string | undefined> = {
      week: weekStart,
      status: currentStatus,
      ...overrides,
    }
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })

    // Remove week param if it's current week
    const currentMonday = formatISODate(
      (() => {
        const d = new Date()
        const day = d.getDay()
        d.setDate(d.getDate() - day + (day === 0 ? -6 : 1))
        return d
      })(),
    )
    if (params.get('week') === currentMonday) params.delete('week')

    const qs = params.toString()
    return `/agenda${qs ? `?${qs}` : ''}`
  }

  function navigateWeek(offset: number) {
    const newStart = addDays(monday, offset * 7)
    router.push(buildUrl({ week: formatISODate(newStart) }))
  }

  function goToToday() {
    router.push(buildUrl({ week: undefined }))
  }

  function handleStatusChange(status: string) {
    router.push(buildUrl({ status: status || undefined }))
  }

  // Current time position
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const currentTop =
    ((currentMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT
  const showTimeLine =
    currentTop >= 0 &&
    currentTop <= TOTAL_HOURS * HOUR_HEIGHT &&
    days.some((d) => formatISODate(d) === todayStr)

  return (
    <>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
        className="shrink-0"
      >
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <h1 className="font-title text-2xl font-bold text-text-primary">
            Agenda
          </h1>

          {/* Week navigation */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => navigateWeek(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[140px] text-center text-sm font-medium capitalize text-text-primary">
              {monthLabel}
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => navigateWeek(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Button variant="outline" size="xs" onClick={goToToday}>
            Hoje
          </Button>

          {/* Status filter */}
          <div className="flex gap-0.5 rounded-lg bg-surface-2 p-0.5">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleStatusChange(tab.value)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150',
                  (currentStatus ?? '') === tab.value
                    ? 'bg-accent text-primary-foreground shadow-sm'
                    : 'text-text-muted hover:text-text-primary',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Link href="/agenda/configuracao" className="ml-auto">
            <Button variant="outline" size="xs">
              <Settings className="h-3.5 w-3.5" />
              Configuração
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Calendar grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: MOTION.duration.normal, delay: 0.1 }}
        className="mt-5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border-default"
      >
        {/* Day headers */}
        <div className="grid shrink-0 grid-cols-[52px_repeat(7,1fr)] border-b border-border-default bg-surface-1">
          <div />
          {days.map((day, i) => {
            const isToday = formatISODate(day) === todayStr
            return (
              <div
                key={i}
                className={cn(
                  'border-l border-border-default/50 py-2.5 text-center',
                  isToday && 'bg-accent/[0.04]',
                )}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider text-text-subtle">
                  {DAY_NAMES[i]}
                </p>
                <p
                  className={cn(
                    'mt-0.5 font-title text-lg font-bold',
                    isToday ? 'text-accent' : 'text-text-primary',
                  )}
                >
                  {day.getDate()}
                </p>
              </div>
            )
          })}
        </div>

        {/* Scrollable time grid */}
        <div className="flex-1 overflow-y-auto">
          <div
            className="relative grid grid-cols-[52px_repeat(7,1fr)]"
            style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}
          >
            {/* Hour labels + grid lines */}
            {Array.from({ length: TOTAL_HOURS }, (_, i) => {
              const hour = START_HOUR + i
              return (
                <div key={hour}>
                  {/* Time label */}
                  <div
                    className="absolute left-0 w-[52px] pr-2 text-right text-[10px] tabular-nums text-text-subtle"
                    style={{ top: i * HOUR_HEIGHT - 6 }}
                  >
                    {String(hour).padStart(2, '0')}:00
                  </div>
                  {/* Grid line */}
                  <div
                    className="absolute left-[52px] right-0 border-t border-border-default/30"
                    style={{ top: i * HOUR_HEIGHT }}
                  />
                  {/* Half-hour line */}
                  <div
                    className="absolute left-[52px] right-0 border-t border-border-default/15"
                    style={{ top: i * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
                  />
                </div>
              )
            })}

            {/* Day columns with appointments */}
            {days.map((day, i) => {
              const dateStr = formatISODate(day)
              const dayApts = byDate.get(dateStr) ?? []
              const isToday = dateStr === todayStr

              return (
                <div
                  key={i}
                  className={cn(
                    'relative border-l border-border-default/30',
                    isToday && 'bg-accent/[0.02]',
                  )}
                  style={{ gridColumn: i + 2, gridRow: '1 / -1' }}
                >
                  {dayApts.map((apt) => {
                    const [sh, sm] = apt.startTime.split(':').map(Number)
                    const [eh, em] = apt.endTime.split(':').map(Number)
                    const startMin = sh * 60 + sm - START_HOUR * 60
                    const endMin = eh * 60 + em - START_HOUR * 60
                    const top = (startMin / 60) * HOUR_HEIGHT
                    const height = Math.max(
                      ((endMin - startMin) / 60) * HOUR_HEIGHT,
                      24,
                    )
                    const confirmed = apt.status === 'confirmed'

                    return (
                      <button
                        key={apt.id}
                        onClick={() => setSelected(apt)}
                        className={cn(
                          'absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-left transition-all duration-150 hover:brightness-125',
                          confirmed
                            ? 'border-l-accent bg-accent/[0.12] text-accent'
                            : 'border-l-danger bg-danger/[0.08] text-danger opacity-60',
                        )}
                        style={{ top, height }}
                      >
                        <p className="truncate text-[11px] font-semibold">
                          {apt.leadName}
                        </p>
                        {height >= 36 && (
                          <p className="truncate text-[10px] opacity-70">
                            {apt.startTime.slice(0, 5)} · {apt.serviceType}
                          </p>
                        )}
                      </button>
                    )
                  })}
                </div>
              )
            })}

            {/* Current time indicator */}
            {showTimeLine && (
              <div
                className="pointer-events-none absolute left-[52px] right-0 z-10"
                style={{ top: currentTop }}
              >
                <div className="relative flex items-center">
                  <div className="-ml-[5px] h-2.5 w-2.5 rounded-full bg-danger shadow-[0_0_6px_rgba(240,112,112,0.5)]" />
                  <div className="flex-1 border-t border-danger/80" />
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── Detail modal ── */}
      <Dialog.Root
        open={selected !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen) setSelected(null)
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none">
            {selected && (
              <div className="card-glass w-full max-w-md p-6">
                <div className="flex items-start justify-between">
                  <Dialog.Title className="font-title text-lg font-semibold text-text-primary">
                    Detalhes do agendamento
                  </Dialog.Title>
                  <Dialog.Close className="flex h-7 w-7 items-center justify-center rounded-lg text-text-subtle transition-colors hover:bg-surface-2 hover:text-text-primary">
                    <X className="h-4 w-4" />
                  </Dialog.Close>
                </div>

                <div className="mt-5 space-y-4">
                  <DetailRow label="Status">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        selected.status === 'confirmed'
                          ? 'bg-success/10 text-success'
                          : 'bg-danger/10 text-danger',
                      )}
                    >
                      {selected.status === 'confirmed' ? (
                        <CalendarCheck className="h-3 w-3" />
                      ) : (
                        <CalendarX2 className="h-3 w-3" />
                      )}
                      {selected.status === 'confirmed'
                        ? 'Confirmado'
                        : 'Cancelado'}
                    </span>
                  </DetailRow>
                  <DetailRow label="Lead">{selected.leadName}</DetailRow>
                  <DetailRow label="Serviço">{selected.serviceType}</DetailRow>
                  <DetailRow label="Data">
                    {formatDate(selected.date)}
                  </DetailRow>
                  <DetailRow label="Horário">
                    {selected.startTime.slice(0, 5)} –{' '}
                    {selected.endTime.slice(0, 5)}
                  </DetailRow>
                  <DetailRow label="Criado em">
                    {formatDate(selected.createdAt)}
                  </DetailRow>
                </div>

                {selected.sessionId && (
                  <div className="mt-6 border-t border-border-default pt-4">
                    <Link
                      href={`/conversas/${selected.sessionId}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent-light"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Ver conversa
                    </Link>
                  </div>
                )}
              </div>
            )}
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

function DetailRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="shrink-0 text-xs text-text-subtle">{label}</span>
      <span className="text-sm text-text-primary">{children}</span>
    </div>
  )
}
