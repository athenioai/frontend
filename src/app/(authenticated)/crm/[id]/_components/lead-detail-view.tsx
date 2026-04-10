'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import {
  ArrowLeft,
  Mail,
  Phone,
  Pencil,
  Trash2,
  Check,
  X,
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { MOTION } from '@/lib/motion'
import { formatDate } from '@/lib/format'
import { toast } from 'sonner'
import { updateLead, deleteLead } from '../../actions'
import { Timeline } from './timeline'
import type {
  LeadPublic,
  LeadStatus,
  TimelineEntry,
} from '@/lib/services/interfaces/lead-service'

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string; bg: string }> = {
  new: { label: 'Novo', color: 'text-teal', bg: 'bg-teal/10' },
  contacted: { label: 'Contactado', color: 'text-amber', bg: 'bg-amber/10' },
  qualified: { label: 'Qualificado', color: 'text-violet', bg: 'bg-violet/10' },
  converted: { label: 'Convertido', color: 'text-emerald', bg: 'bg-emerald/10' },
  lost: { label: 'Perdido', color: 'text-danger', bg: 'bg-danger/10' },
}

const STATUSES: LeadStatus[] = ['new', 'contacted', 'qualified', 'converted', 'lost']

interface LeadDetailViewProps {
  lead: LeadPublic
  timeline: TimelineEntry[]
}

export function LeadDetailView({ lead: initialLead, timeline }: LeadDetailViewProps) {
  const router = useRouter()
  const [lead, setLead] = useState(initialLead)
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [editName, setEditName] = useState(lead.name)
  const [editEmail, setEditEmail] = useState(lead.email)
  const [editPhone, setEditPhone] = useState(lead.phone ?? '')
  const [editStatus, setEditStatus] = useState(lead.status)
  const [isPending, startTransition] = useTransition()

  function startEdit() {
    setEditName(lead.name)
    setEditEmail(lead.email)
    setEditPhone(lead.phone ?? '')
    setEditStatus(lead.status)
    setEditing(true)
  }

  function cancelEdit() {
    setEditing(false)
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateLead(lead.id, {
        name: editName.trim(),
        email: editEmail.trim(),
        phone: editPhone.trim() || null,
        status: editStatus,
      })
      if (result.success && result.data) {
        setLead(result.data)
        setEditing(false)
        toast.success('Lead atualizado!')
      } else {
        toast.error(result.error ?? 'Erro ao atualizar.')
      }
    })
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteLead(lead.id)
      if (result.success) {
        toast.success('Lead removido.')
        router.push('/crm')
      } else {
        toast.error(result.error ?? 'Erro ao remover.')
        setConfirmDelete(false)
      }
    })
  }

  const statusCfg = STATUS_CONFIG[lead.status]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: MOTION.duration.normal, ease: MOTION.ease.out }}
      className="mx-auto max-w-3xl px-6 py-6 lg:px-8"
    >
      {/* Back link */}
      <Link
        href="/crm"
        className="mb-6 inline-flex items-center gap-1.5 text-[13px] text-text-muted transition-colors hover:text-text-primary"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Voltar ao CRM
      </Link>

      {/* Lead header card */}
      <div className="card-surface p-6">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            {editing ? (
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mb-2 text-lg font-semibold"
                maxLength={255}
                disabled={isPending}
              />
            ) : (
              <h1 className="text-xl text-text-primary">{lead.name}</h1>
            )}

            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-text-subtle" />
                {editing ? (
                  <Input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="flex-1"
                    disabled={isPending}
                  />
                ) : (
                  <span className="text-[14px] text-text-muted">{lead.email}</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-text-subtle" />
                {editing ? (
                  <Input
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Sem telefone"
                    className="flex-1"
                    maxLength={50}
                    disabled={isPending}
                  />
                ) : (
                  <span className="text-[14px] text-text-muted">
                    {lead.phone ?? 'Sem telefone'}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {editing ? (
              <>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={cancelEdit}
                  disabled={isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  size="icon-sm"
                  onClick={handleSave}
                  disabled={isPending}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="icon-sm" onClick={startEdit}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="icon-sm"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Status & dates row */}
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border-default pt-4">
          {editing ? (
            <div className="flex gap-1.5">
              {STATUSES.map((s) => {
                const cfg = STATUS_CONFIG[s]
                return (
                  <button
                    key={s}
                    onClick={() => setEditStatus(s)}
                    disabled={isPending}
                    className={cn(
                      'rounded-full px-2.5 py-1 text-[11px] font-medium transition-all',
                      editStatus === s
                        ? `${cfg.bg} ${cfg.color} ring-1 ring-current/20`
                        : 'bg-surface-2 text-text-subtle hover:text-text-muted',
                    )}
                  >
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          ) : (
            <span className={cn('rounded-full px-3 py-1 text-[12px] font-medium', statusCfg.bg, statusCfg.color)}>
              {statusCfg.label}
            </span>
          )}

          <span className="text-[12px] text-text-subtle">
            Criado em {formatDate(lead.created_at)}
          </span>
          <span className="text-[12px] text-text-subtle">
            Atualizado em {formatDate(lead.updated_at)}
          </span>
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmDelete && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 flex items-center justify-between rounded-xl border border-danger/30 bg-danger/[0.04] p-4"
        >
          <p className="text-[13px] text-danger">
            Tem certeza que deseja remover este lead?
          </p>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirmDelete(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? 'Removendo...' : 'Confirmar'}
            </Button>
          </div>
        </motion.div>
      )}

      {/* Timeline */}
      <div className="mt-8">
        <h2 className="mb-4 text-lg text-text-primary">Timeline</h2>
        <Timeline entries={timeline} />
      </div>
    </motion.div>
  )
}
