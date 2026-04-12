'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Dialog } from '@base-ui/react/dialog'
import {
  Plus,
  Pencil,
  X,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MOTION } from '@/lib/motion'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { createSubscription, updateSubscription } from '../actions'
import type {
  Subscription,
  Pagination,
} from '@/lib/services/interfaces/finance-service'

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

const STATUS_LABELS: Record<Subscription['status'], string> = {
  active: 'Ativa',
  suspended: 'Suspensa',
  cancelled: 'Cancelada',
}

const STATUS_CLASSES: Record<Subscription['status'], string> = {
  active: 'bg-emerald/10 text-emerald',
  suspended: 'bg-gold/10 text-gold',
  cancelled: 'bg-danger/10 text-danger',
}

const STATUS_OPTIONS: Array<{ value: Subscription['status']; label: string }> =
  [
    { value: 'active', label: 'Ativa' },
    { value: 'suspended', label: 'Suspensa' },
    { value: 'cancelled', label: 'Cancelada' },
  ]

interface SubscriptionsTableProps {
  subscriptions: Subscription[]
  pagination: Pagination
  currentStatus?: string
}

export function SubscriptionsTable({
  subscriptions,
  pagination,
  currentStatus,
}: SubscriptionsTableProps) {
  const router = useRouter()

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null)
  const [formUserId, setFormUserId] = useState('')
  const [formPlanId, setFormPlanId] = useState('')
  const [formBillingDay, setFormBillingDay] = useState('')
  const [formStatus, setFormStatus] =
    useState<Subscription['status']>('active')
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, startSave] = useTransition()

  const totalPages = Math.ceil(pagination.total / pagination.limit)

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams()
    const merged = { status: currentStatus, ...overrides }
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    const qs = params.toString()
    return `/admin/assinaturas${qs ? `?${qs}` : ''}`
  }

  function handlePageChange(page: number) {
    router.push(buildUrl({ page: page > 1 ? String(page) : undefined }))
  }

  function handleStatusFilter(value: string) {
    router.push(buildUrl({ status: value || undefined, page: undefined }))
  }

  function openCreate() {
    setEditingSubscription(null)
    setFormUserId('')
    setFormPlanId('')
    setFormBillingDay('')
    setFormStatus('active')
    setFormError(null)
    setModalOpen(true)
  }

  function openEdit(sub: Subscription) {
    setEditingSubscription(sub)
    setFormPlanId(sub.planId)
    setFormBillingDay(String(sub.billingDay))
    setFormStatus(sub.status)
    setFormError(null)
    setModalOpen(true)
  }

  function handleSave() {
    const billingDay = parseInt(formBillingDay, 10)

    if (isNaN(billingDay) || billingDay < 1 || billingDay > 28) {
      setFormError('Dia de vencimento deve ser entre 1 e 28.')
      return
    }

    if (editingSubscription) {
      const planId = formPlanId.trim()
      if (!planId) {
        setFormError('ID do plano é obrigatório.')
        return
      }
      setFormError(null)
      startSave(async () => {
        const result = await updateSubscription(editingSubscription.id, {
          planId,
          billingDay,
          status: formStatus,
        })
        if (result.success) {
          setModalOpen(false)
          router.refresh()
        } else {
          setFormError(result.error ?? 'Erro ao salvar.')
        }
      })
    } else {
      const userId = formUserId.trim()
      const planId = formPlanId.trim()
      if (!userId) {
        setFormError('ID do usuário é obrigatório.')
        return
      }
      if (!planId) {
        setFormError('ID do plano é obrigatório.')
        return
      }
      setFormError(null)
      startSave(async () => {
        const result = await createSubscription({ userId, planId, billingDay })
        if (result.success) {
          setModalOpen(false)
          router.refresh()
        } else {
          setFormError(result.error ?? 'Erro ao salvar.')
        }
      })
    }
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
            Assinaturas
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Gerencie as assinaturas dos usuários
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="h-9 gap-1.5 rounded-xl bg-accent px-4 text-sm font-semibold text-primary-foreground shadow-[0_0_16px_rgba(212,130,10,0.12)] transition-all hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          Nova Assinatura
        </Button>
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
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </motion.div>

      {/* Table */}
      {subscriptions.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: MOTION.duration.slow }}
          className="flex flex-col items-center justify-center py-24"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2">
            <Users className="h-8 w-8 text-text-subtle/50" />
          </div>
          <p className="mt-4 font-title text-lg font-semibold text-text-muted">
            Nenhuma assinatura encontrada
          </p>
          <p className="mt-1 text-sm text-text-subtle">
            {currentStatus
              ? 'Tente outro filtro de status'
              : 'Crie a primeira assinatura clicando em "Nova Assinatura"'}
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
                <th className="hidden px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-subtle sm:table-cell">
                  Plano
                </th>
                <th className="hidden px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-subtle md:table-cell">
                  Valor
                </th>
                <th className="hidden px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-subtle lg:table-cell">
                  Dia Vcto
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
                  Status
                </th>
                <th className="hidden px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-subtle xl:table-cell">
                  Período
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.map((sub) => (
                <tr
                  key={sub.id}
                  className="border-b border-border-default/50 transition-colors last:border-b-0 hover:bg-[rgba(255,255,255,0.02)]"
                >
                  <td className="px-4 py-3.5">
                    <p className="text-sm font-medium text-text-primary">
                      {sub.userName ?? '—'}
                    </p>
                    <p className="text-xs text-text-subtle">
                      {sub.userEmail ?? sub.userId}
                    </p>
                  </td>
                  <td className="hidden px-4 py-3.5 text-sm text-text-muted sm:table-cell">
                    {sub.planName ?? sub.planId}
                  </td>
                  <td className="hidden px-4 py-3.5 text-sm tabular-nums text-text-muted md:table-cell">
                    {sub.planCost !== null ? formatBRL(sub.planCost) : '—'}
                  </td>
                  <td className="hidden px-4 py-3.5 text-sm tabular-nums text-text-muted lg:table-cell">
                    Dia {sub.billingDay}
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold',
                        STATUS_CLASSES[sub.status],
                      )}
                    >
                      {STATUS_LABELS[sub.status]}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3.5 text-xs text-text-subtle xl:table-cell">
                    {formatDate(sub.currentPeriodStart)} →{' '}
                    {formatDate(sub.currentPeriodEnd)}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => openEdit(sub)}
                      className="text-text-subtle hover:text-text-primary"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
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

      {/* Create/Edit Modal */}
      <Dialog.Root
        open={modalOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen && !isSaving) setModalOpen(false)
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none">
            <div className="card-glass w-full max-w-sm p-6">
              <div className="flex items-start justify-between">
                <Dialog.Title className="font-title text-lg font-semibold text-text-primary">
                  {editingSubscription
                    ? 'Editar Assinatura'
                    : 'Nova Assinatura'}
                </Dialog.Title>
                <Dialog.Close
                  disabled={isSaving}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-text-subtle transition-colors hover:bg-surface-2 hover:text-text-primary disabled:pointer-events-none"
                >
                  <X className="h-4 w-4" />
                </Dialog.Close>
              </div>

              <div className="mt-5 space-y-4">
                {!editingSubscription && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-muted">
                      ID do Usuário (UUID)
                    </label>
                    <input
                      type="text"
                      value={formUserId}
                      onChange={(e) => setFormUserId(e.target.value)}
                      placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                      className="h-10 w-full rounded-xl border border-border-default bg-surface-2 px-3 text-sm text-text-primary outline-none placeholder:text-text-subtle transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-muted">
                    ID do Plano (UUID)
                  </label>
                  <input
                    type="text"
                    value={formPlanId}
                    onChange={(e) => setFormPlanId(e.target.value)}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                    className="h-10 w-full rounded-xl border border-border-default bg-surface-2 px-3 text-sm text-text-primary outline-none placeholder:text-text-subtle transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-muted">
                    Dia de Vencimento (1–28)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    value={formBillingDay}
                    onChange={(e) => setFormBillingDay(e.target.value)}
                    placeholder="Ex: 10"
                    className="h-10 w-full rounded-xl border border-border-default bg-surface-2 px-3 text-sm tabular-nums text-text-primary outline-none placeholder:text-text-subtle transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
                  />
                </div>

                {editingSubscription && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-muted">
                      Status
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) =>
                        setFormStatus(e.target.value as Subscription['status'])
                      }
                      className="h-10 w-full rounded-xl border border-border-default bg-surface-2 px-3 text-sm text-text-primary outline-none transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {formError && (
                <div className="mt-4 rounded-lg bg-danger/8 px-3 py-2.5">
                  <p className="text-sm text-danger">{formError}</p>
                </div>
              )}

              <div className="mt-6 flex justify-end gap-2">
                <Dialog.Close
                  disabled={isSaving}
                  className="inline-flex h-9 items-center rounded-xl px-4 text-sm font-medium text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary disabled:pointer-events-none disabled:opacity-50"
                >
                  Cancelar
                </Dialog.Close>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="h-9 rounded-xl bg-accent px-4 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
                >
                  {isSaving ? (
                    <span className="flex items-center gap-1.5">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                      Salvando...
                    </span>
                  ) : (
                    'Salvar'
                  )}
                </Button>
              </div>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
