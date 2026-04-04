'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, X, Loader2, Trash2 } from 'lucide-react'
import type { CreateProductPayload, CreateVariantPayload, BillingCycle, Product } from '@/lib/types'

const INPUT_CLASS = "h-11 rounded-xl border-border-default bg-[rgba(240,237,232,0.04)] text-text-primary placeholder:text-text-subtle transition-all duration-200 focus:border-accent/30 focus:ring-2 focus:ring-accent/10"

const BILLING_LABELS: Record<BillingCycle, string> = {
  monthly: 'Mensal',
  yearly: 'Anual',
  one_time: 'Único',
}

interface VariantDraft {
  name: string
  price: string
  billing_cycle: BillingCycle
  features: string[]
  newFeature: string
}

function emptyVariant(): VariantDraft {
  return { name: '', price: '', billing_cycle: 'one_time', features: [], newFeature: '' }
}

function parsePriceToCents(display: string): number {
  const clean = display.replace(/\./g, '').replace(',', '.')
  const num = parseFloat(clean)
  return isNaN(num) ? 0 : Math.round(num * 100)
}

interface ProductFormProps {
  initialData?: Product
  onSubmit: (data: CreateProductPayload) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
}

export function ProductForm({ initialData, onSubmit, onCancel, submitLabel = 'Salvar Produto' }: ProductFormProps) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [benefits, setBenefits] = useState<string[]>(initialData?.benefits ?? [])
  const [newBenefit, setNewBenefit] = useState('')
  const [objectionBusters, setObjectionBusters] = useState<string[]>(initialData?.objection_busters ?? [])
  const [newObjection, setNewObjection] = useState('')
  const [variants, setVariants] = useState<VariantDraft[]>(
    initialData?.variants.map((v) => ({
      name: v.name,
      price: (v.price_cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      billing_cycle: v.billing_cycle ?? 'one_time',
      features: v.features ?? [],
      newFeature: '',
    })) ?? [emptyVariant()]
  )
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function addListItem(list: string[], setList: (v: string[]) => void, value: string, setValue: (v: string) => void) {
    const trimmed = value.trim()
    if (!trimmed) return
    setList([...list, trimmed])
    setValue('')
  }

  function updateVariant(index: number, updates: Partial<VariantDraft>) {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, ...updates } : v)))
  }

  function addVariantFeature(variantIndex: number) {
    const variant = variants[variantIndex]
    const trimmed = variant.newFeature.trim()
    if (!trimmed) return
    updateVariant(variantIndex, {
      features: [...variant.features, trimmed],
      newFeature: '',
    })
  }

  function removeVariantFeature(variantIndex: number, featureIndex: number) {
    const variant = variants[variantIndex]
    updateVariant(variantIndex, {
      features: variant.features.filter((_, i) => i !== featureIndex),
    })
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (name.trim().length < 2) errs.name = 'Nome deve ter pelo menos 2 caracteres'
    if (variants.length === 0) errs.variants = 'Adicione pelo menos 1 variante'
    variants.forEach((v, i) => {
      if (!v.name.trim()) errs[`variant_${i}_name`] = 'Nome da variante é obrigatório'
      if (parsePriceToCents(v.price) < 1) errs[`variant_${i}_price`] = 'Preço deve ser maior que R$ 0,00'
    })
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      const payload: CreateProductPayload = {
        name: name.trim(),
        ...(description.trim() && { description: description.trim() }),
        ...(benefits.length > 0 && { benefits }),
        ...(objectionBusters.length > 0 && { objection_busters: objectionBusters }),
        variants: variants.map((v): CreateVariantPayload => ({
          name: v.name.trim(),
          price_cents: parsePriceToCents(v.price),
          billing_cycle: v.billing_cycle,
          ...(v.features.length > 0 && { features: v.features }),
        })),
      }
      await onSubmit(payload)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-1.5">
        <Label className="text-[12px] font-medium text-text-muted">
          Nome do Produto <span className="text-danger">*</span>
        </Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} className={INPUT_CLASS} placeholder="Ex: Curso de Inglês" />
        {errors.name && <p className="text-[11px] text-danger">{errors.name}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-[12px] font-medium text-text-muted">Descrição</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="rounded-xl border-border-default bg-[rgba(240,237,232,0.04)] text-text-primary placeholder:text-text-subtle transition-all duration-200 focus:border-accent/30 focus:ring-2 focus:ring-accent/10"
          placeholder="Descreva o produto..."
        />
      </div>

      <div className="space-y-2">
        <Label className="text-[12px] font-medium text-text-muted">Benefícios</Label>
        <div className="flex gap-2">
          <Input value={newBenefit} onChange={(e) => setNewBenefit(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addListItem(benefits, setBenefits, newBenefit, setNewBenefit))} className={INPUT_CLASS + ' flex-1'} placeholder="Ex: Certificado reconhecido" />
          <Button type="button" variant="outline" onClick={() => addListItem(benefits, setBenefits, newBenefit, setNewBenefit)} className="h-11 rounded-xl"><Plus className="h-4 w-4" /></Button>
        </div>
        {benefits.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {benefits.map((b, i) => (
              <span key={b + i} className="inline-flex items-center gap-1.5 rounded-lg border border-border-default bg-surface-1 px-3 py-1.5 text-[12px] text-text-muted">
                {b}
                <button type="button" onClick={() => setBenefits(benefits.filter((_, j) => j !== i))} className="text-text-subtle hover:text-danger transition-colors"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-[12px] font-medium text-text-muted">Quebra-objeções</Label>
        <div className="flex gap-2">
          <Input value={newObjection} onChange={(e) => setNewObjection(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addListItem(objectionBusters, setObjectionBusters, newObjection, setNewObjection))} className={INPUT_CLASS + ' flex-1'} placeholder="Ex: 7 dias de garantia" />
          <Button type="button" variant="outline" onClick={() => addListItem(objectionBusters, setObjectionBusters, newObjection, setNewObjection)} className="h-11 rounded-xl"><Plus className="h-4 w-4" /></Button>
        </div>
        {objectionBusters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {objectionBusters.map((o, i) => (
              <span key={o + i} className="inline-flex items-center gap-1.5 rounded-lg border border-border-default bg-surface-1 px-3 py-1.5 text-[12px] text-text-muted">
                {o}
                <button type="button" onClick={() => setObjectionBusters(objectionBusters.filter((_, j) => j !== i))} className="text-text-subtle hover:text-danger transition-colors"><X className="h-3 w-3" /></button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-[12px] font-medium text-text-muted">
            Variantes <span className="text-danger">*</span>
          </Label>
          <Button type="button" variant="ghost" size="sm" onClick={() => setVariants([...variants, emptyVariant()])} className="text-accent text-[12px]">
            <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar variante
          </Button>
        </div>
        {errors.variants && <p className="text-[11px] text-danger">{errors.variants}</p>}

        <AnimatePresence>
          {variants.map((variant, vi) => (
            <motion.div
              key={vi}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="card-surface overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-border-default px-4 py-2.5">
                <span className="text-[12px] font-medium text-text-muted">Variante {vi + 1}</span>
                {variants.length > 1 && (
                  <button type="button" onClick={() => setVariants(variants.filter((_, i) => i !== vi))} className="text-text-subtle hover:text-danger transition-colors">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="space-y-4 p-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-medium text-text-subtle">Nome</Label>
                    <Input value={variant.name} onChange={(e) => updateVariant(vi, { name: e.target.value })} className={INPUT_CLASS} placeholder="Ex: Plano Basic" />
                    {errors[`variant_${vi}_name`] && <p className="text-[11px] text-danger">{errors[`variant_${vi}_name`]}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-medium text-text-subtle">Preço (R$)</Label>
                    <Input value={variant.price} onChange={(e) => updateVariant(vi, { price: e.target.value })} className={INPUT_CLASS} placeholder="97,00" inputMode="decimal" />
                    {errors[`variant_${vi}_price`] && <p className="text-[11px] text-danger">{errors[`variant_${vi}_price`]}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] font-medium text-text-subtle">Cobrança</Label>
                    <div className="flex gap-1.5">
                      {(['one_time', 'monthly', 'yearly'] as BillingCycle[]).map((cycle) => (
                        <button
                          key={cycle}
                          type="button"
                          onClick={() => updateVariant(vi, { billing_cycle: cycle })}
                          className={`flex-1 rounded-lg border px-2 py-2 text-[11px] font-medium transition-all duration-200 ${
                            variant.billing_cycle === cycle
                              ? 'border-accent/40 bg-accent/5 text-accent'
                              : 'border-border-default text-text-subtle hover:border-border-hover'
                          }`}
                        >
                          {BILLING_LABELS[cycle]}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[11px] font-medium text-text-subtle">Features da variante</Label>
                  <div className="flex gap-2">
                    <Input value={variant.newFeature} onChange={(e) => updateVariant(vi, { newFeature: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addVariantFeature(vi))} className={INPUT_CLASS + ' flex-1'} placeholder="Ex: Acesso ilimitado" />
                    <Button type="button" variant="outline" size="sm" onClick={() => addVariantFeature(vi)} className="h-11 rounded-xl"><Plus className="h-3.5 w-3.5" /></Button>
                  </div>
                  {variant.features.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {variant.features.map((f, fi) => (
                        <span key={f + fi} className="inline-flex items-center gap-1 rounded-md border border-border-default px-2 py-1 text-[11px] text-text-muted">
                          {f}
                          <button type="button" onClick={() => removeVariantFeature(vi, fi)} className="text-text-subtle hover:text-danger"><X className="h-2.5 w-2.5" /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="flex gap-3">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="h-11 flex-1 rounded-xl">
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          disabled={saving}
          className="h-11 flex-1 rounded-xl bg-accent px-6 text-[14px] font-semibold text-primary-foreground shadow-[0_0_24px_rgba(79,209,197,0.12)] transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_32px_rgba(79,209,197,0.18)] active:scale-[0.99]"
        >
          {saving ? (
            <span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Salvando...</span>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  )
}
