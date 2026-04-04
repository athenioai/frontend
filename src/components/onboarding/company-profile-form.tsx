'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, X, Loader2 } from 'lucide-react'
import type { CompanyProfile, CreateCompanyProfilePayload, ToneOfVoice } from '@/lib/types'

const INPUT_CLASS = "h-11 rounded-xl border-border-default bg-[rgba(240,237,232,0.04)] text-text-primary placeholder:text-text-subtle transition-all duration-200 focus:border-accent/30 focus:ring-2 focus:ring-accent/10"

const TONE_OPTIONS: { value: ToneOfVoice; label: string; description: string }[] = [
  { value: 'formal', label: 'Formal', description: 'Profissional e respeitoso' },
  { value: 'informal', label: 'Informal', description: 'Próximo e descontraído' },
  { value: 'neutro', label: 'Neutro', description: 'Equilibrado e objetivo' },
  { value: 'ousado', label: 'Ousado', description: 'Direto e provocativo' },
]

interface CompanyProfileFormProps {
  initialData?: CompanyProfile | null
  onSubmit: (data: CreateCompanyProfilePayload) => Promise<void>
  submitLabel?: string
}

export function CompanyProfileForm({ initialData, onSubmit, submitLabel = 'Salvar' }: CompanyProfileFormProps) {
  const [companyName, setCompanyName] = useState(initialData?.company_name ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [segment, setSegment] = useState(initialData?.segment ?? '')
  const [targetAudience, setTargetAudience] = useState(initialData?.target_audience ?? '')
  const [tone, setTone] = useState<ToneOfVoice | ''>(initialData?.tone ?? '')
  const [differentials, setDifferentials] = useState<string[]>(initialData?.differentials ?? [])
  const [newDifferential, setNewDifferential] = useState('')
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function addDifferential() {
    const trimmed = newDifferential.trim()
    if (!trimmed || differentials.length >= 10) return
    setDifferentials((prev) => [...prev, trimmed])
    setNewDifferential('')
  }

  function removeDifferential(index: number) {
    setDifferentials((prev) => prev.filter((_, i) => i !== index))
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (companyName.trim().length < 2) errs.companyName = 'Nome deve ter pelo menos 2 caracteres'
    if (companyName.trim().length > 200) errs.companyName = 'Nome deve ter no máximo 200 caracteres'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      await onSubmit({
        company_name: companyName.trim(),
        ...(description.trim() && { description: description.trim() }),
        ...(segment.trim() && { segment: segment.trim() }),
        ...(targetAudience.trim() && { target_audience: targetAudience.trim() }),
        ...(tone && { tone }),
        ...(differentials.length > 0 && { differentials }),
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1.5">
        <Label className="text-[12px] font-medium text-text-muted">
          Nome da Empresa <span className="text-danger">*</span>
        </Label>
        <Input
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          className={INPUT_CLASS}
          placeholder="Ex: Escola Fluent English"
        />
        {errors.companyName && (
          <p className="text-[11px] text-danger">{errors.companyName}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label className="text-[12px] font-medium text-text-muted">Descrição</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="rounded-xl border-border-default bg-[rgba(240,237,232,0.04)] text-text-primary placeholder:text-text-subtle transition-all duration-200 focus:border-accent/30 focus:ring-2 focus:ring-accent/10"
          placeholder="Descreva brevemente o que sua empresa faz..."
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-[12px] font-medium text-text-muted">Segmento</Label>
          <Input
            value={segment}
            onChange={(e) => setSegment(e.target.value)}
            className={INPUT_CLASS}
            placeholder="Ex: Educação, SaaS, Varejo..."
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[12px] font-medium text-text-muted">Público-alvo</Label>
          <Input
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            className={INPUT_CLASS}
            placeholder="Ex: Profissionais 25-45 anos"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[12px] font-medium text-text-muted">Tom de Voz</Label>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {TONE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setTone(option.value)}
              className={`rounded-xl border p-3 text-left transition-all duration-200 ${
                tone === option.value
                  ? 'border-accent/40 bg-accent/5 shadow-[0_0_12px_rgba(79,209,197,0.1)]'
                  : 'border-border-default bg-transparent hover:border-border-hover'
              }`}
            >
              <p className={`text-[13px] font-medium ${tone === option.value ? 'text-accent' : 'text-text-primary'}`}>
                {option.label}
              </p>
              <p className="text-[11px] text-text-subtle">{option.description}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-[12px] font-medium text-text-muted">
          Diferenciais {differentials.length > 0 && `(${differentials.length}/10)`}
        </Label>
        <div className="flex gap-2">
          <Input
            value={newDifferential}
            onChange={(e) => setNewDifferential(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDifferential())}
            className={INPUT_CLASS + ' flex-1'}
            placeholder="Ex: Certificado internacional"
            disabled={differentials.length >= 10}
          />
          <Button
            type="button"
            variant="outline"
            onClick={addDifferential}
            disabled={!newDifferential.trim() || differentials.length >= 10}
            className="h-11 rounded-xl"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <AnimatePresence>
          {differentials.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {differentials.map((diff, i) => (
                <motion.span
                  key={diff + i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border-default bg-surface-1 px-3 py-1.5 text-[12px] text-text-muted"
                >
                  {diff}
                  <button type="button" onClick={() => removeDifferential(i)} className="text-text-subtle hover:text-danger transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </motion.span>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      <Button
        type="submit"
        disabled={saving}
        className="h-11 w-full rounded-xl bg-accent px-6 text-[14px] font-semibold text-primary-foreground shadow-[0_0_24px_rgba(79,209,197,0.12)] transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_32px_rgba(79,209,197,0.18)] active:scale-[0.99]"
      >
        {saving ? (
          <span className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Salvando...
          </span>
        ) : (
          submitLabel
        )}
      </Button>
    </form>
  )
}
