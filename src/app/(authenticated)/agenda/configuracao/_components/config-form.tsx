'use client'

import { useState, useTransition } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, Save, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MOTION, fadeInUp, staggerContainer } from '@/lib/motion'
import { updateCalendarConfig } from '../../actions'
import type {
  CalendarConfig,
  BusinessHour,
} from '@/lib/services/interfaces/calendar-config-service'
import Link from 'next/link'

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
  if (horario === 'Fechado') return { open: false, start: '09:00', end: '18:00' }
  const parts = horario.split(' as ')
  return { open: true, start: parts[0] ?? '09:00', end: parts[1] ?? '18:00' }
}

function serializeHorario(state: DayState): string {
  return state.open ? `${state.start} as ${state.end}` : 'Fechado'
}

interface ConfigFormProps {
  initialConfig: CalendarConfig | null
}

export function ConfigForm({ initialConfig }: ConfigFormProps) {
  const hours = initialConfig?.business_hours ?? DEFAULT_HOURS

  const [days, setDays] = useState<DayState[]>(
    DAYS.map((dia) => {
      const found = hours.find((h) => h.dia === dia)
      return parseHorario(found?.horario ?? 'Fechado')
    }),
  )
  const [slotDuration, setSlotDuration] = useState(
    initialConfig?.slot_duration_minutes ?? 30,
  )
  const [minAdvance, setMinAdvance] = useState(
    initialConfig?.min_advance_hours ?? 1,
  )
  const [minCancelAdvance, setMinCancelAdvance] = useState(
    initialConfig?.min_cancel_advance_hours ?? 2,
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
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
        className="flex items-center gap-3"
      >
        <Link href="/agenda">
          <Button variant="ghost" size="icon-sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-title text-xl font-bold text-text-primary">
            Configuração da Agenda
          </h1>
          <p className="mt-0.5 text-sm text-text-muted">
            Horários de funcionamento e regras de agendamento
          </p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit}>
        {/* Business hours */}
        <motion.div
          variants={fadeInUp}
          transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
          className="mt-8"
        >
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
            Horários de funcionamento
          </h2>

          <div className="mt-4 space-y-2">
            {DAYS.map((dia, i) => (
              <div
                key={dia}
                className="card-surface flex items-center gap-4 px-4 py-3"
              >
                <span className="w-24 shrink-0 text-sm font-medium text-text-primary">
                  {dia}
                </span>

                {/* Toggle */}
                <button
                  type="button"
                  onClick={() => updateDay(i, { open: !days[i].open })}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
                    days[i].open ? 'bg-accent' : 'bg-surface-2'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                      days[i].open ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>

                {days[i].open ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={days[i].start}
                      onChange={(e) => updateDay(i, { start: e.target.value })}
                      className={inputClass}
                    />
                    <span className="text-xs text-text-subtle">às</span>
                    <input
                      type="time"
                      value={days[i].end}
                      onChange={(e) => updateDay(i, { end: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                ) : (
                  <span className="text-sm text-text-subtle">Fechado</span>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Settings */}
        <motion.div
          variants={fadeInUp}
          transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
          className="mt-8"
        >
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
            Configurações
          </h2>

          <div className="mt-4 space-y-3">
            <div className="card-surface flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-text-primary">
                  Duração do slot
                </p>
                <p className="text-xs text-text-subtle">10 a 120 minutos</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={10}
                  max={120}
                  value={slotDuration}
                  onChange={(e) => setSlotDuration(Number(e.target.value))}
                  className={`${inputClass} w-20 text-center`}
                />
                <span className="text-xs text-text-subtle">min</span>
              </div>
            </div>

            <div className="card-surface flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-text-primary">
                  Antecedência para agendar
                </p>
                <p className="text-xs text-text-subtle">0 a 72 horas</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={72}
                  value={minAdvance}
                  onChange={(e) => setMinAdvance(Number(e.target.value))}
                  className={`${inputClass} w-20 text-center`}
                />
                <span className="text-xs text-text-subtle">h</span>
              </div>
            </div>

            <div className="card-surface flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium text-text-primary">
                  Antecedência para cancelar
                </p>
                <p className="text-xs text-text-subtle">0 a 72 horas</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={72}
                  value={minCancelAdvance}
                  onChange={(e) => setMinCancelAdvance(Number(e.target.value))}
                  className={`${inputClass} w-20 text-center`}
                />
                <span className="text-xs text-text-subtle">h</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-lg bg-danger/8 px-3 py-2.5">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        {/* Submit */}
        <motion.div
          variants={fadeInUp}
          transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
          className="mt-8 flex justify-end"
        >
          <Button
            type="submit"
            disabled={isSaving}
            className="h-10 gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-primary-foreground shadow-[0_0_16px_rgba(79,209,197,0.12)] transition-all hover:brightness-110 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                Salvando...
              </>
            ) : saved ? (
              <>
                <Check className="h-4 w-4" />
                Salvo
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salvar configuração
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  )
}
