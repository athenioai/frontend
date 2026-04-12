'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import {
  Receipt,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MOTION } from '@/lib/motion'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { markAdminInvoicePaid, cancelAdminInvoice } from '../actions'
import type {
  AdminInvoice,
  Pagination,
} from '@/lib/services/interfaces/finance-service'

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const STATUS_LABELS: Record<AdminInvoice['status'], string> = {
  pending: 'Pendente',
  paid: 'Pago',
  overdue: 'Vencido',
  cancelled: 'Cancelado',
}

const STATUS_CLASSES: Record<AdminInvoice['status'], string> = {
  pending: 'bg-gold/10 text-gold',
  paid: 'bg-emerald/10 text-emerald',
  overdue: 'bg-danger/10 text-danger',
  cancelled: 'bg-surface-2 text-text-subtle',
}

const STATUS_OPTIONS: Array<{ value: AdminInvoice['status'] | ''; label: string }> =
  [
    { value: '', label: 'Todos os status' },
    { value: 'pending', label: 'Pendente' },
    { value: 'paid', label: 'Pago' },
    { value: 'overdue', label: 'Vencido' },
    { value: 'cancelled', label: 'Cancelado' },
  ]

interface AdminInvoicesTableProps {
  invoices: AdminInvoice[]
  pagination: Pagination
  currentStatus?: string
}

export function AdminInvoicesTable({
  invoices,
  pagination,
  currentStatus,
}: AdminInvoicesTableProps) {
  const router = useRouter()
  const [actionError, setActionError] = useState<string | null>(null)
  const [isPending, startAction] = useTransition()

  const totalPages = Math.ceil(pagination.total / pagination.limit)

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams()
    const merged = { status: currentStatus, ...overrides }
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    const qs = params.toString()
    return `/admin/faturas${qs ? `?${qs}` : ''}`
  }

  function handlePageChange(page: number) {
    router.push(buildUrl({ page: page > 1 ? String(page) : undefined }))
  }

  function handleStatusFilter(value: string) {
    router.push(buildUrl({ status: value || undefined, page: undefined }))
  }

  function handleMarkPaid(id: string) {
    setActionError(null)
    startAction(async () => {
      const result = await markAdminInvoicePaid(id)
      if (result.success) {
        router.refresh()
      } else {
        setActionError(result.error ?? 'Erro ao processar ação.')
      }
    })
  }

  function handleCancel(id: string) {
    setActionError(null)
    startAction(async () => {
      const result = await cancelAdminInvoice(id)
      if (result.success) {
        router.refresh()
      } else {
        setActionError(result.error ?? 'Erro ao processar ação.')
      }
    })
  }

  return (
    <>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-title text-2xl font-bold text-text-primary">
            Faturas
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Gerencie as faturas de assinaturas
          </p>
        </div>
      </motion.div>

      {/* Filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.08 }}
        className="mt-6"
      >
        <select
          value={currentStatus ?? ''}
          onChange={(e) => handleStatusFilter(e.target.value)}
          className="h-10 rounded-xl border border-border-default bg-surface-1 px-3 text-sm text-text-primary outline-none transition-colors hover:border-border-hover focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </motion.div>

      {actionError && (
        <div className="mt-4 rounded-lg bg-danger/8 px-3 py-2.5">
          <p className="text-sm text-danger">{actionError}</p>
        </div>
      )}

      {/* Table */}
      {invoices.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: MOTION.duration.slow }}
          className="flex flex-col items-center justify-center py-24"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2">
            <Receipt className="h-8 w-8 text-text-subtle/50" />
          </div>
          <p className="mt-4 font-title text-lg font-semibold text-text-muted">
            Nenhuma fatura encontrada
          </p>
          <p className="mt-1 text-sm text-text-subtle">
            {currentStatus ? 'Tente outro filtro de status' : 'As faturas aparecerão aqui'}
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.12 }}
          className="mt-6 overflow-hidden rounded-xl border border-border-default"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-default bg-surface-1">
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
                  Usuário
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
                  Valor
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
                  Status
                </th>
                <th className="hidden px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-subtle sm:table-cell">
                  Vencimento
                </th>
                <th className="hidden px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-subtle md:table-cell">
                  Pago em
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => {
                const canMarkPaid = invoice.status === 'pending' || invoice.status === 'overdue'
                const canCancel = invoice.status === 'pending' || invoice.status === 'overdue'

                return (
                  <tr
                    key={invoice.id}
                    className="border-b border-border-default/50 transition-colors last:border-b-0 hover:bg-[rgba(255,255,255,0.02)]"
                  >
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-text-primary">
                        {invoice.userName ?? '—'}
                      </p>
                      <p className="text-xs text-text-subtle">
                        {invoice.userId}
                      </p>
                    </td>
                    <td className="px-4 py-3.5 text-sm tabular-nums font-semibold text-text-primary">
                      {formatBRL(invoice.amount)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold',
                          STATUS_CLASSES[invoice.status],
                        )}
                      >
                        {STATUS_LABELS[invoice.status]}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3.5 text-sm text-text-muted sm:table-cell">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="hidden px-4 py-3.5 text-sm text-text-muted md:table-cell">
                      {invoice.paidAt ? formatDate(invoice.paidAt) : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {canMarkPaid && (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            disabled={isPending}
                            onClick={() => handleMarkPaid(invoice.id)}
                            title="Marcar como pago"
                            className="text-text-subtle hover:bg-emerald/10 hover:text-emerald"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        {canCancel && (
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            disabled={isPending}
                            onClick={() => handleCancel(invoice.id)}
                            title="Cancelar fatura"
                            className="text-text-subtle hover:bg-danger/10 hover:text-danger"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-4">
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
        </div>
      )}
    </>
  )
}
