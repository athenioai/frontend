'use client'

import { useState, useRef, useTransition } from 'react'
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
  Wrench,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Tag,
  Upload,
  Bot,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MOTION } from '@/lib/motion'
import { createService, updateService, deleteService } from '../actions'
import type { Service, Pagination } from '@/lib/services/interfaces/finance-service'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

function formatPercent(value: number): string {
  return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%`
}

interface ServicesTableProps {
  services: Service[]
  pagination: Pagination
  currentSearch?: string
}

export function ServicesTable({
  services,
  pagination,
  currentSearch,
}: ServicesTableProps) {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState(currentSearch ?? '')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formPixDiscount, setFormPixDiscount] = useState('')
  const [formCardDiscount, setFormCardDiscount] = useState('')
  const [formSpecialName, setFormSpecialName] = useState('')
  const [formSpecialPercent, setFormSpecialPercent] = useState('0')
  const [formSpecialStartsAt, setFormSpecialStartsAt] = useState('')
  const [formSpecialEndsAt, setFormSpecialEndsAt] = useState('')
  const [formAgentInstructions, setFormAgentInstructions] = useState('')
  const [formImage, setFormImage] = useState<File | null>(null)
  const [formImagePreview, setFormImagePreview] = useState<string | null>(null)
  const [formActive, setFormActive] = useState(true)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSaving, startSave] = useTransition()

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<Service | null>(null)
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
    return `/servicos${qs ? `?${qs}` : ''}`
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    router.push(buildUrl({ search: searchValue.trim() || undefined, page: undefined }))
  }

  function handlePageChange(page: number) {
    router.push(buildUrl({ page: page > 1 ? String(page) : undefined }))
  }

  // ── Image handling ──

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setFormError('Formato de imagem inválido. Use JPEG, PNG ou WebP.')
      return
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setFormError('Imagem muito grande. Máximo 5MB.')
      return
    }

    setFormImage(file)
    setFormImagePreview(URL.createObjectURL(file))
    setFormError(null)
  }

  function clearImage() {
    setFormImage(null)
    if (formImagePreview && !formImagePreview.startsWith('http')) {
      URL.revokeObjectURL(formImagePreview)
    }
    setFormImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── Modal ──

  function openCreate() {
    setEditingService(null)
    setFormName('')
    setFormDescription('')
    setFormPrice('')
    setFormPixDiscount('0')
    setFormCardDiscount('0')
    setFormSpecialName('')
    setFormSpecialPercent('0')
    setFormSpecialStartsAt('')
    setFormSpecialEndsAt('')
    setFormAgentInstructions('')
    setFormImage(null)
    setFormImagePreview(null)
    setFormActive(true)
    setFormError(null)
    setModalOpen(true)
  }

  function openEdit(service: Service) {
    setEditingService(service)
    setFormName(service.name)
    setFormDescription(service.description ?? '')
    setFormPrice(String(service.price))
    setFormPixDiscount(String(service.pixDiscountPercent))
    setFormCardDiscount(String(service.cardDiscountPercent))
    setFormSpecialName(service.specialDiscountName ?? '')
    setFormSpecialPercent(String(service.specialDiscountPercent ?? 0))
    setFormSpecialStartsAt(service.specialDiscountStartsAt ? service.specialDiscountStartsAt.slice(0, 10) : '')
    setFormSpecialEndsAt(service.specialDiscountEndsAt ? service.specialDiscountEndsAt.slice(0, 10) : '')
    setFormAgentInstructions(service.agentInstructions ?? '')
    setFormImage(null)
    setFormImagePreview(service.imageUrl ?? null)
    setFormActive(service.active)
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
    const specialPercent = parseFloat(formSpecialPercent) || 0
    if (specialPercent < 0 || specialPercent > 100) {
      setFormError('Desconto especial deve estar entre 0 e 100.')
      return
    }
    if (formSpecialStartsAt && formSpecialEndsAt && formSpecialStartsAt > formSpecialEndsAt) {
      setFormError('Data de início deve ser anterior à data de fim.')
      return
    }

    setFormError(null)

    const formData = new FormData()
    formData.append('name', name)
    if (formDescription.trim()) formData.append('description', formDescription.trim())
    formData.append('price', String(Math.round(price * 100) / 100))
    formData.append('pixDiscountPercent', String(Math.round(pixDiscount * 100) / 100))
    formData.append('cardDiscountPercent', String(Math.round(cardDiscount * 100) / 100))
    formData.append('specialDiscountName', formSpecialName.trim() || '')
    formData.append('specialDiscountPercent', String(Math.round(specialPercent * 100) / 100))
    formData.append('specialDiscountStartsAt', formSpecialStartsAt ? `${formSpecialStartsAt}T00:00:00Z` : '')
    formData.append('specialDiscountEndsAt', formSpecialEndsAt ? `${formSpecialEndsAt}T23:59:59Z` : '')
    if (formAgentInstructions.trim()) formData.append('agentInstructions', formAgentInstructions.trim())
    if (editingService) formData.append('active', String(formActive))
    if (formImage) formData.append('image', formImage)

    startSave(async () => {
      const result = editingService
        ? await updateService(editingService.id, formData)
        : await createService(formData)

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
      const result = await deleteService(deleteTarget.id)
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
            Serviços
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Gerencie o catálogo de serviços
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="h-9 gap-1.5 rounded-xl bg-accent px-4 text-sm font-semibold text-primary-foreground shadow-[0_0_16px_rgba(212,130,10,0.12)] transition-all hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          Novo Serviço
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

      {/* Catalog Grid */}
      {services.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: MOTION.ease.out }}
          className="mt-16 flex flex-col items-center justify-center"
        >
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-gradient-to-br from-accent/8 to-transparent blur-xl" />
            <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]">
              <Wrench className="h-9 w-9 text-text-subtle/40" />
            </div>
          </div>
          <p className="mt-6 font-title text-xl font-semibold text-text-primary">
            Nenhum serviço encontrado
          </p>
          <p className="mt-2 max-w-[280px] text-center text-sm leading-relaxed text-text-subtle">
            {currentSearch
              ? 'Tente uma busca diferente'
              : 'Comece adicionando seu primeiro serviço ao catálogo'}
          </p>
          {!currentSearch && (
            <Button
              onClick={openCreate}
              className="mt-6 h-10 gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-primary-foreground shadow-[0_2px_12px_rgba(212,130,10,0.2)] transition-all hover:brightness-110"
            >
              <Plus className="h-4 w-4" />
              Criar primeiro serviço
            </Button>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } },
          }}
          className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((service) => {
            const now = new Date()
            const hasSpecial =
              service.specialDiscountPercent > 0 &&
              service.specialDiscountStartsAt &&
              service.specialDiscountEndsAt &&
              now >= new Date(service.specialDiscountStartsAt) &&
              now <= new Date(service.specialDiscountEndsAt)

            const discounts: { label: string; value: string; color: string }[] = []
            if (service.pixDiscountPercent > 0)
              discounts.push({ label: 'PIX', value: formatPercent(service.pixDiscountPercent), color: 'text-emerald' })
            if (service.cardDiscountPercent > 0)
              discounts.push({ label: 'Cartao', value: formatPercent(service.cardDiscountPercent), color: 'text-teal' })

            return (
              <motion.div
                key={service.id}
                variants={{
                  hidden: { opacity: 0, y: 20, scale: 0.98 },
                  visible: { opacity: 1, y: 0, scale: 1 },
                }}
                transition={{ duration: 0.4, ease: MOTION.ease.out }}
                className="group relative"
              >
                <div
                  className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
                    service.active
                      ? 'border-border-default bg-surface-1 shadow-[0_1px_3px_rgba(28,27,24,0.04)] hover:border-accent/20 hover:shadow-[0_8px_40px_rgba(212,130,10,0.06)]'
                      : 'border-border-default/60 bg-surface-2/60'
                  }`}
                >
                  {/* Image thumbnail */}
                  {service.imageUrl && (
                    <div className="relative h-36 w-full overflow-hidden bg-surface-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={service.imageUrl}
                        alt={service.name}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                      {/* Gold accent overlay at bottom */}
                      <div
                        className={`absolute bottom-0 left-0 right-0 h-[3px] transition-all duration-300 ${
                          service.active
                            ? 'bg-gradient-to-r from-accent/70 via-accent to-accent/40 group-hover:from-accent group-hover:via-accent group-hover:to-accent/60'
                            : 'bg-border-default/60'
                        }`}
                      />
                    </div>
                  )}

                  {/* Gold accent bar (only when no image) */}
                  {!service.imageUrl && (
                    <div
                      className={`h-[3px] transition-all duration-300 ${
                        service.active
                          ? 'bg-gradient-to-r from-accent/70 via-accent to-accent/40 group-hover:from-accent group-hover:via-accent group-hover:to-accent/60'
                          : 'bg-border-default/60'
                      }`}
                    />
                  )}

                  {/* Special discount ribbon */}
                  {hasSpecial && service.active && (
                    <div className={`absolute right-0 ${service.imageUrl ? 'top-0' : 'top-[3px]'} overflow-hidden`}>
                      <div className="bg-accent px-3 py-1 text-[10px] font-bold tracking-wide text-white shadow-[0_2px_8px_rgba(212,130,10,0.3)]">
                        {service.specialDiscountName || `${formatPercent(service.specialDiscountPercent)} OFF`}
                      </div>
                    </div>
                  )}

                  <div className="px-5 pb-5 pt-4">
                    {/* Header: name + hover actions */}
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <h3
                          className={`font-title text-base font-semibold leading-tight ${
                            service.active ? 'text-text-primary' : 'text-text-subtle'
                          }`}
                        >
                          {service.name}
                        </h3>
                        {service.description && (
                          <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-text-muted">
                            {service.description}
                          </p>
                        )}
                      </div>
                      <div className="flex shrink-0 translate-y-0.5 items-center gap-0.5 opacity-0 transition-all duration-200 group-hover:opacity-100">
                        <button
                          onClick={() => openEdit(service)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-text-subtle transition-colors hover:bg-accent/8 hover:text-accent"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(service)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg text-text-subtle transition-colors hover:bg-danger/8 hover:text-danger"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="my-4 h-px bg-gradient-to-r from-border-default via-border-default/60 to-transparent" />

                    {/* Price hero */}
                    <div className="flex items-baseline gap-1">
                      <span className="text-[13px] font-medium text-text-subtle">R$</span>
                      <span
                        className={`font-title text-[28px] font-bold leading-none tabular-nums tracking-tight ${
                          service.active ? 'text-text-primary' : 'text-text-subtle'
                        }`}
                      >
                        {service.price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Discount annotations */}
                    {discounts.length > 0 && (
                      <div className="mt-3 flex items-center gap-3">
                        {discounts.map((d) => (
                          <span key={d.label} className="flex items-center gap-1.5 text-[11px]">
                            <span className="font-medium text-text-subtle">{d.label}</span>
                            <span className={`font-semibold ${d.color}`}>-{d.value}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Inactive label */}
                    {!service.active && (
                      <div className="mt-3">
                        <span className="text-[11px] font-medium uppercase tracking-wider text-text-subtle/70">
                          Inativo
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => handlePageChange(pagination.page - 1)}
            className="gap-1.5"
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
            className="gap-1.5"
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
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[6px]" />
          <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none">
            <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border-default bg-surface-1 shadow-[0_24px_80px_rgba(28,27,24,0.12)]">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border-default bg-gradient-to-r from-accent/[0.04] to-transparent px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent/10">
                    <Wrench className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <Dialog.Title className="font-title text-base font-semibold text-text-primary">
                      {editingService ? 'Editar Serviço' : 'Novo Serviço'}
                    </Dialog.Title>
                    <p className="text-[11px] text-text-subtle">
                      {editingService ? 'Altere as informações do serviço' : 'Preencha os dados para criar'}
                    </p>
                  </div>
                </div>
                <Dialog.Close
                  disabled={isSaving}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-text-subtle transition-colors hover:bg-surface-2 hover:text-text-primary disabled:pointer-events-none"
                >
                  <X className="h-4 w-4" />
                </Dialog.Close>
              </div>

              {/* Body */}
              <div className="max-h-[calc(100vh-220px)] overflow-y-auto px-6 py-5">
                <div className="space-y-5">
                  {/* ── Informações ── */}
                  <div className="space-y-3.5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-text-muted">
                        Nome do serviço
                      </label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Ex: Consulta Inicial"
                        maxLength={255}
                        className="h-10 w-full rounded-xl border border-border-default bg-surface-2 px-3 text-sm text-text-primary outline-none placeholder:text-text-subtle transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-text-muted">
                        Descrição <span className="text-text-subtle">(opcional)</span>
                      </label>
                      <textarea
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        placeholder="Breve descrição do serviço..."
                        maxLength={500}
                        rows={2}
                        className="w-full resize-none rounded-xl border border-border-default bg-surface-2 px-3 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-subtle transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
                      />
                    </div>

                    {/* ── Image upload ── */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-text-muted">
                        Imagem <span className="text-text-subtle">(opcional)</span>
                      </label>
                      {formImagePreview ? (
                        <div className="relative overflow-hidden rounded-xl border border-border-default">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={formImagePreview}
                            alt="Preview"
                            className="h-32 w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={clearImage}
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-lg bg-black/50 text-white transition-colors hover:bg-black/70"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex h-24 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border-default bg-surface-2/50 text-text-subtle transition-colors hover:border-accent/30 hover:bg-accent/[0.03] hover:text-accent"
                        >
                          <Upload className="h-5 w-5" />
                          <span className="text-xs font-medium">
                            Clique para enviar (JPEG, PNG, WebP - max 5MB)
                          </span>
                        </button>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* ── Preço e Descontos ── */}
                  <div className="space-y-3.5">
                    <div className="flex items-center gap-2">
                      <div className="h-px flex-1 bg-border-default" />
                      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-text-subtle">
                        Preço e descontos
                      </span>
                      <div className="h-px flex-1 bg-border-default" />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-text-muted">
                        Preço
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-text-subtle">
                          R$
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="999999.99"
                          value={formPrice}
                          onChange={(e) => setFormPrice(e.target.value)}
                          placeholder="0,00"
                          className="h-10 w-full rounded-xl border border-border-default bg-surface-2 pl-9 pr-3 text-sm tabular-nums text-text-primary outline-none placeholder:text-text-subtle transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-text-muted">
                          Desconto PIX
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={formPixDiscount}
                            onChange={(e) => setFormPixDiscount(e.target.value)}
                            placeholder="0"
                            className="h-10 w-full rounded-xl border border-border-default bg-surface-2 px-3 pr-8 text-sm tabular-nums text-text-primary outline-none placeholder:text-text-subtle transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-text-subtle">
                            %
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-text-muted">
                          Desconto Cartão
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={formCardDiscount}
                            onChange={(e) => setFormCardDiscount(e.target.value)}
                            placeholder="0"
                            className="h-10 w-full rounded-xl border border-border-default bg-surface-2 px-3 pr-8 text-sm tabular-nums text-text-primary outline-none placeholder:text-text-subtle transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-text-subtle">
                            %
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── Desconto Especial (collapsible) ── */}
                  <details className="group rounded-xl border border-border-default/70 bg-surface-2/30">
                    <summary className="flex cursor-pointer items-center gap-2.5 px-4 py-3 text-sm font-medium text-text-muted transition-colors hover:text-text-primary [&::-webkit-details-marker]:hidden">
                      <Tag className="h-3.5 w-3.5 text-amber" />
                      <span className="flex-1">Desconto Especial</span>
                      {formSpecialName && parseFloat(formSpecialPercent) > 0 && (
                        <span className="rounded-full bg-amber/15 px-1.5 py-0.5 text-[10px] font-semibold text-amber">
                          {formSpecialPercent}% OFF
                        </span>
                      )}
                      <ChevronDown className="h-4 w-4 text-text-subtle transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="space-y-3.5 border-t border-border-default/50 px-4 py-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-text-subtle">Nome da promoção</label>
                          <input
                            type="text"
                            value={formSpecialName}
                            onChange={(e) => setFormSpecialName(e.target.value)}
                            placeholder="Ex: Queima de estoque"
                            maxLength={255}
                            className="h-10 w-full rounded-xl border border-border-default bg-surface-2 px-3 text-sm text-text-primary outline-none placeholder:text-text-subtle transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-text-subtle">Desconto</label>
                          <div className="relative">
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              value={formSpecialPercent}
                              onChange={(e) => setFormSpecialPercent(e.target.value)}
                              placeholder="0"
                              className="h-10 w-full rounded-xl border border-border-default bg-surface-2 px-3 pr-8 text-sm tabular-nums text-text-primary outline-none placeholder:text-text-subtle transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-text-subtle">
                              %
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-text-subtle">Início</label>
                          <input
                            type="date"
                            value={formSpecialStartsAt}
                            onChange={(e) => setFormSpecialStartsAt(e.target.value)}
                            className="h-10 w-full rounded-xl border border-border-default bg-surface-2 px-3 text-sm text-text-primary outline-none transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-medium text-text-subtle">Fim</label>
                          <input
                            type="date"
                            value={formSpecialEndsAt}
                            onChange={(e) => setFormSpecialEndsAt(e.target.value)}
                            className="h-10 w-full rounded-xl border border-border-default bg-surface-2 px-3 text-sm text-text-primary outline-none transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
                          />
                        </div>
                      </div>
                    </div>
                  </details>

                  {/* ── Instruções do Agente (collapsible) ── */}
                  <details className="group rounded-xl border border-border-default/70 bg-surface-2/30">
                    <summary className="flex cursor-pointer items-center gap-2.5 px-4 py-3 text-sm font-medium text-text-muted transition-colors hover:text-text-primary [&::-webkit-details-marker]:hidden">
                      <Bot className="h-3.5 w-3.5 text-teal" />
                      <span className="flex-1">Instruções para o Agente</span>
                      {formAgentInstructions.trim() && (
                        <span className="rounded-full bg-teal/15 px-1.5 py-0.5 text-[10px] font-semibold text-teal">
                          Configurado
                        </span>
                      )}
                      <ChevronDown className="h-4 w-4 text-text-subtle transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="border-t border-border-default/50 px-4 py-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-medium text-text-subtle">
                          Como o agente deve apresentar este serviço?
                        </label>
                        <textarea
                          value={formAgentInstructions}
                          onChange={(e) => setFormAgentInstructions(e.target.value)}
                          placeholder="Ex: Destaque que inclui acompanhamento por 30 dias. Mencione que é ideal para novos clientes..."
                          maxLength={2000}
                          rows={3}
                          className="w-full resize-none rounded-xl border border-border-default bg-surface-2 px-3 py-2.5 text-sm text-text-primary outline-none placeholder:text-text-subtle transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
                        />
                        <p className="text-[11px] text-text-subtle">
                          {formAgentInstructions.length}/2000 caracteres
                        </p>
                      </div>
                    </div>
                  </details>

                  {/* ── Status toggle (edit only) ── */}
                  {editingService && (
                    <div className="flex items-center justify-between rounded-xl border border-border-default/70 bg-surface-2/30 px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-text-primary">
                          Status do serviço
                        </p>
                        <p className="text-[11px] text-text-subtle">
                          {formActive ? 'Visível no catálogo' : 'Oculto do catálogo'}
                        </p>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={formActive}
                        onClick={() => setFormActive((prev) => !prev)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent/20 focus:ring-offset-2 focus:ring-offset-surface-1 ${
                          formActive ? 'bg-accent' : 'bg-border-default'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
                            formActive ? 'translate-x-5' : 'translate-x-0.5'
                          }`}
                          style={{ marginTop: '2px' }}
                        />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-border-default px-6 py-4">
                {formError && (
                  <div className="mb-3 rounded-lg bg-danger/8 px-3 py-2">
                    <p className="text-sm text-danger">{formError}</p>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Dialog.Close
                    disabled={isSaving}
                    className="inline-flex h-9 items-center rounded-xl px-4 text-sm font-medium text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary disabled:pointer-events-none disabled:opacity-50"
                  >
                    Cancelar
                  </Dialog.Close>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="h-9 rounded-xl bg-accent px-5 text-sm font-semibold text-primary-foreground shadow-[0_1px_8px_rgba(212,130,10,0.15)] transition-all hover:brightness-110 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <span className="flex items-center gap-1.5">
                        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                        Salvando...
                      </span>
                    ) : editingService ? (
                      'Salvar alterações'
                    ) : (
                      'Criar serviço'
                    )}
                  </Button>
                </div>
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
                    Deletar serviço
                  </Dialog.Title>
                  <Dialog.Description className="mt-1 text-sm text-text-muted">
                    Tem certeza que deseja deletar o serviço{' '}
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
