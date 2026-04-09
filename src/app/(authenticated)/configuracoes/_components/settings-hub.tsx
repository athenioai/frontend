'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import {
  CalendarDays,
  MessageCircle,
  Save,
  Check,
  Plug,
  Unplug,
  Loader2,
  Phone,
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Send,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MOTION } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { updateCalendarConfig } from '../actions'
import {
  connectWhatsAppInstance,
  disconnectWhatsAppInstance,
} from '../../whatsapp/actions'
import { Dialog } from '@base-ui/react/dialog'
import type {
  CalendarConfig,
  BusinessHour,
} from '@/lib/services/interfaces/calendar-config-service'
import type {
  WhatsAppInstance,
  WhatsAppInstanceDetail,
} from '@/lib/services/interfaces/whatsapp-service'

// ── Navigation ──

const SECTIONS = [
  {
    id: 'agenda',
    label: 'Agenda',
    description: 'Horários e regras',
    icon: CalendarDays,
  },
  {
    id: 'canais',
    label: 'Canais',
    description: 'Apps de conversa',
    icon: MessageCircle,
  },
]

// ── Calendar constants ──

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

// ── Main Component ──

interface SettingsHubProps {
  activeTab: string
  calendarConfig: CalendarConfig | null
  whatsAppInstance: WhatsAppInstance | null
  whatsAppDetail: WhatsAppInstanceDetail | null
}

export function SettingsHub({
  activeTab,
  calendarConfig,
  whatsAppInstance,
  whatsAppDetail,
}: SettingsHubProps) {
  const router = useRouter()

  function changeTab(id: string) {
    const params = new URLSearchParams()
    if (id !== 'agenda') params.set('tab', id)
    const qs = params.toString()
    router.push(`/configuracoes${qs ? `?${qs}` : ''}`)
  }

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
      >
        <h1 className="font-title text-2xl font-bold text-text-primary">
          Configurações
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Gerencie as configurações da sua operação
        </p>
      </motion.div>

      {/* Layout: sidebar + content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.08, duration: MOTION.duration.slow }}
        className="mt-8 flex flex-col gap-6 lg:flex-row lg:h-[calc(100vh-180px)]"
      >
        {/* Vertical nav */}
        <nav className="flex shrink-0 gap-2 lg:w-56 lg:flex-col">
          {SECTIONS.map((section) => {
            const active = activeTab === section.id
            return (
              <button
                key={section.id}
                onClick={() => changeTab(section.id)}
                className={cn(
                  'group relative flex flex-1 items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-200 lg:flex-initial',
                  active
                    ? 'bg-accent/[0.08] ring-1 ring-accent/20'
                    : 'hover:bg-[rgba(255,255,255,0.03)]',
                )}
              >
                {active && (
                  <motion.div
                    layoutId="settings-nav-glow"
                    className="absolute inset-0 rounded-xl bg-accent/[0.06]"
                    style={{ boxShadow: '0 0 24px rgba(212,130,10,0.06)' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                  />
                )}
                <div
                  className={cn(
                    'relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
                    active
                      ? 'bg-accent/15 text-accent'
                      : 'bg-surface-2 text-text-subtle group-hover:text-text-muted',
                  )}
                >
                  <section.icon className="h-4 w-4" />
                </div>
                <div className="relative hidden min-w-0 lg:block">
                  <p
                    className={cn(
                      'text-[13px] font-semibold transition-colors',
                      active ? 'text-accent' : 'text-text-primary',
                    )}
                  >
                    {section.label}
                  </p>
                  <p className="text-[11px] text-text-subtle">
                    {section.description}
                  </p>
                </div>
              </button>
            )
          })}
        </nav>

        {/* Content */}
        <div className="min-w-0 flex-1 lg:overflow-y-auto lg:pr-1">
          <AnimatePresence mode="wait">
            {activeTab === 'agenda' && (
              <motion.div
                key="agenda"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
              >
                <AgendaTab config={calendarConfig} />
              </motion.div>
            )}
            {activeTab === 'canais' && (
              <motion.div
                key="canais"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
              >
                <CanaisTab
                  whatsAppInstance={whatsAppInstance}
                  whatsAppDetail={whatsAppDetail}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

// ── Canais Tab ──

function CanaisTab({
  whatsAppInstance,
  whatsAppDetail,
}: {
  whatsAppInstance: WhatsAppInstance | null
  whatsAppDetail: WhatsAppInstanceDetail | null
}) {
  return (
    <div className="space-y-4">
      <WhatsAppChannel instance={whatsAppInstance} detail={whatsAppDetail} />

      {/* Telegram — coming soon */}
      <div className="relative overflow-hidden rounded-2xl border border-border-default/50 bg-surface-1/50 p-6 opacity-60">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#2AABEE]/10">
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-[#2AABEE]">
              <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
            </svg>
          </div>
          <div>
            <h3 className="font-title text-base font-semibold text-text-primary">
              Telegram
            </h3>
            <p className="mt-0.5 text-xs text-text-subtle">
              Em breve
            </p>
          </div>
          <span className="ml-auto rounded-full bg-surface-2 px-3 py-1 text-[11px] font-semibold text-text-subtle">
            Em breve
          </span>
        </div>
      </div>
    </div>
  )
}

// ── WhatsApp Channel ──

function WhatsAppChannel({
  instance,
  detail,
}: {
  instance: WhatsAppInstance | null
  detail: WhatsAppInstanceDetail | null
}) {
  const router = useRouter()
  const [isActing, startAction] = useTransition()
  const [connectOpen, setConnectOpen] = useState(false)
  const [phoneInput, setPhoneInput] = useState('')
  const [connectError, setConnectError] = useState<string | null>(null)
  const [isConnecting, startConnect] = useTransition()

  const isConnected = instance?.status === 'connected'
  const hasInstance = instance !== null

  function handleConnect() {
    const phone = phoneInput.replace(/\D/g, '')
    if (phone.length < 10 || phone.length > 15) {
      setConnectError('Número inválido. Use formato: 5511999999999')
      return
    }
    setConnectError(null)

    startConnect(async () => {
      const instanceId = instance?.id
      if (!instanceId) {
        setConnectError('Nenhuma instância disponível. Contate o administrador.')
        return
      }
      const result = await connectWhatsAppInstance(instanceId, phone)
      if (result.success) {
        setConnectOpen(false)
        setPhoneInput('')
        router.refresh()
      } else {
        setConnectError(result.error ?? 'Erro ao conectar.')
      }
    })
  }

  function handleDisconnect() {
    if (!instance) return
    startAction(async () => {
      await disconnectWhatsAppInstance(instance.id)
      router.refresh()
    })
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border-default bg-surface-1">
      {/* Header */}
      {/* Header */}
      <div className="flex items-center justify-between gap-4 border-b border-border-default/50 p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#25D366]/10">
            <svg viewBox="0 0 24 24" className="h-6 w-6 fill-[#25D366]">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-title text-base font-semibold text-text-primary">
                WhatsApp
              </h3>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold',
                  isConnected
                    ? 'bg-emerald/10 text-emerald'
                    : 'bg-surface-2 text-text-subtle',
                )}
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    isConnected ? 'bg-emerald' : 'bg-text-subtle',
                  )}
                />
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
            </div>
            {hasInstance && instance.phone_number ? (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-text-muted">
                <Phone className="h-3.5 w-3.5" />
                {instance.phone_number}
              </p>
            ) : (
              <p className="mt-1 text-sm text-text-subtle">
                Nenhum número vinculado
              </p>
            )}
          </div>
        </div>

        {isConnected ? (
          <Button
            variant="ghost"
            onClick={handleDisconnect}
            disabled={isActing}
            className="h-9 gap-2 rounded-xl px-4 text-sm text-text-muted hover:bg-danger/10 hover:text-danger"
          >
            {isActing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Unplug className="h-3.5 w-3.5" />
            )}
            Desconectar
          </Button>
        ) : (
          <Button
            onClick={() => {
              setPhoneInput('')
              setConnectError(null)
              setConnectOpen(true)
            }}
            className="h-9 gap-2 rounded-xl border border-[#25D366]/30 bg-[#25D366]/8 px-4 text-sm font-semibold text-[#25D366] transition-all duration-200 hover:border-[#25D366]/50 hover:bg-[#25D366]/15"
          >
            <Plug className="h-3.5 w-3.5" />
            Conectar número
          </Button>
        )}
      </div>

      {/* Stats or empty state */}
      {detail ? (
        <div className="grid grid-cols-2 gap-px bg-border-default/30 sm:grid-cols-4">
          <StatCell
            label="Enviadas hoje"
            value={detail.messages_sent_today}
            icon={<ArrowUpRight className="h-3.5 w-3.5 text-accent" />}
          />
          <StatCell
            label="Recebidas hoje"
            value={detail.messages_received_today}
            icon={<ArrowDownLeft className="h-3.5 w-3.5 text-emerald" />}
          />
          <StatCell
            label="Enviadas semana"
            value={detail.messages_sent_week}
            icon={<ArrowUpRight className="h-3.5 w-3.5 text-accent" />}
          />
          <StatCell
            label="Recebidas semana"
            value={detail.messages_received_week}
            icon={<ArrowDownLeft className="h-3.5 w-3.5 text-emerald" />}
          />
        </div>
      ) : (
        <div className="px-5 py-6 text-center text-sm text-text-subtle">
          Conecte um número para visualizar as estatísticas de mensagens
        </div>
      )}

      {/* Connect modal */}
      <Dialog.Root
        open={connectOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen && !isConnecting) {
            setConnectOpen(false)
            setConnectError(null)
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none">
            <div className="card-glass w-full max-w-sm p-6">
              <div className="flex items-start justify-between">
                <Dialog.Title className="font-title text-lg font-semibold text-text-primary">
                  Conectar WhatsApp
                </Dialog.Title>
                <Dialog.Close
                  disabled={isConnecting}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-text-subtle transition-colors hover:bg-surface-2 hover:text-text-primary disabled:pointer-events-none"
                >
                  <X className="h-4 w-4" />
                </Dialog.Close>
              </div>

              <div className="mt-5 space-y-1.5">
                <label className="text-xs font-medium text-text-muted">
                  Número de telefone
                </label>
                <input
                  type="text"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="5511999999999"
                  className="h-10 w-full rounded-xl border border-border-default bg-surface-2 px-3 text-sm tabular-nums text-text-primary outline-none placeholder:text-text-subtle transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
                />
                <p className="text-[11px] text-text-subtle">
                  Inclua código do país (55) + DDD + número
                </p>
              </div>

              {connectError && (
                <div className="mt-4 rounded-lg bg-danger/8 px-3 py-2.5">
                  <p className="text-sm text-danger">{connectError}</p>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-2">
                <Dialog.Close
                  disabled={isConnecting}
                  className="inline-flex h-9 items-center rounded-xl px-4 text-sm font-medium text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary disabled:pointer-events-none disabled:opacity-50"
                >
                  Cancelar
                </Dialog.Close>
                <Button
                  onClick={handleConnect}
                  disabled={isConnecting}
                  className="h-9 rounded-xl border border-[#25D366]/30 bg-[#25D366]/8 px-4 text-sm font-semibold text-[#25D366] transition-all duration-200 hover:border-[#25D366]/50 hover:bg-[#25D366]/15 disabled:opacity-50"
                >
                  {isConnecting ? (
                    <span className="flex items-center gap-1.5">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Conectando...
                    </span>
                  ) : (
                    'Conectar'
                  )}
                </Button>
              </div>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}

function StatCell({
  label,
  value,
  icon,
}: {
  label: string
  value: number
  icon: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1 bg-surface-1 px-5 py-4">
      <div className="flex items-center gap-1.5">
        {icon}
        <span className="text-[11px] text-text-subtle">{label}</span>
      </div>
      <span className="font-title text-xl font-bold tabular-nums text-text-primary">
        {value.toLocaleString('pt-BR')}
      </span>
    </div>
  )
}

// ── Agenda Tab ──

function AgendaTab({ config }: { config: CalendarConfig | null }) {
  const hours = config?.business_hours ?? DEFAULT_HOURS

  const [days, setDays] = useState<DayState[]>(
    DAYS.map((dia) => {
      const found = hours.find((h) => h.dia === dia)
      return parseHorario(found?.horario ?? 'Fechado')
    }),
  )
  const [slotDuration, setSlotDuration] = useState(config?.slot_duration_minutes ?? 30)
  const [minAdvance, setMinAdvance] = useState(config?.min_advance_hours ?? 1)
  const [minCancelAdvance, setMinCancelAdvance] = useState(config?.min_cancel_advance_hours ?? 2)
  const [isSaving, startSave] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function updateDay(index: number, patch: Partial<DayState>) {
    setDays((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)))
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-border-default bg-surface-1 p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
          Horários de funcionamento
        </h3>

        <div className="mt-4 space-y-1">
          {DAYS.map((dia, i) => (
            <div
              key={dia}
              className="flex items-center gap-4 rounded-xl px-3 py-2.5 transition-colors hover:bg-[rgba(255,255,255,0.02)]"
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
                    onChange={(e) => updateDay(i, { start: e.target.value })}
                    className="h-8 rounded-lg border border-border-default bg-surface-2 px-2.5 text-xs text-text-primary outline-none transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
                  />
                  <span className="text-[11px] text-text-subtle">às</span>
                  <input
                    type="time"
                    value={days[i].end}
                    onChange={(e) => updateDay(i, { end: e.target.value })}
                    className="h-8 rounded-lg border border-border-default bg-surface-2 px-2.5 text-xs text-text-primary outline-none transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
                  />
                </div>
              ) : (
                <span className="text-xs text-text-subtle">Fechado</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border-default bg-surface-1 p-5">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
          Regras de agendamento
        </h3>

        <div className="mt-4 space-y-1">
          <SettingRow
            label="Duração do slot"
            hint="10 a 120 minutos"
            value={slotDuration}
            onChange={setSlotDuration}
            min={10}
            max={120}
            unit="min"
          />
          <SettingRow
            label="Antecedência para agendar"
            hint="0 a 72 horas"
            value={minAdvance}
            onChange={setMinAdvance}
            min={0}
            max={72}
            unit="h"
          />
          <SettingRow
            label="Antecedência para cancelar"
            hint="0 a 72 horas"
            value={minCancelAdvance}
            onChange={setMinCancelAdvance}
            min={0}
            max={72}
            unit="h"
          />
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-danger/8 px-3 py-2.5">
          <p className="text-sm text-danger">{error}</p>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isSaving}
          className="h-9 gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-primary-foreground shadow-[0_0_16px_rgba(212,130,10,0.12)] transition-all hover:brightness-110 disabled:opacity-50"
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
              Salvar configuração
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

function SettingRow({
  label,
  hint,
  value,
  onChange,
  min,
  max,
  unit,
}: {
  label: string
  hint: string
  value: number
  onChange: (v: number) => void
  min: number
  max: number
  unit: string
}) {
  return (
    <div className="flex items-center justify-between rounded-xl px-3 py-3 transition-colors hover:bg-[rgba(255,255,255,0.02)]">
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
          className="h-8 w-16 rounded-lg border border-border-default bg-surface-2 text-center text-xs text-text-primary outline-none transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
        />
        <span className="text-xs text-text-subtle">{unit}</span>
      </div>
    </div>
  )
}
