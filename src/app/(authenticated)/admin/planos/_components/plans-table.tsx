'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Dialog } from '@base-ui/react/dialog'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  AlertTriangle,
  CreditCard,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MOTION } from '@/lib/motion'
import { formatDate } from '@/lib/format'
import { createPlan, updatePlan, deletePlan } from '../actions'
import type { Plan, PlanPagination } from '@/lib/services/interfaces/plan-service'

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface PlansTableProps {
  plans: Plan[]
  pagination: PlanPagination
  currentSearch?: string
}

export function PlansTable({
  plans,
  pagination,
  currentSearch,
}: PlansTableProps) {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState(currentSearch ?? '')

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [formName, setFormName] = useState('')
  const [formCost, setFormCost] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, startSave] = useTransition()

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null)
  const [isDeleting, startDelete] = useTransition()

  const totalPages = Math.ceil(pagination.total / pagination.limit)

  // ── Navigation ──

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams()
    const merged = { search: currentSearch, ...overrides }
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    const qs = params.toString()
    return `/admin/planos${qs ? `?${qs}` : ''}`
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    router.push(buildUrl({ search: searchValue.trim() || undefined, page: undefined }))
  }

  function handlePageChange(page: number) {
    router.push(buildUrl({ page: page > 1 ? String(page) : undefined }))
  }

  // ── Modal ──

  function openCreate() {
    setEditingPlan(null)
    setFormName('')
    setFormCost('')
    setFormError(null)
    setModalOpen(true)
  }

  function openEdit(plan: Plan) {
    setEditingPlan(plan)
    setFormName(plan.name)
    setFormCost(String(plan.cost))
    setFormError(null)
    setModalOpen(true)
  }

  function handleSave() {
    const name = formName.trim()
    const cost = parseFloat(formCost)

    if (!name) {
      setFormError('Nome é obrigatório.')
      return
    }
    if (isNaN(cost) || cost < 0) {
      setFormError('Custo deve ser um valor válido.')
      return
    }

    setFormError(null)

    startSave(async () => {
      const result = editingPlan
        ? await updatePlan(editingPlan.id, { name, cost: Math.round(cost * 100) / 100 })
        : await createPlan({ name, cost: Math.round(cost * 100) / 100 })

      if (result.success) {
        setModalOpen(false)
        router.refresh()
      } else {
        setFormError(result.error ?? 'Erro ao salvar.')
      }
    })
  }

  // ── Delete ──

  function handleDelete() {
    if (!deleteTarget) return
    startDelete(async () => {
      const result = await deletePlan(deleteTarget.id)
      if (result.success) {
        setDeleteTarget(null)
        router.refresh()
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
            Planos
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Gerencie os planos do sistema
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="h-9 gap-1.5 rounded-xl bg-accent px-4 text-sm font-semibold text-primary-foreground shadow-[0_0_16px_rgba(79,209,197,0.12)] transition-all hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          Novo Plano
        </Button>
      </motion.div>

      {/* Search */}
      <motion.form
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.08 }}
        onSubmit={handleSearch}
        className="mt-6"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Buscar por nome..."
            className="h-10 w-full rounded-xl border border-border-default bg-surface-1 pl-10 pr-4 text-sm text-text-primary outline-none placeholder:text-text-subtle transition-colors hover:border-border-hover focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
          />
        </div>
      </motion.form>

      {/* Table */}
      {plans.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: MOTION.duration.slow }}
          className="flex flex-col items-center justify-center py-24"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2">
            <CreditCard className="h-8 w-8 text-text-subtle/50" />
          </div>
          <p className="mt-4 font-title text-lg font-semibold text-text-muted">
            Nenhum plano encontrado
          </p>
          <p className="mt-1 text-sm text-text-subtle">
            {currentSearch
              ? 'Tente uma busca diferente'
              : 'Crie seu primeiro plano clicando em "Novo Plano"'}
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
                  Nome
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
                  Custo
                </th>
                <th className="hidden px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-subtle sm:table-cell">
                  Criado em
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr
                  key={plan.id}
                  className="border-b border-border-default/50 transition-colors last:border-b-0 hover:bg-[rgba(255,255,255,0.02)]"
                >
                  <td className="px-4 py-3.5 text-sm font-medium text-text-primary">
                    {plan.name}
                  </td>
                  <td className="px-4 py-3.5 text-sm tabular-nums text-text-muted">
                    {formatCurrency(plan.cost)}
                  </td>
                  <td className="hidden px-4 py-3.5 text-sm text-text-subtle sm:table-cell">
                    {formatDate(plan.createdAt)}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => openEdit(plan)}
                        className="text-text-subtle hover:text-text-primary"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setDeleteTarget(plan)}
                        className="text-text-subtle hover:bg-danger/10 hover:text-danger"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
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

      {/* ── Create/Edit Modal ── */}
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
                  {editingPlan ? 'Editar Plano' : 'Novo Plano'}
                </Dialog.Title>
                <Dialog.Close
                  disabled={isSaving}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-text-subtle transition-colors hover:bg-surface-2 hover:text-text-primary disabled:pointer-events-none"
                >
                  <X className="h-4 w-4" />
                </Dialog.Close>
              </div>

              <div className="mt-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-muted">
                    Nome
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Plano Pro"
                    maxLength={255}
                    className="h-10 w-full rounded-xl border border-border-default bg-surface-2 px-3 text-sm text-text-primary outline-none placeholder:text-text-subtle transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-muted">
                    Custo (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="999999.99"
                    value={formCost}
                    onChange={(e) => setFormCost(e.target.value)}
                    placeholder="0,00"
                    className="h-10 w-full rounded-xl border border-border-default bg-surface-2 px-3 text-sm tabular-nums text-text-primary outline-none placeholder:text-text-subtle transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
                  />
                </div>
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

      {/* ── Delete Confirmation ── */}
      <Dialog.Root
        open={deleteTarget !== null}
        onOpenChange={(isOpen) => {
          if (!isOpen && !isDeleting) setDeleteTarget(null)
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none">
            <div className="card-glass w-full max-w-sm p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-danger/10">
                  <AlertTriangle className="h-5 w-5 text-danger" />
                </div>
                <div>
                  <Dialog.Title className="font-title text-base font-semibold text-text-primary">
                    Deletar plano
                  </Dialog.Title>
                  <Dialog.Description className="mt-1 text-sm text-text-muted">
                    Tem certeza que deseja deletar o plano{' '}
                    <strong className="text-text-primary">
                      {deleteTarget?.name}
                    </strong>
                    ? Essa ação não pode ser desfeita.
                  </Dialog.Description>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Dialog.Close
                  disabled={isDeleting}
                  className="inline-flex h-8 items-center rounded-lg px-3 text-sm font-medium text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary disabled:pointer-events-none disabled:opacity-50"
                >
                  Cancelar
                </Dialog.Close>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deletando...' : 'Deletar'}
                </Button>
              </div>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}
