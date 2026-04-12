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
  Package,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MOTION } from '@/lib/motion'
import { createProduct, updateProduct, deleteProduct } from '../actions'
import type { Product, Pagination } from '@/lib/services/interfaces/finance-service'

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatPercent(value: number): string {
  return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%`
}

interface ProductsTableProps {
  products: Product[]
  pagination: Pagination
  currentSearch?: string
}

export function ProductsTable({
  products,
  pagination,
  currentSearch,
}: ProductsTableProps) {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState(currentSearch ?? '')

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formPixDiscount, setFormPixDiscount] = useState('')
  const [formCardDiscount, setFormCardDiscount] = useState('')
  const [formActive, setFormActive] = useState(true)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, startSave] = useTransition()

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
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
    return `/catalogo${qs ? `?${qs}` : ''}`
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
    setEditingProduct(null)
    setFormName('')
    setFormDescription('')
    setFormPrice('')
    setFormPixDiscount('0')
    setFormCardDiscount('0')
    setFormActive(true)
    setFormError(null)
    setModalOpen(true)
  }

  function openEdit(product: Product) {
    setEditingProduct(product)
    setFormName(product.name)
    setFormDescription(product.description ?? '')
    setFormPrice(String(product.price))
    setFormPixDiscount(String(product.pixDiscountPercent))
    setFormCardDiscount(String(product.cardDiscountPercent))
    setFormActive(product.active)
    setFormError(null)
    setModalOpen(true)
  }

  function handleSave() {
    const name = formName.trim()
    const price = parseFloat(formPrice)
    const pixDiscount = parseFloat(formPixDiscount)
    const cardDiscount = parseFloat(formCardDiscount)

    if (!name) {
      setFormError('Nome é obrigatório.')
      return
    }
    if (isNaN(price) || price < 0) {
      setFormError('Preço deve ser um valor válido.')
      return
    }
    if (isNaN(pixDiscount) || pixDiscount < 0 || pixDiscount > 100) {
      setFormError('Desconto PIX deve estar entre 0 e 100.')
      return
    }
    if (isNaN(cardDiscount) || cardDiscount < 0 || cardDiscount > 100) {
      setFormError('Desconto Cartão deve estar entre 0 e 100.')
      return
    }

    setFormError(null)

    startSave(async () => {
      const result = editingProduct
        ? await updateProduct(editingProduct.id, {
            name,
            description: formDescription.trim() || undefined,
            price: Math.round(price * 100) / 100,
            pixDiscountPercent: Math.round(pixDiscount * 100) / 100,
            cardDiscountPercent: Math.round(cardDiscount * 100) / 100,
            active: formActive,
          })
        : await createProduct({
            name,
            description: formDescription.trim() || undefined,
            price: Math.round(price * 100) / 100,
            pixDiscountPercent: Math.round(pixDiscount * 100) / 100,
            cardDiscountPercent: Math.round(cardDiscount * 100) / 100,
          })

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
    setDeleteError(null)
    startDelete(async () => {
      const result = await deleteProduct(deleteTarget.id)
      if (result.success) {
        setDeleteTarget(null)
        router.refresh()
      } else {
        setDeleteError(result.error ?? 'Erro ao deletar.')
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
            Produtos
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Gerencie o catálogo de produtos
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="h-9 gap-1.5 rounded-xl bg-accent px-4 text-sm font-semibold text-primary-foreground shadow-[0_0_16px_rgba(212,130,10,0.12)] transition-all hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          Novo Produto
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
      {products.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: MOTION.duration.slow }}
          className="flex flex-col items-center justify-center py-24"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2">
            <Package className="h-8 w-8 text-text-subtle/50" />
          </div>
          <p className="mt-4 font-title text-lg font-semibold text-text-muted">
            Nenhum produto encontrado
          </p>
          <p className="mt-1 text-sm text-text-subtle">
            {currentSearch
              ? 'Tente uma busca diferente'
              : 'Crie seu primeiro produto clicando em "Novo Produto"'}
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
                  Preço (R$)
                </th>
                <th className="hidden px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-subtle md:table-cell">
                  Desconto PIX (%)
                </th>
                <th className="hidden px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-subtle lg:table-cell">
                  Desconto Cartão (%)
                </th>
                <th className="hidden px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-subtle sm:table-cell">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-border-default/50 transition-colors last:border-b-0 hover:bg-[rgba(255,255,255,0.02)]"
                >
                  <td className="px-4 py-3.5 text-sm font-medium text-text-primary">
                    {product.name}
                  </td>
                  <td className="px-4 py-3.5 text-sm tabular-nums text-text-muted">
                    {formatCurrency(product.price)}
                  </td>
                  <td className="hidden px-4 py-3.5 text-sm tabular-nums text-text-muted md:table-cell">
                    {formatPercent(product.pixDiscountPercent)}
                  </td>
                  <td className="hidden px-4 py-3.5 text-sm tabular-nums text-text-muted lg:table-cell">
                    {formatPercent(product.cardDiscountPercent)}
                  </td>
                  <td className="hidden px-4 py-3.5 sm:table-cell">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        product.active
                          ? 'bg-emerald/10 text-emerald'
                          : 'bg-surface-2 text-text-subtle'
                      }`}
                    >
                      {product.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => openEdit(product)}
                        className="text-text-subtle hover:text-text-primary"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => setDeleteTarget(product)}
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
                  {editingProduct ? 'Editar Produto' : 'Novo Produto'}
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
                    placeholder="Ex: Produto Premium"
                    maxLength={255}
                    className="h-10 w-full rounded-xl border border-border-default bg-surface-2 px-3 text-sm text-text-primary outline-none placeholder:text-text-subtle transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-muted">
                    Descrição (opcional)
                  </label>
                  <input
                    type="text"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Descrição do produto"
                    maxLength={500}
                    className="h-10 w-full rounded-xl border border-border-default bg-surface-2 px-3 text-sm text-text-primary outline-none placeholder:text-text-subtle transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-muted">
                    Preço (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="999999.99"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="0,00"
                    className="h-10 w-full rounded-xl border border-border-default bg-surface-2 px-3 text-sm tabular-nums text-text-primary outline-none placeholder:text-text-subtle transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-muted">
                      Desconto PIX (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formPixDiscount}
                      onChange={(e) => setFormPixDiscount(e.target.value)}
                      placeholder="0"
                      className="h-10 w-full rounded-xl border border-border-default bg-surface-2 px-3 text-sm tabular-nums text-text-primary outline-none placeholder:text-text-subtle transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-text-muted">
                      Desconto Cartão (%)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={formCardDiscount}
                      onChange={(e) => setFormCardDiscount(e.target.value)}
                      placeholder="0"
                      className="h-10 w-full rounded-xl border border-border-default bg-surface-2 px-3 text-sm tabular-nums text-text-primary outline-none placeholder:text-text-subtle transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
                    />
                  </div>
                </div>

                {editingProduct && (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={formActive}
                      onClick={() => setFormActive((prev) => !prev)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none ${
                        formActive ? 'bg-accent' : 'bg-surface-2'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                          formActive ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <label className="text-xs font-medium text-text-muted">
                      {formActive ? 'Ativo' : 'Inativo'}
                    </label>
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
                    Deletar produto
                  </Dialog.Title>
                  <Dialog.Description className="mt-1 text-sm text-text-muted">
                    Tem certeza que deseja deletar o produto{' '}
                    <strong className="text-text-primary">
                      {deleteTarget?.name}
                    </strong>
                    ? Essa ação não pode ser desfeita.
                  </Dialog.Description>
                </div>
              </div>

              {deleteError && (
                <div className="mt-4 rounded-lg bg-danger/8 px-3 py-2.5">
                  <p className="text-sm text-danger">{deleteError}</p>
                </div>
              )}

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
