'use client'

import { useState, useTransition } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createInvoice } from '../actions'
import type { LeadPublic } from '@/lib/services/interfaces/lead-service'
import type { Service, Product } from '@/lib/services/interfaces/finance-service'

// ── Helpers ──

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function calcDiscount(amount: number, discountPercent: number): number {
  return Math.round(amount * discountPercent) / 100
}

function calcFinal(amount: number, discountPercent: number): number {
  return Math.max(0, amount - calcDiscount(amount, discountPercent))
}

// ── Types ──

type InvoiceType = 'service' | 'product' | 'manual'
type PaymentMethod = 'pix' | 'card' | 'none'
type LateInterestType = 'simple' | 'compound'

interface FormState {
  leadId: string
  type: InvoiceType | ''
  referenceId: string
  description: string
  amount: number
  paymentMethod: PaymentMethod
  dueDate: string
  lateFeePercent: number
  lateInterestType: LateInterestType
  lateInterestPercent: number
}

interface CreateInvoiceFormProps {
  leads: LeadPublic[]
  services: Service[]
  products: Product[]
}

// ── Step label ──

const STEPS = [
  'Cliente',
  'Tipo',
  'Item',
  'Pagamento',
  'Vencimento',
] as const

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-8 flex items-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
              i < current
                ? 'bg-accent text-primary-foreground'
                : i === current
                  ? 'bg-accent/20 text-accent ring-1 ring-accent/40'
                  : 'bg-surface-2 text-text-subtle'
            }`}
          >
            {i + 1}
          </div>
          <span
            className={`hidden text-xs font-medium sm:inline ${
              i === current ? 'text-text-primary' : 'text-text-subtle'
            }`}
          >
            {STEPS[i]}
          </span>
          {i < total - 1 && (
            <div
              className={`h-px w-6 ${i < current ? 'bg-accent/60' : 'bg-border-default'}`}
            />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Main component ──

export function CreateInvoiceForm({ leads, services, products }: CreateInvoiceFormProps) {
  const [step, setStep] = useState(0)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const [form, setForm] = useState<FormState>({
    leadId: '',
    type: '',
    referenceId: '',
    description: '',
    amount: 0,
    paymentMethod: 'none',
    dueDate: '',
    lateFeePercent: 2,
    lateInterestType: 'simple',
    lateInterestPercent: 1,
  })

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  // ── Discount ──

  function getDiscountPercent(): number {
    if (form.paymentMethod === 'pix') {
      const ref = getSelectedReference()
      return ref?.pixDiscountPercent ?? 0
    }
    if (form.paymentMethod === 'card') {
      const ref = getSelectedReference()
      return ref?.cardDiscountPercent ?? 0
    }
    return 0
  }

  function getSelectedReference(): (Service | Product) | null {
    if (form.type === 'service') {
      return services.find((s) => s.id === form.referenceId) ?? null
    }
    if (form.type === 'product') {
      return products.find((p) => p.id === form.referenceId) ?? null
    }
    return null
  }

  const discountPercent = getDiscountPercent()
  const discountValue = calcDiscount(form.amount, discountPercent)
  const finalAmount = calcFinal(form.amount, discountPercent)

  // ── Validation per step ──

  function validateStep(): string | null {
    switch (step) {
      case 0:
        if (!form.leadId) return 'Selecione um cliente.'
        return null
      case 1:
        if (!form.type) return 'Selecione o tipo da cobrança.'
        return null
      case 2:
        if (form.type === 'service' && !form.referenceId) return 'Selecione um serviço.'
        if (form.type === 'product' && !form.referenceId) return 'Selecione um produto.'
        if (form.type === 'manual') {
          if (!form.description.trim()) return 'Descrição é obrigatória.'
          if (form.amount <= 0) return 'Valor deve ser maior que zero.'
        }
        return null
      case 3:
        return null
      case 4:
        if (!form.dueDate) return 'Data de vencimento é obrigatória.'
        return null
      default:
        return null
    }
  }

  function handleNext() {
    const err = validateStep()
    if (err) {
      setFormError(err)
      return
    }
    setFormError(null)
    setStep((s) => Math.min(s + 1, 4))
  }

  function handleBack() {
    setFormError(null)
    setStep((s) => Math.max(s - 1, 0))
  }

  // ── Select service/product fills description + amount ──

  function handleServiceSelect(id: string) {
    set('referenceId', id)
    const svc = services.find((s) => s.id === id)
    if (svc) {
      set('description', svc.name)
      set('amount', svc.price)
    }
  }

  function handleProductSelect(id: string) {
    set('referenceId', id)
    const prd = products.find((p) => p.id === id)
    if (prd) {
      set('description', prd.name)
      set('amount', prd.price)
    }
  }

  // ── Submit ──

  function handleSubmit() {
    const err = validateStep()
    if (err) {
      setFormError(err)
      return
    }
    setFormError(null)

    startTransition(async () => {
      const result = await createInvoice({
        leadId: form.leadId,
        type: form.type as 'service' | 'product' | 'manual',
        referenceId: form.referenceId || undefined,
        description: form.description,
        amount: form.amount,
        paymentMethod: form.paymentMethod === 'none' ? undefined : form.paymentMethod,
        dueDate: form.dueDate,
        lateFeePercent: form.lateFeePercent,
        lateInterestType: form.lateInterestType,
        lateInterestPercent: form.lateInterestPercent,
      })

      if (result && !result.success) {
        setFormError(result.error ?? 'Erro ao criar cobrança.')
      }
    })
  }

  const inputClass =
    'h-10 w-full rounded-xl border border-border-default bg-surface-2 px-3 text-sm text-text-primary outline-none placeholder:text-text-subtle transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15'

  const selectClass =
    'h-10 w-full rounded-xl border border-border-default bg-surface-2 px-3 text-sm text-text-primary outline-none transition-colors focus:border-accent/40 focus:ring-1 focus:ring-accent/15'

  const labelClass = 'text-xs font-medium text-text-muted'

  return (
    <div className="card-surface rounded-2xl p-6">
      <StepIndicator current={step} total={5} />

      {/* ── Step 0: Select Lead ── */}
      {step === 0 && (
        <div className="space-y-4">
          <h2 className="font-title text-base font-semibold text-text-primary">
            Selecione o cliente
          </h2>
          <div className="space-y-1.5">
            <label className={labelClass}>Cliente</label>
            <select
              value={form.leadId}
              onChange={(e) => set('leadId', e.target.value)}
              className={selectClass}
            >
              <option value="">Selecionar cliente...</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.name} {lead.email ? `— ${lead.email}` : ''}
                </option>
              ))}
            </select>
            {leads.length === 0 && (
              <p className="text-xs text-text-subtle">
                Nenhum cliente encontrado. Crie um no CRM primeiro.
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Step 1: Select Type ── */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="font-title text-base font-semibold text-text-primary">
            Tipo da cobrança
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                { value: 'service', label: 'Serviço', desc: 'Serviço do catálogo' },
                { value: 'product', label: 'Produto', desc: 'Produto do catálogo' },
                { value: 'manual', label: 'Manual', desc: 'Valor personalizado' },
              ] as const
            ).map(({ value, label, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  set('type', value)
                  set('referenceId', '')
                  set('description', '')
                  set('amount', 0)
                }}
                className={`rounded-xl border p-4 text-left transition-colors ${
                  form.type === value
                    ? 'border-accent/40 bg-accent/8 ring-1 ring-accent/20'
                    : 'border-border-default bg-surface-2 hover:border-border-hover'
                }`}
              >
                <p className="text-sm font-semibold text-text-primary">{label}</p>
                <p className="mt-0.5 text-[11px] text-text-subtle">{desc}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 2: Item selection ── */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="font-title text-base font-semibold text-text-primary">
            {form.type === 'service' && 'Selecione o serviço'}
            {form.type === 'product' && 'Selecione o produto'}
            {form.type === 'manual' && 'Detalhe a cobrança'}
          </h2>

          {form.type === 'service' && (
            <div className="space-y-1.5">
              <label className={labelClass}>Serviço</label>
              <select
                value={form.referenceId}
                onChange={(e) => handleServiceSelect(e.target.value)}
                className={selectClass}
              >
                <option value="">Selecionar serviço...</option>
                {services
                  .filter((s) => s.active)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {formatCurrency(s.price)}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {form.type === 'product' && (
            <div className="space-y-1.5">
              <label className={labelClass}>Produto</label>
              <select
                value={form.referenceId}
                onChange={(e) => handleProductSelect(e.target.value)}
                className={selectClass}
              >
                <option value="">Selecionar produto...</option>
                {products
                  .filter((p) => p.active)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} — {formatCurrency(p.price)}
                    </option>
                  ))}
              </select>
            </div>
          )}

          {form.type === 'manual' && (
            <>
              <div className="space-y-1.5">
                <label className={labelClass}>Descrição</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Ex: Consultoria financeira"
                  maxLength={500}
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className={labelClass}>Valor (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={form.amount || ''}
                  onChange={(e) => set('amount', parseFloat(e.target.value) || 0)}
                  placeholder="0,00"
                  className={inputClass}
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Step 3: Payment method ── */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="font-title text-base font-semibold text-text-primary">
            Método de pagamento
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {(
              [
                { value: 'pix', label: 'PIX' },
                { value: 'card', label: 'Cartão' },
                { value: 'none', label: 'Nenhum' },
              ] as const
            ).map(({ value, label }) => {
              const ref = getSelectedReference()
              const pct =
                value === 'pix'
                  ? (ref?.pixDiscountPercent ?? 0)
                  : value === 'card'
                    ? (ref?.cardDiscountPercent ?? 0)
                    : 0
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => set('paymentMethod', value)}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    form.paymentMethod === value
                      ? 'border-accent/40 bg-accent/8 ring-1 ring-accent/20'
                      : 'border-border-default bg-surface-2 hover:border-border-hover'
                  }`}
                >
                  <p className="text-sm font-semibold text-text-primary">{label}</p>
                  {pct > 0 && (
                    <p className="mt-0.5 text-[11px] text-emerald-400">
                      {pct}% desconto
                    </p>
                  )}
                  {pct === 0 && value !== 'none' && (
                    <p className="mt-0.5 text-[11px] text-text-subtle">Sem desconto</p>
                  )}
                </button>
              )
            })}
          </div>

          {discountPercent > 0 && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/8 px-4 py-3">
              <p className="text-sm text-emerald-400">
                Desconto de {discountPercent}% aplicado:{' '}
                <strong>- {formatCurrency(discountValue)}</strong>
              </p>
              <p className="mt-0.5 text-xs text-emerald-400/70">
                Valor final: {formatCurrency(finalAmount)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Step 4: Due date ── */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="font-title text-base font-semibold text-text-primary">
              Vencimento
            </h2>
            <div className="space-y-1.5">
              <label className={labelClass}>Data de vencimento</label>
              <input
                type="date"
                value={form.dueDate}
                onChange={(e) => set('dueDate', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          {/* Advanced */}
          <div className="rounded-xl border border-border-default">
            <button
              type="button"
              onClick={() => setAdvancedOpen((o) => !o)}
              className="flex w-full items-center justify-between px-4 py-3 text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
            >
              <span>Configurações avançadas de mora</span>
              {advancedOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </button>

            {advancedOpen && (
              <div className="space-y-4 border-t border-border-default px-4 py-4">
                <div className="space-y-1.5">
                  <label className={labelClass}>Multa por atraso (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={form.lateFeePercent}
                    onChange={(e) =>
                      set('lateFeePercent', parseFloat(e.target.value) || 0)
                    }
                    className={inputClass}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Tipo de juros</label>
                  <select
                    value={form.lateInterestType}
                    onChange={(e) =>
                      set('lateInterestType', e.target.value as LateInterestType)
                    }
                    className={selectClass}
                  >
                    <option value="simple">Simples</option>
                    <option value="compound">Composto</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Juros por atraso (% a.m.)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="100"
                    value={form.lateInterestPercent}
                    onChange={(e) =>
                      set('lateInterestPercent', parseFloat(e.target.value) || 0)
                    }
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="rounded-xl border border-border-default bg-surface-1 p-4 space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
              Resumo
            </h3>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Descrição</span>
              <span className="max-w-[200px] truncate text-right font-medium text-text-primary">
                {form.description || '—'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Valor original</span>
              <span className="tabular-nums text-text-primary">
                {formatCurrency(form.amount)}
              </span>
            </div>
            {discountPercent > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">
                  Desconto ({discountPercent}%)
                </span>
                <span className="tabular-nums text-emerald-400">
                  - {formatCurrency(discountValue)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t border-border-default pt-2 text-sm font-semibold">
              <span className="text-text-primary">Valor final</span>
              <span className="tabular-nums text-text-primary">
                {formatCurrency(finalAmount)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {formError && (
        <div className="mt-4 rounded-lg bg-danger/8 px-3 py-2.5">
          <p className="text-sm text-danger">{formError}</p>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={handleBack}
          disabled={step === 0 || isPending}
          className="h-9 rounded-xl px-4 text-sm font-medium text-text-muted transition-colors hover:bg-surface-2 hover:text-text-primary disabled:pointer-events-none disabled:opacity-40"
        >
          Voltar
        </Button>

        {step < 4 ? (
          <Button
            type="button"
            onClick={handleNext}
            className="h-9 rounded-xl bg-accent px-4 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
          >
            Continuar
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isPending}
            className="h-9 rounded-xl bg-accent px-4 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:opacity-50"
          >
            {isPending ? (
              <span className="flex items-center gap-1.5">
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground" />
                Criando...
              </span>
            ) : (
              'Criar Cobrança'
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
