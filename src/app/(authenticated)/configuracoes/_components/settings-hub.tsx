'use client'

import { useState, useTransition } from 'react'
import { motion } from 'motion/react'
import { CalendarDays, Save, Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MOTION, fadeInUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { updateCalendarConfig } from '../actions'
import type {
  CalendarConfig,
  BusinessHour,
} from '@/lib/services/interfaces/calendar-config-service'

// ── Calendar config constants ──

const DAYS = [
  'Domingo',
  'Segunda',
  'Terca',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sabado',
]

const DEFAULT_HOURS: BusinessHour[] = [
  { dia: 'Domingo', horario: 'Fechado' },
  { dia: 'Segunda', horario: '09:00 as 18:00' },
  { dia: 'Terca', horario: '09:00 as 18:00' },
  { dia: 'Quarta', horario: '09:00 as 18:00' },
  { dia: 'Quinta', horario: '09:00 as 18:00' },
  { dia: 'Sexta', horario: '09:00 as 18:00' },
  { dia: 'Sabado', horario: '09:00 as 12:00' },
]

interface DayState {
  open: boolean
  start: string
  end: string
}

function parseHorario(horario: string): DayState {
  if (horario === 'Fechado')
    return { open: false, start: '09:00', end: '18:00' }
  const parts = horario.split(' as ')
  return { open: true, start: parts[0] ?? '09:00', end: parts[1] ?? '18:00' }
}

function serializeHorario(state: DayState): string {
  return state.open ? `${state.start} as ${state.end}` : 'Fechado'
}

// ── Component ──

interface SettingsHubProps {
  calendarConfig: CalendarConfig | null
}

export function SettingsHub({ calendarConfig }: SettingsHubProps) {
  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
      >
        <h1 className="font-title text-2xl font-bold text-text-primary">
          Configurações
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Gerencie as configurações da sua operação
        </p>
      </motion.div>

      {/* Sections */}
      <div className="mt-8 space-y-4">
        <motion.div
          variants={fadeInUp}
          transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
        >
          <CalendarConfigSection config={calendarConfig} />
        </motion.div>
      </div>
    </motion.div>
  )
}

// ── Calendar config section (collapsible) ──

function CalendarConfigSection({
  config,
}: {
  config: CalendarConfig | null
}) {
  const hours = config?.business_hours ?? DEFAULT_HOURS

  const [expanded, setExpanded] = useState(true)
  const [days, setDays] = useState<DayState[]>(
    DAYS.map((dia) => {
      const found = hours.find((h) => h.dia === dia)
      return parseHorario(found?.horario ?? 'Fechado')
    }),
  )
  const [slotDuration, setSlotDuration] = useState(
    config?.slot_duration_minutes ?? 30,
  )
  const [minAdvance, setMinAdvance] = useState(
    config?.min_advance_hours ?? 1,
  )
  const [minCancelAdvance, setMinCancelAdvance] = useState(
    config?.min_cancel_advance_hours ?? 2,
  )
  const [isSaving, startSave] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateDay(index: number, patch: Partial<DayState>) {
    setDays((prev) =>
      prev.map((d, i) => (i === index ? { ...d, ...patch } : d)),
    )
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSaved(false)

    const businessHours: BusinessHour[] = DAYS.map((dia, i) => ({
      dia,
      horario: serializeHorario(days[i]),
    }))

    startSave(async () => {
      const result = await updateCalendarConfig({
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
    <div className="card-surface overflow-hidden">
      {/* Section header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-[rgba(255,255,255,0.02)]"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10">
          <CalendarDays className="h-4.5 w-4.5 text-accent" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-text-primary">Agenda</p>
          <p className="text-xs text-text-muted">
            Horários de funcionamento e regras de agendamento
          </p>
        </div>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-text-subtle transition-transform duration-200',
            expanded && 'rotate-180',
          )}
        />
      </button>

      {/* Collapsible content */}
      {expanded && (
        <form onSubmit={handleSubmit}>
          <div className="border-t border-border-default px-5 pb-5 pt-4">
            {/* Business hours */}
            <h3 className="text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
              Horários de funcionamento
            </h3>

            <div className="mt-3 space-y-1.5">
              {DAYS.map((dia, i) => (
                <div
                  key={dia}
                  className="flex items-center gap-4 rounded-lg bg-surface-2/50 px-3 py-2.5"
                >
                  <span className="w-20 shrink-0 text-sm font-medium text-text-primary">
                    {dia}
                  </span>

                  <button
                    type="button"
                    onClick={() => updateDay(i, { open: !days[i].open })}
                    className={cn(
                      'relative h-5 w-9 shrink-0 rounded-full transition-colors duration-200',
                      days[i].open ? 'bg-accent' : 'bg-surface-2',
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200',
                        days[i].open && 'translate-x-4',
                      )}
                    />
                  </button>

                  {days[i].open ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="time"
                        value={days[i].start}
                        onChange={(e) =>
                          updateDay(i, { start: e.target.value })
                        }
                        className={`${inputClass} h-8 text-xs`}
                      />
                      <span className="text-[11px] text-text-subtle">às</span>
                      <input
                        type="time"
                        value={days[i].end}
                        onChange={(e) => updateDay(i, { end: e.target.value })}
                        className={`${inputClass} h-8 text-xs`}
                      />
                    </div>
                  ) : (
                    <span className="text-xs text-text-subtle">Fechado</span>
                  )}
                </div>
              ))}
            </div>

            {/* Settings */}
            <h3 className="mt-6 text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
              Regras de agendamento
            </h3>

            <div className="mt-3 space-y-1.5">
              <SettingRow
                label="Duração do slot"
                hint="10 a 120 minutos"
                value={slotDuration}
                onChange={setSlotDuration}
                min={10}
                max={120}
                unit="min"
                inputClass={inputClass}
              />
              <SettingRow
                label="Antecedência para agendar"
                hint="0 a 72 horas"
                value={minAdvance}
                onChange={setMinAdvance}
                min={0}
                max={72}
                unit="h"
                inputClass={inputClass}
              />
              <SettingRow
                label="Antecedência para cancelar"
                hint="0 a 72 horas"
                value={minCancelAdvance}
                onChange={setMinCancelAdvance}
                min={0}
                max={72}
                unit="h"
                inputClass={inputClass}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="mt-4 rounded-lg bg-danger/8 px-3 py-2.5">
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            {/* Submit */}
            <div className="mt-5 flex justify-end">
              <Button
                type="submit"
                disabled={isSaving}
                className="h-9 gap-2 rounded-xl bg-accent px-4 text-sm font-semibold text-primary-foreground shadow-[0_0_16px_rgba(79,209,197,0.12)] transition-all hover:brightness-110 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                    Salvando...
                  </>
                ) : saved ? (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Salvo
                  </>
                ) : (
                  <>
                    <Save className="h-3.5 w-3.5" />
                    Salvar
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  )
}

// ── Setting row ──

function SettingRow({
  label,
  hint,
  value,
  onChange,
  min,
  max,
  unit,
  inputClass,
}: {
  label: string
  hint: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  unit: string
  inputClass: string
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-surface-2/50 px-3 py-2.5">
      <div>
        <p className="text-sm font-medium text-text-primary">{label}</p>
        <p className="text-[11px] text-text-subtle">{hint}</p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`${inputClass} h-8 w-16 text-center text-xs`}
        />
        <span className="text-xs text-text-subtle">{unit}</span>
      </div>
    </div>
  )
}
