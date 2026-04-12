'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Plus, FileText, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MOTION } from '@/lib/motion'
import { formatDate } from '@/lib/format'
import { markInvoicePaid, cancelInvoice } from '../actions'
import type { Invoice, Pagination } from '@/lib/services/interfaces/finance-service'

// ── Formatting ──

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

// ── Status badge ──

const STATUS_CONFIG: Record<
  Invoice['status'],
  { label: string; className: string }
> = {
  pending: {
    label: 'Pendente',
    className: 'bg-yellow-500/10 text-yellow-500 ring-1 ring-yellow-500/20',
  },
  sent: {
    label: 'Enviado',
    className: 'bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20',
  },
  paid: {
    label: 'Pago',
    className: 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20',
  },
  overdue: {
    label: 'Vencido',
    className: 'bg-red-500/10 text-red-400 ring-1 ring-red-500/20',
  },
  cancelled: {
    label: 'Cancelado',
    className: 'bg-text-subtle/10 text-text-subtle ring-1 ring-text-subtle/20',
  },
}

function StatusBadge({ status }: { status: Invoice['status'] }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${cfg.className}`}
    >
      {cfg.label}
    </span>
  )
}

// ── Type badge ──

const TYPE_CONFIG: Record<
  Invoice['type'],
  { label: string; className: string }
> = {
  service: {
    label: 'Serviço',
    className: 'bg-teal-500/10 text-teal-400 ring-1 ring-teal-500/20',
  },
  product: {
    label: 'Produto',
    className: 'bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20',
  },
  manual: {
    label: 'Manual',
    className: 'bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20',
  },
}

function TypeBadge({ type }: { type: Invoice['type'] }) {
  const cfg = TYPE_CONFIG[type]
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${cfg.className}`}
    >
      {cfg.label}
    </span>
  )
}

// ── Component ──

interface InvoicesTableProps {
  invoices: Invoice[]
  pagination: Pagination
  currentStatus?: string
  currentType?: string
}

const ACTIONABLE_STATUSES: Invoice['status'][] = ['pending', 'sent', 'overdue']

export function InvoicesTable({
  invoices,
  pagination,
  currentStatus,
  currentType,
}: InvoicesTableProps) {
  const router = useRouter()
  const [actionError, setActionError] = useState<string | null>(null)
  const [isPaying, startPay] = useTransition()
  const [isCancelling, startCancel] = useTransition()
  const [processingId, setProcessingId] = useState<string | null>(null)

  const totalPages = Math.ceil(pagination.total / pagination.limit)

  // ── Navigation ──

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams()
    const merged = {
      status: currentStatus,
      type: currentType,
      ...overrides,
    }
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    const qs = params.toString()
    return `/cobrancas${qs ? `?${qs}` : ''}`
  }

  function handleStatusChange(value: string) {
    router.push(buildUrl({ status: value || undefined, page: undefined }))
  }

  function handleTypeChange(value: string) {
    router.push(buildUrl({ type: value || undefined, page: undefined }))
  }

  function handlePageChange(page: number) {
    router.push(buildUrl({ page: page > 1 ? String(page) : undefined }))
  }

  // ── Actions ──

  function handleMarkPaid(id: string) {
    setActionError(null)
    setProcessingId(id)
    startPay(async () => {
      const result = await markInvoicePaid(id)
      if (result.success) {
        router.refresh()
      } else {
        setActionError(result.error ?? 'Erro ao marcar como pago.')
      }
      setProcessingId(null)
    })
  }

  function handleCancel(id: string) {
    setActionError(null)
    setProcessingId(id)
    startCancel(async () => {
      const result = await cancelInvoice(id)
      if (result.success) {
        router.refresh()
      } else {
        setActionError(result.error ?? 'Erro ao cancelar cobrança.')
      }
      setProcessingId(null)
    })
  }

  const isProcessing = isPaying || isCancelling

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
            Cobranças
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Gerencie as cobranças dos seus clientes
          </p>
        </div>
        <Link href="/cobrancas/nova">
          <Button className="h-9 gap-1.5 rounded-xl bg-accent px-4 text-sm font-semibold text-primary-foreground shadow-[0_0_16px_rgba(212,130,10,0.12)] transition-all hover:brightness-110">
            <Plus className="h-4 w-4" />
            Nova Cobrança
          </Button>
        </Link>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.08 }}
        className="mt-6 flex flex-wrap gap-3"
      >
        <select
          value={currentStatus ?? ''}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="h-9 rounded-xl border border-border-default bg-surface-1 px-3 text-sm text-text-primary outline-none transition-colors hover:border-border-hover focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
        >
          <option value="">Todos os status</option>
          <option value="pending">Pendente</option>
          <option value="sent">Enviado</option>
          <option value="paid">Pago</option>
          <option value="overdue">Vencido</option>
          <option value="cancelled">Cancelado</option>
        </select>

        <select
          value={currentType ?? ''}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="h-9 rounded-xl border border-border-default bg-surface-1 px-3 text-sm text-text-primary outline-none transition-colors hover:border-border-hover focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
        >
          <option value="">Todos os tipos</option>
          <option value="service">Serviço</option>
          <option value="product">Produto</option>
          <option value="manual">Manual</option>
        </select>
      </motion.div>

      {/* Error banner */}
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
            <FileText className="h-8 w-8 text-text-subtle/50" />
          </div>
          <p className="mt-4 font-title text-lg font-semibold text-text-muted">
            Nenhuma cobrança encontrada
          </p>
          <p className="mt-1 text-sm text-text-subtle">
            {currentStatus || currentType
              ? 'Tente outros filtros'
              : 'Crie sua primeira cobrança clicando em "Nova Cobrança"'}
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.12 }}
          className="mt-6 overflow-hidden rounded-xl border border-border-default"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border-default bg-surface-1">
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
                    Descrição
                  </th>
                  <th className="hidden px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-subtle sm:table-cell">
                    Lead
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
                    Tipo
                  </th>
                  <th className="hidden px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-text-subtle md:table-cell">
                    Valor Original
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
                    Valor Final
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
                    Status
                  </th>
                  <th className="hidden px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-subtle lg:table-cell">
                    Vencimento
                  </th>
                  <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => {
                  const isActionable = (ACTIONABLE_STATUSES as string[]).includes(invoice.status)
                  const isThisProcessing = processingId === invoice.id && isProcessing

                  return (
                    <tr
                      key={invoice.id}
                      className="border-b border-border-default/50 transition-colors last:border-b-0 hover:bg-[rgba(255,255,255,0.02)]"
                    >
                      <td className="max-w-[200px] truncate px-4 py-3.5 text-sm font-medium text-text-primary">
                        {invoice.description}
                      </td>
                      <td className="hidden px-4 py-3.5 sm:table-cell">
                        <span className="rounded-md bg-surface-2 px-1.5 py-0.5 font-mono text-[11px] text-text-subtle">
                          {invoice.leadId.slice(0, 8)}…
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <TypeBadge type={invoice.type} />
                      </td>
                      <td className="hidden px-4 py-3.5 text-right text-sm tabular-nums text-text-muted md:table-cell">
                        {formatCurrency(invoice.amount)}
                      </td>
                      <td className="px-4 py-3.5 text-right text-sm font-medium tabular-nums text-text-primary">
                        {formatCurrency(invoice.finalAmount)}
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={invoice.status} />
                      </td>
                      <td className="hidden px-4 py-3.5 text-sm text-text-muted lg:table-cell">
                        {formatDate(invoice.dueDate)}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        {isActionable ? (
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isThisProcessing}
                              onClick={() => handleMarkPaid(invoice.id)}
                              className="h-7 rounded-lg px-2 text-xs text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-400 disabled:opacity-50"
                            >
                              {isThisProcessing && isPaying ? (
                                <span className="h-3 w-3 animate-spin rounded-full border-2 border-emerald-400/30 border-t-emerald-400" />
                              ) : (
                                'Marcar Pago'
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={isThisProcessing}
                              onClick={() => handleCancel(invoice.id)}
                              className="h-7 rounded-lg px-2 text-xs text-text-subtle hover:bg-danger/10 hover:text-danger disabled:opacity-50"
                            >
                              {isThisProcessing && isCancelling ? (
                                <span className="h-3 w-3 animate-spin rounded-full border-2 border-danger/30 border-t-danger" />
                              ) : (
                                'Cancelar'
                              )}
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-text-subtle">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
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
