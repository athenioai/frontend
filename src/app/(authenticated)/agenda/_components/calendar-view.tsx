'use client'

import { useMemo, useState } from 'react'
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
import { formatDate, formatISODate, addDays, getMonday } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Appointment } from '@/lib/services/interfaces/appointment-service'
import Link from 'next/link'

// ── Constants ──

const HOUR_HEIGHT = 72
const START_HOUR = 0
const END_HOUR = 24
const TOTAL_HOURS = END_HOUR - START_HOUR

const DAY_NAMES_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const DAY_NAMES_FULL = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
  'Domingo',
]

type View = 'day' | 'week' | 'month'

const VIEW_TABS: { value: View; label: string }[] = [
  { value: 'day', label: 'Dia' },
  { value: 'week', label: 'Semana' },
  { value: 'month', label: 'Mês' },
]

// ── Helpers ──

function groupByDate(appointments: Appointment[]) {
  const map = new Map<string, Appointment[]>()
  for (const apt of appointments) {
    const list = map.get(apt.date) ?? []
    list.push(apt)
    map.set(apt.date, list)
  }
  return map
}

function getMonthGridDates(year: number, month: number): Date[] {
  const first = new Date(year, month, 1)
  const monday = getMonday(first)
  return Array.from({ length: 42 }, (_, i) => addDays(monday, i))
}

// ── Component ──

interface CalendarViewProps {
  appointments: Appointment[]
  anchorDate: string
  view: View
  currentStatus?: 'confirmed' | 'cancelled'
}

export function CalendarView({
  appointments,
  anchorDate,
  view,
  currentStatus,
}: CalendarViewProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<Appointment | null>(null)

  const anchor = new Date(anchorDate + 'T00:00:00')
  const todayStr = formatISODate(new Date())
  const byDate = useMemo(() => groupByDate(appointments), [appointments])

  // ── Navigation ──

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams()
    const merged: Record<string, string | undefined> = {
      view,
      date: anchorDate,
      status: currentStatus,
      ...overrides,
    }
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    // Clean defaults
    if (params.get('view') === 'week') params.delete('view')
    const todayMonday = formatISODate(getMonday(new Date()))
    const todayStr2 = formatISODate(new Date())
    const todayMonth = formatISODate(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    )
    const dateVal = params.get('date')
    const viewVal = params.get('view') ?? 'week'
    if (
      (viewVal === 'week' && dateVal === todayMonday) ||
      (viewVal === 'day' && dateVal === todayStr2) ||
      (viewVal === 'month' && dateVal === todayMonth) ||
      (!params.get('view') && dateVal === todayMonday)
    ) {
      params.delete('date')
    }
    const qs = params.toString()
    return `/agenda${qs ? `?${qs}` : ''}`
  }

  function navigate(offset: number) {
    let newDate: Date
    if (view === 'day') {
      newDate = addDays(anchor, offset)
    } else if (view === 'month') {
      newDate = new Date(anchor.getFullYear(), anchor.getMonth() + offset, 1)
    } else {
      newDate = addDays(anchor, offset * 7)
    }
    router.push(buildUrl({ date: formatISODate(newDate) }))
  }

  function changeView(v: View) {
    const params: Record<string, string | undefined> = { view: v }
    // Reset date to sensible default for new view
    if (v === 'week') params.date = formatISODate(getMonday(anchor))
    else if (v === 'month')
      params.date = formatISODate(
        new Date(anchor.getFullYear(), anchor.getMonth(), 1),
      )
    else params.date = anchorDate
    router.push(buildUrl(params))
  }

  // ── Navigation label ──

  let navLabel: string
  if (view === 'day') {
    const dayIdx = (anchor.getDay() + 6) % 7
    navLabel = `${DAY_NAMES_FULL[dayIdx]}, ${anchor.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}`
  } else if (view === 'month') {
    navLabel = anchor.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric',
    })
  } else {
    const monday = anchor
    const sunday = addDays(monday, 6)
    if (monday.getMonth() === sunday.getMonth()) {
      navLabel = `${monday.getDate()} – ${sunday.getDate()} de ${monday.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`
    } else {
      navLabel = `${monday.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} – ${sunday.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}`
    }
  }

  // ── Current time ──

  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  const currentTop = ((currentMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT
  const timeLineVisible =
    currentTop >= 0 && currentTop <= TOTAL_HOURS * HOUR_HEIGHT

  return (
    <>
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
        className="shrink-0"
      >
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
          <h1 className="font-title text-2xl font-bold text-text-primary">
            Agenda
          </h1>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-xs" onClick={() => navigate(-1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[180px] text-center text-sm font-medium capitalize text-text-primary">
              {navLabel}
            </span>
            <Button variant="ghost" size="icon-xs" onClick={() => navigate(1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* View toggle */}
          <div className="flex gap-0.5 rounded-lg bg-surface-2 p-0.5">
            {VIEW_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => changeView(tab.value)}
                className={cn(
                  'rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150',
                  view === tab.value
                    ? 'bg-accent text-primary-foreground shadow-sm'
                    : 'text-text-muted hover:text-text-primary',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <Link href="/configuracoes" className="ml-auto">
            <Button variant="outline" size="xs">
              <Settings className="h-3.5 w-3.5" />
              Configurações
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* ── Grid ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: MOTION.duration.normal, delay: 0.1 }}
        className="mt-5 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border-default"
      >
        {view === 'day' && (
          <DayGrid
            date={anchor}
            appointments={byDate.get(anchorDate) ?? []}
            todayStr={todayStr}
            timeLineVisible={timeLineVisible}
            currentTop={currentTop}
            onSelect={setSelected}
          />
        )}
        {view === 'week' && (
          <WeekGrid
            monday={anchor}
            byDate={byDate}
            todayStr={todayStr}
            timeLineVisible={timeLineVisible}
            currentTop={currentTop}
            onSelect={setSelected}
          />
        )}
        {view === 'month' && (
          <MonthGrid
            anchorMonth={anchor}
            byDate={byDate}
            todayStr={todayStr}
            onSelect={setSelected}
          />
        )}
      </motion.div>

      {/* ── Detail modal ── */}
      <DetailModal selected={selected} onClose={() => setSelected(null)} />
    </>
  )
}

// ── Time grid shared: renders hour labels, grid lines, appointment blocks ──

function TimeGrid({
  cols,
  days,
  byDate,
  todayStr,
  timeLineVisible,
  currentTop,
  onSelect,
}: {
  cols: number
  days: Date[]
  byDate: Map<string, Appointment[]>
  todayStr: string
  timeLineVisible: boolean
  currentTop: number
  onSelect: (a: Appointment) => void
}) {
  const showLine =
    timeLineVisible && days.some((d) => formatISODate(d) === todayStr)

  return (
    <div className="flex-1 overflow-y-auto">
      <div
        className="relative"
        style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}
      >
        {/* Hour labels + grid lines */}
        {Array.from({ length: TOTAL_HOURS }, (_, i) => {
          const hour = START_HOUR + i
          return (
            <div key={hour}>
              <div
                className="absolute left-0 w-[52px] pr-2 text-right text-[10px] tabular-nums text-text-subtle"
                style={{ top: i * HOUR_HEIGHT + (i === 0 ? 4 : -6) }}
              >
                {String(hour).padStart(2, '0')}:00
              </div>
              <div
                className="absolute left-[52px] right-0 border-t border-border-default/30"
                style={{ top: i * HOUR_HEIGHT }}
              />
              <div
                className="absolute left-[52px] right-0 border-t border-border-default/15"
                style={{ top: i * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
              />
            </div>
          )
        })}

        {/* Day columns */}
        <div
          className="absolute inset-y-0 left-[52px] right-0 grid"
          style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
        >
          {days.map((day, i) => {
            const dateStr = formatISODate(day)
            const apts = byDate.get(dateStr) ?? []
            const isToday = dateStr === todayStr

            return (
              <div
                key={i}
                className={cn(
                  'relative border-l border-border-default/30',
                  isToday && 'bg-accent/[0.02]',
                )}
              >
                {apts.map((apt) => (
                  <AppointmentBlock
                    key={apt.id}
                    apt={apt}
                    onSelect={onSelect}
                  />
                ))}
              </div>
            )
          })}
        </div>

        {/* Current time line */}
        {showLine && (
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
  )
}

// ── Appointment block (positioned in time grid) ──

function AppointmentBlock({
  apt,
  onSelect,
}: {
  apt: Appointment
  onSelect: (a: Appointment) => void
}) {
  const [sh, sm] = apt.startTime.split(':').map(Number)
  const [eh, em] = apt.endTime.split(':').map(Number)
  const startMin = sh * 60 + sm - START_HOUR * 60
  const endMin = eh * 60 + em - START_HOUR * 60
  const top = (startMin / 60) * HOUR_HEIGHT
  const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, 24)
  const confirmed = apt.status === 'confirmed'

  return (
    <button
      onClick={() => onSelect(apt)}
      className={cn(
        'absolute inset-x-1 overflow-hidden rounded-md border-l-[3px] px-2 py-1 text-left transition-all duration-150 hover:brightness-125',
        confirmed
          ? 'border-l-accent bg-accent/[0.12] text-accent'
          : 'border-l-danger bg-danger/[0.08] text-danger opacity-60',
      )}
      style={{ top, height }}
    >
      <p className="truncate text-[11px] font-semibold">{apt.leadName}</p>
      {height >= 36 && (
        <p className="truncate text-[10px] opacity-70">
          {apt.startTime.slice(0, 5)} · {apt.serviceType}
        </p>
      )}
    </button>
  )
}

// ── Day view ──

function DayGrid({
  date,
  appointments,
  todayStr,
  timeLineVisible,
  currentTop,
  onSelect,
}: {
  date: Date
  appointments: Appointment[]
  todayStr: string
  timeLineVisible: boolean
  currentTop: number
  onSelect: (a: Appointment) => void
}) {
  const dateStr = formatISODate(date)
  const isToday = dateStr === todayStr
  const dayIdx = (date.getDay() + 6) % 7

  const byDate = new Map<string, Appointment[]>()
  if (appointments.length) byDate.set(dateStr, appointments)

  return (
    <>
      {/* Header */}
      <div className="grid shrink-0 grid-cols-[52px_1fr] border-b border-border-default bg-surface-1">
        <div />
        <div
          className={cn(
            'border-l border-border-default/50 py-2.5 text-center',
            isToday && 'bg-accent/[0.04]',
          )}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-subtle">
            {DAY_NAMES_SHORT[dayIdx]}
          </p>
          <p
            className={cn(
              'mt-0.5 font-title text-lg font-bold',
              isToday ? 'text-accent' : 'text-text-primary',
            )}
          >
            {date.getDate()}
          </p>
        </div>
      </div>
      <TimeGrid
        cols={1}
        days={[date]}
        byDate={byDate}
        todayStr={todayStr}
        timeLineVisible={timeLineVisible}
        currentTop={currentTop}
        onSelect={onSelect}
      />
    </>
  )
}

// ── Week view ──

function WeekGrid({
  monday,
  byDate,
  todayStr,
  timeLineVisible,
  currentTop,
  onSelect,
}: {
  monday: Date
  byDate: Map<string, Appointment[]>
  todayStr: string
  timeLineVisible: boolean
  currentTop: number
  onSelect: (a: Appointment) => void
}) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i))

  return (
    <>
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
                {DAY_NAMES_SHORT[i]}
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
      <TimeGrid
        cols={7}
        days={days}
        byDate={byDate}
        todayStr={todayStr}
        timeLineVisible={timeLineVisible}
        currentTop={currentTop}
        onSelect={onSelect}
      />
    </>
  )
}

// ── Month view ──

function MonthGrid({
  anchorMonth,
  byDate,
  todayStr,
  onSelect,
}: {
  anchorMonth: Date
  byDate: Map<string, Appointment[]>
  todayStr: string
  onSelect: (a: Appointment) => void
}) {
  const year = anchorMonth.getFullYear()
  const month = anchorMonth.getMonth()
  const gridDates = getMonthGridDates(year, month)

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Day-of-week header */}
      <div className="grid grid-cols-7 border-b border-border-default bg-surface-1">
        {DAY_NAMES_SHORT.map((name) => (
          <div
            key={name}
            className="border-l border-border-default/50 py-2 text-center text-[10px] font-semibold uppercase tracking-wider text-text-subtle first:border-l-0"
          >
            {name}
          </div>
        ))}
      </div>

      {/* Weeks */}
      <div className="grid grid-cols-7 grid-rows-6">
        {gridDates.map((date, i) => {
          const dateStr = formatISODate(date)
          const isToday = dateStr === todayStr
          const isCurrentMonth = date.getMonth() === month
          const apts = byDate.get(dateStr) ?? []

          return (
            <div
              key={i}
              className={cn(
                'min-h-[90px] border-b border-l border-border-default/30 p-1.5 first:border-l-0',
                i % 7 === 0 && 'border-l-0',
                !isCurrentMonth && 'opacity-30',
                isToday && 'bg-accent/[0.03]',
              )}
            >
              <p
                className={cn(
                  'text-right text-xs font-medium',
                  isToday ? 'text-accent' : 'text-text-muted',
                )}
              >
                {date.getDate()}
              </p>
              <div className="mt-1 space-y-0.5">
                {apts.slice(0, 3).map((apt) => {
                  const confirmed = apt.status === 'confirmed'
                  return (
                    <button
                      key={apt.id}
                      onClick={() => onSelect(apt)}
                      className={cn(
                        'block w-full truncate rounded px-1 py-0.5 text-left text-[10px] font-medium transition-all hover:brightness-125',
                        confirmed
                          ? 'bg-accent/[0.12] text-accent'
                          : 'bg-danger/[0.08] text-danger',
                      )}
                    >
                      {apt.startTime.slice(0, 5)} {apt.leadName}
                    </button>
                  )
                })}
                {apts.length > 3 && (
                  <p className="px-1 text-[10px] text-text-subtle">
                    +{apts.length - 3} mais
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Detail modal ──

function DetailModal({
  selected,
  onClose,
}: {
  selected: Appointment | null
  onClose: () => void
}) {
  return (
    <Dialog.Root
      open={selected !== null}
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose()
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
                <DetailRow label="Data">{formatDate(selected.date)}</DetailRow>
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
