'use client'

import { useRef, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { Dialog } from '@base-ui/react/dialog'
import {
  Plus,
  Search,
  Upload,
  X,
  Users,
  ChevronLeft,
  ChevronRight,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MOTION } from '@/lib/motion'
import { formatDate, formatCNPJ } from '@/lib/format'
import { cn } from '@/lib/utils'
import { createUser } from '../actions'
import type { AdminUser, AdminUserPagination } from '@/lib/services/interfaces/admin-user-service'
import type { Plan } from '@/lib/services/interfaces/plan-service'

const ROLE_TABS = [
  { value: '', label: 'Todos' },
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'Usuário' },
] as const

interface UsersTableProps {
  users: AdminUser[]
  pagination: AdminUserPagination
  plans: Plan[]
  currentRole?: 'admin' | 'user'
  currentSearch?: string
}

export function UsersTable({
  users,
  pagination,
  plans,
  currentRole,
  currentSearch,
}: UsersTableProps) {
  const router = useRouter()
  const [searchValue, setSearchValue] = useState(currentSearch ?? '')

  // Create modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [formEmail, setFormEmail] = useState('')
  const [formPlanId, setFormPlanId] = useState('')
  const [formFile, setFormFile] = useState<File | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [isCreating, startCreate] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const totalPages = Math.ceil(pagination.total / pagination.limit)
  const planMap = new Map(plans.map((p) => [p.id, p.name]))

  // ── Navigation ──

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams()
    const merged = { role: currentRole, search: currentSearch, ...overrides }
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, v)
    })
    const qs = params.toString()
    return `/admin/usuarios${qs ? `?${qs}` : ''}`
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    router.push(
      buildUrl({ search: searchValue.trim() || undefined, page: undefined }),
    )
  }

  function handleRoleChange(role: string) {
    router.push(buildUrl({ role: role || undefined, page: undefined }))
  }

  function handlePageChange(page: number) {
    router.push(buildUrl({ page: page > 1 ? String(page) : undefined }))
  }

  // ── Create modal ──

  function openCreate() {
    setFormEmail('')
    setFormPlanId('')
    setFormFile(null)
    setFormError(null)
    setModalOpen(true)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    if (file && file.type !== 'application/pdf') {
      setFormError('O arquivo deve ser um PDF.')
      setFormFile(null)
      return
    }
    if (file && file.size > 10 * 1024 * 1024) {
      setFormError('O arquivo deve ter no máximo 10MB.')
      setFormFile(null)
      return
    }
    setFormError(null)
    setFormFile(file)
  }

  function handleCreate() {
    if (!formEmail || !formEmail.includes('@')) {
      setFormError('Email inválido.')
      return
    }
    if (!formPlanId) {
      setFormError('Selecione um plano.')
      return
    }
    if (!formFile) {
      setFormError('Selecione o contrato (PDF).')
      return
    }

    setFormError(null)

    const formData = new FormData()
    formData.append('email', formEmail.trim())
    formData.append('plan_id', formPlanId)
    formData.append('contract', formFile)

    startCreate(async () => {
      const result = await createUser(formData)
      if (result.success) {
        setModalOpen(false)
        router.refresh()
      } else {
        setFormError(result.error ?? 'Erro ao criar usuário.')
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
            Usuários
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Gerencie os usuários do sistema
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="h-9 gap-1.5 rounded-xl bg-accent px-4 text-sm font-semibold text-primary-foreground shadow-[0_0_16px_rgba(79,209,197,0.12)] transition-all hover:brightness-110"
        >
          <Plus className="h-4 w-4" />
          Novo Usuário
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.08 }}
        className="mt-6 flex flex-wrap items-center gap-4"
      >
        <form onSubmit={handleSearch} className="flex-1">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Buscar por nome ou email..."
              className="h-10 w-full rounded-xl border border-border-default bg-surface-1 pl-10 pr-4 text-sm text-text-primary outline-none placeholder:text-text-subtle transition-colors hover:border-border-hover focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
            />
          </div>
        </form>

        <div className="flex gap-0.5 rounded-lg bg-surface-2 p-0.5">
          {ROLE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleRoleChange(tab.value)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-medium transition-all duration-150',
                (currentRole ?? '') === tab.value
                  ? 'bg-accent text-primary-foreground shadow-sm'
                  : 'text-text-muted hover:text-text-primary',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Table */}
      {users.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-24"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2">
            <Users className="h-8 w-8 text-text-subtle/50" />
          </div>
          <p className="mt-4 font-title text-lg font-semibold text-text-muted">
            Nenhum usuário encontrado
          </p>
          <p className="mt-1 text-sm text-text-subtle">
            {currentSearch
              ? 'Tente uma busca diferente'
              : 'Cadastre o primeiro usuário clicando em "Novo Usuário"'}
          </p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.12 }}
          className="mt-6 overflow-x-auto rounded-xl border border-border-default"
        >
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-default bg-surface-1">
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
                  Nome
                </th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
                  Email
                </th>
                <th className="hidden px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-subtle lg:table-cell">
                  CNPJ
                </th>
                <th className="hidden px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-subtle md:table-cell">
                  Plano
                </th>
                <th className="hidden px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-text-subtle sm:table-cell">
                  Criado em
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isActive = user.name !== null

                return (
                  <tr
                    key={user.id}
                    className="border-b border-border-default/50 transition-colors last:border-b-0 hover:bg-[rgba(255,255,255,0.02)]"
                  >
                    <td className="px-4 py-3.5">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold',
                          isActive
                            ? 'bg-success/10 text-success'
                            : 'bg-gold/10 text-gold',
                        )}
                      >
                        {isActive ? 'Ativo' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-medium text-text-primary">
                      {user.name ?? (
                        <span className="text-text-subtle italic">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-text-muted">
                      {user.email}
                    </td>
                    <td className="hidden px-4 py-3.5 text-sm tabular-nums text-text-muted lg:table-cell">
                      {user.cnpj ? formatCNPJ(user.cnpj) : (
                        <span className="text-text-subtle">—</span>
                      )}
                    </td>
                    <td className="hidden px-4 py-3.5 text-sm text-text-muted md:table-cell">
                      {planMap.get(user.planId) ?? '—'}
                    </td>
                    <td className="hidden px-4 py-3.5 text-sm text-text-subtle sm:table-cell">
                      {formatDate(user.createdAt)}
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

      {/* ── Create modal ── */}
      <Dialog.Root
        open={modalOpen}
        onOpenChange={(isOpen) => {
          if (!isOpen && !isCreating) setModalOpen(false)
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
          <Dialog.Popup className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none">
            <div className="card-glass w-full max-w-md p-6">
              <div className="flex items-start justify-between">
                <Dialog.Title className="font-title text-lg font-semibold text-text-primary">
                  Novo Usuário
                </Dialog.Title>
                <Dialog.Close
                  disabled={isCreating}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-text-subtle transition-colors hover:bg-surface-2 hover:text-text-primary disabled:pointer-events-none"
                >
                  <X className="h-4 w-4" />
                </Dialog.Close>
              </div>

              <Dialog.Description className="mt-1 text-sm text-text-muted">
                O usuário receberá um email de boas-vindas com o link de onboarding.
              </Dialog.Description>

              <div className="mt-5 space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-muted">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="cliente@empresa.com"
                    className="h-10 w-full rounded-xl border border-border-default bg-surface-2 px-3 text-sm text-text-primary outline-none placeholder:text-text-subtle transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
                  />
                </div>

                {/* Plan select */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-muted">
                    Plano
                  </label>
                  <select
                    value={formPlanId}
                    onChange={(e) => setFormPlanId(e.target.value)}
                    className="h-10 w-full rounded-xl border border-border-default bg-surface-2 px-3 text-sm text-text-primary outline-none transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15"
                  >
                    <option value="">Selecione um plano</option>
                    {plans.map((plan) => (
                      <option key={plan.id} value={plan.id}>
                        {plan.name} — R${' '}
                        {plan.cost.toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Contract file upload */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-text-muted">
                    Contrato (PDF)
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      'flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 transition-colors',
                      formFile
                        ? 'border-accent/30 bg-accent/[0.04]'
                        : 'border-border-default hover:border-border-hover hover:bg-surface-2/50',
                    )}
                  >
                    {formFile ? (
                      <div className="flex items-center gap-2">
                        <FileText className="h-5 w-5 text-accent" />
                        <span className="text-sm font-medium text-accent">
                          {formFile.name}
                        </span>
                        <span className="text-xs text-text-subtle">
                          ({(formFile.size / 1024 / 1024).toFixed(1)} MB)
                        </span>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-text-subtle" />
                        <p className="mt-2 text-sm text-text-muted">
                          Clique para selecionar
                        </p>
                        <p className="mt-0.5 text-[11px] text-text-subtle">
                          PDF, máximo 10MB
                        </p>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Error */}
              {formError && (
                <div className="mt-4 rounded-lg bg-danger/8 px-3 py-2.5">
                  <p className="text-sm text-danger">{formError}</p>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex justify-end gap-2">
                <Dialog.Close
                  disabled={isCreating}
                  className="inline-flex h-9 items-center rounded-xl px-4 text-sm font-medium text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary disabled:pointer-events-none disabled:opacity-50"
                >
                  Cancelar
                </Dialog.Close>
                <Button
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="h-9 rounded-xl bg-accent px-4 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
                >
                  {isCreating ? (
                    <span className="flex items-center gap-1.5">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                      Cadastrando...
                    </span>
                  ) : (
                    'Cadastrar'
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
