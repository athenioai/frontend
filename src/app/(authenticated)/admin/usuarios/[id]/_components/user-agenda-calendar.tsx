'use client'

import { useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import {
  ChevronLeft,
  ChevronRight,
  CalendarCheck,
  CalendarX2,
  X,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate, formatISODate, addDays, getMonday } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Appointment } from '@/lib/services/interfaces/appointment-service'
import Link from 'next/link'

const HOUR_HEIGHT = 64
const START_HOUR = 0
const END_HOUR = 24
const TOTAL_HOURS = END_HOUR - START_HOUR
const DAY_NAMES = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const DAY_NAMES_FULL = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']

type View = 'day' | 'week' | 'month'

interface UserAgendaCalendarProps {
  appointments: Appointment[]
}

export function UserAgendaCalendar({ appointments }: UserAgendaCalendarProps) {
  const [view, setView] = useState<View>('week')
  const [anchor, setAnchor] = useState(() => {
    if (true) return getMonday(new Date()) // default week
    return new Date()
  })
  const [selected, setSelected] = useState<Appointment | null>(null)

  const todayStr = formatISODate(new Date())

  // Group by date
  const byDate = new Map<string, Appointment[]>()
  for (const apt of appointments) {
    const list = byDate.get(apt.date) ?? []
    list.push(apt)
    byDate.set(apt.date, list)
  }

  function navigate(offset: number) {
    if (view === 'day') setAnchor(addDays(anchor, offset))
    else if (view === 'week') setAnchor(addDays(anchor, offset * 7))
    else setAnchor(new Date(anchor.getFullYear(), anchor.getMonth() + offset, 1))
  }

  function changeView(v: View) {
    setView(v)
    if (v === 'week') setAnchor(getMonday(anchor))
    else if (v === 'month') setAnchor(new Date(anchor.getFullYear(), anchor.getMonth(), 1))
  }

  // Label
  let navLabel: string
  if (view === 'day') {
    const dayIdx = (anchor.getDay() + 6) % 7
    navLabel = `${DAY_NAMES_FULL[dayIdx]}, ${anchor.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}`
  } else if (view === 'month') {
    navLabel = anchor.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  } else {
    const sunday = addDays(anchor, 6)
    if (anchor.getMonth() === sunday.getMonth()) {
      navLabel = `${anchor.getDate()} – ${sunday.getDate()} de ${anchor.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`
    } else {
      navLabel = `${anchor.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} – ${sunday.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}`
    }
  }

  // Current time
  const now = new Date()
  const currentTop = ((now.getHours() * 60 + now.getMinutes() - START_HOUR * 60) / 60) * HOUR_HEIGHT
  const timeLineVisible = currentTop >= 0 && currentTop <= TOTAL_HOURS * HOUR_HEIGHT

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
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

        <div className="flex gap-0.5 rounded-lg bg-surface-2 p-0.5">
          {(['day', 'week', 'month'] as const).map((v) => (
            <button
              key={v}
              onClick={() => changeView(v)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150',
                view === v
                  ? 'bg-accent text-primary-foreground shadow-sm'
                  : 'text-text-muted hover:text-text-primary',
              )}
            >
              {v === 'day' ? 'Dia' : v === 'week' ? 'Semana' : 'Mês'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="mt-4 overflow-hidden rounded-xl border border-border-default">
        {view === 'day' && (
          <DayView
            date={anchor}
            byDate={byDate}
            todayStr={todayStr}
            timeLineVisible={timeLineVisible}
            currentTop={currentTop}
            onSelect={setSelected}
          />
        )}
        {view === 'week' && (
          <WeekView
            monday={anchor}
            byDate={byDate}
            todayStr={todayStr}
            timeLineVisible={timeLineVisible}
            currentTop={currentTop}
            onSelect={setSelected}
          />
        )}
        {view === 'month' && (
          <MonthView
            anchor={anchor}
            byDate={byDate}
            todayStr={todayStr}
            onSelect={setSelected}
          />
        )}
      </div>

      {/* Detail modal */}
      <Dialog.Root open={selected !== null} onOpenChange={(o) => { if (!o) setSelected(null) }}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none">
            {selected && (
              <div className="card-glass w-full max-w-md p-6">
                <div className="flex items-start justify-between">
                  <Dialog.Title className="font-title text-lg font-semibold text-text-primary">Detalhes do agendamento</Dialog.Title>
                  <Dialog.Close className="flex h-7 w-7 items-center justify-center rounded-lg text-text-subtle transition-colors hover:bg-surface-2 hover:text-text-primary"><X className="h-4 w-4" /></Dialog.Close>
                </div>
                <div className="mt-5 space-y-4">
                  <Row label="Status">
                    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold', selected.status === 'confirmed' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger')}>
                      {selected.status === 'confirmed' ? <CalendarCheck className="h-3 w-3" /> : <CalendarX2 className="h-3 w-3" />}
                      {selected.status === 'confirmed' ? 'Confirmado' : 'Cancelado'}
                    </span>
                  </Row>
                  <Row label="Lead">{selected.leadName}</Row>
                  <Row label="Serviço">{selected.serviceType}</Row>
                  <Row label="Data">{formatDate(selected.date)}</Row>
                  <Row label="Horário">{selected.startTime.slice(0, 5)} – {selected.endTime.slice(0, 5)}</Row>
                </div>
                {selected.sessionId && (
                  <div className="mt-6 border-t border-border-default pt-4">
                    <Link href={`/conversas/${selected.sessionId}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent-light">
                      <ExternalLink className="h-3.5 w-3.5" />Ver conversa
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

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <span className="shrink-0 text-xs text-text-subtle">{label}</span>
      <span className="text-sm text-text-primary">{children}</span>
    </div>
  )
}

// ── Shared time grid ──

function TimeGrid({
  cols,
  days,
  byDate,
  todayStr,
  showTimeLine,
  currentTop,
  onSelect,
}: {
  cols: number
  days: Date[]
  byDate: Map<string, Appointment[]>
  todayStr: string
  showTimeLine: boolean
  currentTop: number
  onSelect: (a: Appointment) => void
}) {
  return (
    <div className="overflow-y-auto" style={{ maxHeight: 500 }}>
      <div className="relative" style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}>
        {Array.from({ length: TOTAL_HOURS }, (_, i) => (
          <div key={i}>
            <div className="absolute left-0 w-[48px] pr-1.5 text-right text-[9px] tabular-nums text-text-subtle" style={{ top: i * HOUR_HEIGHT + (i === 0 ? 4 : -5) }}>
              {String(START_HOUR + i).padStart(2, '0')}:00
            </div>
            <div className="absolute left-[48px] right-0 border-t border-border-default/30" style={{ top: i * HOUR_HEIGHT }} />
            <div className="absolute left-[48px] right-0 border-t border-border-default/15" style={{ top: i * HOUR_HEIGHT + HOUR_HEIGHT / 2 }} />
          </div>
        ))}
        <div className="absolute inset-y-0 left-[48px] right-0 grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {days.map((day, i) => {
            const dateStr = formatISODate(day)
            const apts = byDate.get(dateStr) ?? []
            const isToday = dateStr === todayStr
            return (
              <div key={i} className={cn('relative border-l border-border-default/30', isToday && 'bg-accent/[0.02]')}>
                {apts.map((apt) => {
                  const [sh, sm] = apt.startTime.split(':').map(Number)
                  const [eh, em] = apt.endTime.split(':').map(Number)
                  const top = ((sh * 60 + sm - START_HOUR * 60) / 60) * HOUR_HEIGHT
                  const height = Math.max(((eh * 60 + em - sh * 60 - sm) / 60) * HOUR_HEIGHT, 22)
                  const confirmed = apt.status === 'confirmed'
                  return (
                    <button key={apt.id} onClick={() => onSelect(apt)} className={cn('absolute inset-x-0.5 overflow-hidden rounded-md border-l-2 px-1.5 py-0.5 text-left transition-all hover:brightness-125', confirmed ? 'border-l-accent bg-accent/[0.12] text-accent' : 'border-l-danger bg-danger/[0.08] text-danger opacity-60')} style={{ top, height }}>
                      <p className="truncate text-[10px] font-semibold">{apt.leadName}</p>
                      {height >= 32 && <p className="truncate text-[9px] opacity-70">{apt.startTime.slice(0, 5)} · {apt.serviceType}</p>}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
        {showTimeLine && (
          <div className="pointer-events-none absolute left-[48px] right-0 z-10" style={{ top: currentTop }}>
            <div className="relative flex items-center">
              <div className="-ml-[5px] h-2 w-2 rounded-full bg-danger shadow-[0_0_6px_rgba(240,112,112,0.5)]" />
              <div className="flex-1 border-t border-danger/80" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Day view ──

function DayView({ date, byDate, todayStr, timeLineVisible, currentTop, onSelect }: {
  date: Date; byDate: Map<string, Appointment[]>; todayStr: string; timeLineVisible: boolean; currentTop: number; onSelect: (a: Appointment) => void
}) {
  const dateStr = formatISODate(date)
  const isToday = dateStr === todayStr
  const dayIdx = (date.getDay() + 6) % 7

  return (
    <>
      <div className="grid shrink-0 grid-cols-[48px_1fr] border-b border-border-default bg-surface-1">
        <div />
        <div className={cn('border-l border-border-default/50 py-2 text-center', isToday && 'bg-accent/[0.04]')}>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-text-subtle">{DAY_NAMES[dayIdx]}</p>
          <p className={cn('mt-0.5 font-title text-base font-bold', isToday ? 'text-accent' : 'text-text-primary')}>{date.getDate()}</p>
        </div>
      </div>
      <TimeGrid
        cols={1}
        days={[date]}
        byDate={byDate}
        todayStr={todayStr}
        showTimeLine={timeLineVisible && isToday}
        currentTop={currentTop}
        onSelect={onSelect}
      />
    </>
  )
}

// ── Week view ──

function WeekView({ monday, byDate, todayStr, timeLineVisible, currentTop, onSelect }: {
  monday: Date; byDate: Map<string, Appointment[]>; todayStr: string; timeLineVisible: boolean; currentTop: number; onSelect: (a: Appointment) => void
}) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i))
  const showLine = timeLineVisible && days.some((d) => formatISODate(d) === todayStr)

  return (
    <>
      <div className="grid shrink-0 grid-cols-[48px_repeat(7,1fr)] border-b border-border-default bg-surface-1">
        <div />
        {days.map((day, i) => {
          const isToday = formatISODate(day) === todayStr
          return (
            <div key={i} className={cn('border-l border-border-default/50 py-2 text-center', isToday && 'bg-accent/[0.04]')}>
              <p className="text-[9px] font-semibold uppercase tracking-wider text-text-subtle">{DAY_NAMES[i]}</p>
              <p className={cn('mt-0.5 font-title text-base font-bold', isToday ? 'text-accent' : 'text-text-primary')}>{day.getDate()}</p>
            </div>
          )
        })}
      </div>
      <TimeGrid cols={7} days={days} byDate={byDate} todayStr={todayStr} showTimeLine={showLine} currentTop={currentTop} onSelect={onSelect} />
    </>
  )
}

// ── Month view ──

function MonthView({ anchor, byDate, todayStr, onSelect }: {
  anchor: Date; byDate: Map<string, Appointment[]>; todayStr: string; onSelect: (a: Appointment) => void
}) {
  const year = anchor.getFullYear()
  const month = anchor.getMonth()
  const gridStart = getMonday(new Date(year, month, 1))
  const gridDates = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i))

  return (
    <>
      <div className="grid grid-cols-7 border-b border-border-default bg-surface-1">
        {DAY_NAMES.map((n) => (
          <div key={n} className="border-l border-border-default/50 py-1.5 text-center text-[9px] font-semibold uppercase tracking-wider text-text-subtle first:border-l-0">{n}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 grid-rows-6">
        {gridDates.map((date, i) => {
          const dateStr = formatISODate(date)
          const isToday = dateStr === todayStr
          const isMonth = date.getMonth() === month
          const apts = byDate.get(dateStr) ?? []
          return (
            <div key={i} className={cn('min-h-[72px] border-b border-l border-border-default/30 p-1 first:border-l-0', i % 7 === 0 && 'border-l-0', !isMonth && 'opacity-30', isToday && 'bg-accent/[0.03]')}>
              <p className={cn('text-right text-[11px] font-medium', isToday ? 'text-accent' : 'text-text-muted')}>{date.getDate()}</p>
              <div className="mt-0.5 space-y-0.5">
                {apts.slice(0, 2).map((apt) => (
                  <button key={apt.id} onClick={() => onSelect(apt)} className={cn('block w-full truncate rounded px-1 py-0.5 text-left text-[9px] font-medium transition-all hover:brightness-125', apt.status === 'confirmed' ? 'bg-accent/[0.12] text-accent' : 'bg-danger/[0.08] text-danger')}>
                    {apt.startTime.slice(0, 5)} {apt.leadName}
                  </button>
                ))}
                {apts.length > 2 && <p className="px-1 text-[9px] text-text-subtle">+{apts.length - 2}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
