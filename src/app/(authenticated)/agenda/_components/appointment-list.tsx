'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Dialog } from '@base-ui/react/dialog'
import {
  CalendarCheck,
  CalendarX2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Settings,
  X,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MOTION, fadeInUp, staggerContainer } from '@/lib/motion'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type {
  Appointment,
  AppointmentPagination,
} from '@/lib/services/interfaces/appointment-service'
import Link from 'next/link'

const STATUS_TABS = [
  { value: '', label: 'Todos' },
  { value: 'confirmed', label: 'Confirmados' },
  { value: 'cancelled', label: 'Cancelados' },
] as const

interface AppointmentListProps {
  appointments: Appointment[]
  pagination: AppointmentPagination
  currentStatus?: 'confirmed' | 'cancelled'
  currentDateFrom?: string
  currentDateTo?: string
}

export function AppointmentList({
  appointments,
  pagination,
  currentStatus,
  currentDateFrom,
  currentDateTo,
}: AppointmentListProps) {
  const router = useRouter()
  const [selected, setSelected] = useState<Appointment | null>(null)
  const totalPages = Math.ceil(pagination.total / pagination.limit)

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams()
    const merged = {
      status: currentStatus,
      date_from: currentDateFrom,
      date_to: currentDateTo,
      ...overrides,
    }
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    const qs = params.toString()
    return `/agenda${qs ? `?${qs}` : ''}`
  }

  function handleStatusChange(status: string) {
    router.push(buildUrl({ status: status || undefined, page: undefined }))
  }

  function handleDateChange(field: 'date_from' | 'date_to', value: string) {
    router.push(buildUrl({ [field]: value || undefined, page: undefined }))
  }

  function handlePageChange(page: number) {
    router.push(buildUrl({ page: page > 1 ? String(page) : undefined }))
  }

  return (
    <>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-title text-2xl font-bold text-text-primary">
              Agenda
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              Agendamentos criados pelos seus agentes de IA
            </p>
          </div>
          <Link href="/agenda/configuracao">
            <Button variant="outline" size="sm">
              <Settings className="h-3.5 w-3.5" />
              Configuração
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          {/* Status tabs */}
          <div className="flex gap-0.5 rounded-lg bg-surface-2 p-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleStatusChange(tab.value)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-150',
                  (currentStatus ?? '') === tab.value
                    ? 'bg-accent text-primary-foreground shadow-sm'
                    : 'text-text-muted hover:text-text-primary',
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Date filters */}
          <div className="flex items-center gap-2 sm:ml-auto">
            <label className="text-xs text-text-subtle">De</label>
            <input
              type="date"
              value={currentDateFrom ?? ''}
              onChange={(e) => handleDateChange('date_from', e.target.value)}
              className="h-8 rounded-lg border border-border-default bg-surface-2 px-2.5 text-xs text-text-primary outline-none transition-colors hover:border-border-hover focus:border-accent/40"
            />
            <label className="text-xs text-text-subtle">Até</label>
            <input
              type="date"
              value={currentDateTo ?? ''}
              onChange={(e) => handleDateChange('date_to', e.target.value)}
              className="h-8 rounded-lg border border-border-default bg-surface-2 px-2.5 text-xs text-text-primary outline-none transition-colors hover:border-border-hover focus:border-accent/40"
            />
          </div>
        </div>
      </motion.div>

      {/* Appointment cards */}
      {appointments.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
          className="flex flex-col items-center justify-center py-24"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2">
            <CalendarDays className="h-8 w-8 text-text-subtle/50" />
          </div>
          <p className="mt-4 font-title text-lg font-semibold text-text-muted">
            Nenhum agendamento encontrado
          </p>
          <p className="mt-1 text-sm text-text-subtle">
            Os agendamentos criados pelos seus agentes aparecerão aqui
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {appointments.map((apt) => {
            const confirmed = apt.status === 'confirmed'
            return (
              <motion.button
                key={apt.id}
                variants={fadeInUp}
                transition={{
                  duration: MOTION.duration.normal,
                  ease: MOTION.ease.out,
                }}
                onClick={() => setSelected(apt)}
                className="card-surface card-surface-interactive relative overflow-hidden text-left"
              >
                {/* Status accent bar */}
                <div
                  className={cn(
                    'absolute inset-y-0 left-0 w-0.5',
                    confirmed ? 'bg-success' : 'bg-danger',
                  )}
                />

                <div className="p-4 pl-5">
                  {/* Top: status + date */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold',
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

                  {/* Lead + service */}
                  <p className="mt-3 text-sm font-semibold text-text-primary">
                    {apt.leadName}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    {apt.serviceType}
                  </p>

                  {/* Time */}
                  <p className="mt-2 text-xs tabular-nums text-text-subtle">
                    {apt.startTime.slice(0, 5)} – {apt.endTime.slice(0, 5)}
                  </p>
                </div>
              </motion.button>
            )
          })}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: MOTION.duration.normal }}
          className="mt-8 flex items-center justify-center gap-4"
        >
          <Button
            variant="ghost"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => handlePageChange(pagination.page - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <span className="text-xs tabular-nums text-text-muted">
            {pagination.page} de {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            disabled={pagination.page >= totalPages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Próximo
            <ChevronRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}

      {/* Detail modal */}
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
                {/* Header */}
                <div className="flex items-start justify-between">
                  <Dialog.Title className="font-title text-lg font-semibold text-text-primary">
                    Detalhes do agendamento
                  </Dialog.Title>
                  <Dialog.Close className="flex h-7 w-7 items-center justify-center rounded-lg text-text-subtle transition-colors hover:bg-surface-2 hover:text-text-primary">
                    <X className="h-4 w-4" />
                  </Dialog.Close>
                </div>

                {/* Fields */}
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

                {/* Actions */}
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
