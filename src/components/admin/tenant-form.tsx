'use client'

import { useState, useCallback, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronDown, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PriceInput } from '@/components/common/price-input'
import { ChipInput } from '@/components/common/chip-input'
import type {
  Tenant,
  CreateTenantPayload,
  ToneOfVoice,
  HandoffConfig,
  OrchestratorConfig,
  TenantQuotas,
} from '@/lib/types'

const INPUT_CLASS =
  'h-11 rounded-xl border-border-default bg-[rgba(240,237,232,0.04)] text-text-primary placeholder:text-text-subtle transition-all duration-200 focus:border-accent/30 focus:ring-2 focus:ring-accent/10'

const TONE_OPTIONS: { value: ToneOfVoice; label: string }[] = [
  { value: 'formal', label: 'Formal' },
  { value: 'informal', label: 'Informal' },
  { value: 'neutro', label: 'Neutro' },
  { value: 'ousado', label: 'Ousado' },
]

interface TenantFormProps {
  initialData?: Partial<Tenant>
  onSubmit: (data: CreateTenantPayload) => Promise<void>
  submitLabel?: string
  maskKeys?: boolean
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function maskValue(val: string | undefined): string {
  if (!val) return ''
  if (val.length <= 8) return '****'
  return `${val.slice(0, 4)}****${val.slice(-3)}`
}

interface SectionProps {
  title: string
  index: number
  open: boolean
  onToggle: (index: number) => void
  children: React.ReactNode
}

function AccordionSection({ title, index, open, onToggle, children }: SectionProps) {
  return (
    <div className="card-surface overflow-hidden">
      <button
        type="button"
        onClick={() => onToggle(index)}
        className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-accent/5"
      >
        <span className="text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
          {title}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4 text-text-subtle" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-border-default/50 px-6 py-5 space-y-5">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  masked,
  originalValue,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  masked?: boolean
  originalValue?: string
}) {
  const [show, setShow] = useState(false)
  const isConfigured = masked && !!originalValue

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className="text-[12px] font-medium text-text-muted">
          {label}
        </Label>
        {masked && (
          isConfigured ? (
            <Badge variant="outline" className="border-emerald/30 bg-emerald/10 text-emerald text-[10px]">
              Configurado
            </Badge>
          ) : (
            <Badge variant="outline" className="border-border-default bg-surface-2/50 text-text-muted text-[10px]">
              Nao configurado
            </Badge>
          )
        )}
      </div>
      <div className="relative">
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={masked && originalValue ? maskValue(originalValue) : ''}
          className={`${INPUT_CLASS} pr-10`}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-subtle transition-colors hover:text-text-primary"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  )
}

export function TenantForm({
  initialData,
  onSubmit,
  submitLabel = 'Criar Cliente',
  maskKeys = false,
}: TenantFormProps) {
  const [submitting, setSubmitting] = useState(false)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]))

  // Form state
  const [name, setName] = useState(initialData?.name ?? '')
  const [slug, setSlug] = useState(initialData?.slug ?? '')
  const [toneOfVoice, setToneOfVoice] = useState<ToneOfVoice | undefined>(
    initialData?.tone_of_voice,
  )
  const [approachScript, setApproachScript] = useState(initialData?.approach_script ?? '')

  // Payments
  const [asaasKey, setAsaasKey] = useState('')
  const [stripeKey, setStripeKey] = useState('')

  // Meta Ads
  const [metaAccountId, setMetaAccountId] = useState(initialData?.meta_account_id ?? '')
  const [metaAccessToken, setMetaAccessToken] = useState('')
  const [pixelId, setPixelId] = useState(initialData?.pixel_id ?? '')
  const [whatsappPhoneId, setWhatsappPhoneId] = useState(initialData?.whatsapp_phone_id ?? '')
  const [whatsappToken, setWhatsappToken] = useState('')

  // Operational
  const [dailyBudget, setDailyBudget] = useState(initialData?.daily_budget ?? 0)
  const [cardLimit, setCardLimit] = useState(initialData?.card_limit ?? 0)
  const [targetRoas, setTargetRoas] = useState(initialData?.target_roas ?? 0)
  const [maxCpa, setMaxCpa] = useState(initialData?.max_cpa ?? 0)
  const [alertPhone, setAlertPhone] = useState(initialData?.alert_phone ?? '')
  const [competitors, setCompetitors] = useState<string[]>(initialData?.competitors ?? [])

  // Handoff
  const [maxNegativeTurns, setMaxNegativeTurns] = useState(
    initialData?.handoff_config?.max_negative_turns ?? 2,
  )
  const [maxLlmFailures, setMaxLlmFailures] = useState(
    initialData?.handoff_config?.max_llm_failures ?? 2,
  )
  const [whaleAutoTakeover, setWhaleAutoTakeover] = useState(
    initialData?.handoff_config?.whale_auto_takeover ?? true,
  )
  const [escalationPhone, setEscalationPhone] = useState(
    initialData?.handoff_config?.escalation_phone ?? '',
  )

  // Orchestrator
  const [budgetNearLimitThreshold, setBudgetNearLimitThreshold] = useState(
    initialData?.orchestrator_config?.budget_near_limit_threshold ?? 90,
  )
  const [bottleneckThreshold, setBottleneckThreshold] = useState(
    initialData?.orchestrator_config?.bottleneck_threshold ?? 120000,
  )
  const [whaleScoreThreshold, setWhaleScoreThreshold] = useState(
    initialData?.orchestrator_config?.whale_score_threshold ?? 85,
  )
  const [budgetScaleFactor, setBudgetScaleFactor] = useState(
    initialData?.orchestrator_config?.budget_scale_factor ?? 15,
  )
  const [roasTargetModifier, setRoasTargetModifier] = useState(
    initialData?.orchestrator_config?.roas_target_modifier ?? 1.0,
  )

  // Quotas
  const [rateLimitPerHour, setRateLimitPerHour] = useState(
    initialData?.quotas?.rate_limit_per_hour ?? 200,
  )
  const [maxWhatsappInstances, setMaxWhatsappInstances] = useState(
    initialData?.quotas?.max_whatsapp_instances ?? 3,
  )
  const [monthlyMessageQuota, setMonthlyMessageQuota] = useState(
    initialData?.quotas?.monthly_message_quota ?? 10000,
  )

  const handleNameChange = useCallback(
    (val: string) => {
      setName(val)
      if (!slugManuallyEdited) {
        setSlug(toSlug(val))
      }
    },
    [slugManuallyEdited],
  )

  const handleSlugChange = useCallback((val: string) => {
    setSlugManuallyEdited(true)
    setSlug(val)
  }, [])

  const toggleSection = useCallback((index: number) => {
    setOpenSections((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    const handoffConfig: HandoffConfig = {
      max_negative_turns: maxNegativeTurns,
      max_llm_failures: maxLlmFailures,
      whale_auto_takeover: whaleAutoTakeover,
      ...(escalationPhone ? { escalation_phone: escalationPhone } : {}),
    }

    const orchestratorConfig: OrchestratorConfig = {
      budget_near_limit_threshold: budgetNearLimitThreshold,
      bottleneck_threshold: bottleneckThreshold,
      whale_score_threshold: whaleScoreThreshold,
      budget_scale_factor: budgetScaleFactor,
      roas_target_modifier: roasTargetModifier,
    }

    const quotas: TenantQuotas = {
      rate_limit_per_hour: rateLimitPerHour,
      max_whatsapp_instances: maxWhatsappInstances,
      monthly_message_quota: monthlyMessageQuota,
    }

    const payload: CreateTenantPayload = {
      name,
      slug,
      ...(toneOfVoice ? { tone_of_voice: toneOfVoice } : {}),
      ...(approachScript ? { approach_script: approachScript } : {}),
      ...(asaasKey ? { asaas_key: asaasKey } : {}),
      ...(stripeKey ? { stripe_key: stripeKey } : {}),
      ...(metaAccountId ? { meta_account_id: metaAccountId } : {}),
      ...(metaAccessToken ? { meta_access_token: metaAccessToken } : {}),
      ...(pixelId ? { pixel_id: pixelId } : {}),
      ...(whatsappPhoneId ? { whatsapp_phone_id: whatsappPhoneId } : {}),
      ...(whatsappToken ? { whatsapp_token: whatsappToken } : {}),
      ...(dailyBudget ? { daily_budget: dailyBudget } : {}),
      ...(cardLimit ? { card_limit: cardLimit } : {}),
      ...(targetRoas ? { target_roas: targetRoas } : {}),
      ...(maxCpa ? { max_cpa: maxCpa } : {}),
      ...(alertPhone ? { alert_phone: alertPhone } : {}),
      ...(competitors.length > 0 ? { competitors } : {}),
      handoff_config: handoffConfig,
      orchestrator_config: orchestratorConfig,
      quotas,
    }

    try {
      await onSubmit(payload)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Section 1: Dados Basicos */}
      <AccordionSection
        title="Dados Basicos"
        index={0}
        open={openSections.has(0)}
        onToggle={toggleSection}
      >
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-[12px] font-medium text-text-muted">
            Nome *
          </Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Nome do cliente"
            required
            className={INPUT_CLASS}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="slug" className="text-[12px] font-medium text-text-muted">
            Slug
          </Label>
          <Input
            id="slug"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="slug-do-cliente"
            className={`${INPUT_CLASS} font-mono`}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[12px] font-medium text-text-muted">Tom de voz</Label>
          <div className="flex flex-wrap gap-2">
            {TONE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setToneOfVoice(opt.value)}
                className={`rounded-xl px-4 py-2 text-[13px] font-medium transition-all duration-200 ${
                  toneOfVoice === opt.value
                    ? 'bg-accent text-primary-foreground shadow-md'
                    : 'bg-surface-2/60 text-text-muted hover:bg-surface-2 hover:text-text-primary'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="approach_script" className="text-[12px] font-medium text-text-muted">
            Script de abordagem
          </Label>
          <Textarea
            id="approach_script"
            value={approachScript}
            onChange={(e) => setApproachScript(e.target.value)}
            placeholder="Descreva como o agente deve abordar os leads..."
            className={`${INPUT_CLASS} min-h-24`}
          />
        </div>
      </AccordionSection>

      {/* Section 2: Pagamentos */}
      <AccordionSection
        title="Pagamentos"
        index={1}
        open={openSections.has(1)}
        onToggle={toggleSection}
      >
        <PasswordField
          id="asaas_key"
          label="Chave Asaas"
          value={asaasKey}
          onChange={setAsaasKey}
          masked={maskKeys}
          originalValue={initialData?.asaas_key}
        />
        <PasswordField
          id="stripe_key"
          label="Chave Stripe"
          value={stripeKey}
          onChange={setStripeKey}
          masked={maskKeys}
          originalValue={initialData?.stripe_key}
        />
      </AccordionSection>

      {/* Section 3: Meta Ads */}
      <AccordionSection
        title="Meta Ads"
        index={2}
        open={openSections.has(2)}
        onToggle={toggleSection}
      >
        <div className="space-y-1.5">
          <Label htmlFor="meta_account_id" className="text-[12px] font-medium text-text-muted">
            Meta Account ID
          </Label>
          <Input
            id="meta_account_id"
            value={metaAccountId}
            onChange={(e) => setMetaAccountId(e.target.value)}
            placeholder="act_123456789"
            className={INPUT_CLASS}
          />
        </div>

        <PasswordField
          id="meta_access_token"
          label="Meta Access Token"
          value={metaAccessToken}
          onChange={setMetaAccessToken}
          masked={maskKeys}
          originalValue={initialData?.meta_access_token}
        />

        <div className="space-y-1.5">
          <Label htmlFor="pixel_id" className="text-[12px] font-medium text-text-muted">
            Pixel ID
          </Label>
          <Input
            id="pixel_id"
            value={pixelId}
            onChange={(e) => setPixelId(e.target.value)}
            placeholder="123456789"
            className={INPUT_CLASS}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="whatsapp_phone_id" className="text-[12px] font-medium text-text-muted">
            WhatsApp Phone ID
          </Label>
          <Input
            id="whatsapp_phone_id"
            value={whatsappPhoneId}
            onChange={(e) => setWhatsappPhoneId(e.target.value)}
            placeholder="123456789"
            className={INPUT_CLASS}
          />
        </div>

        <PasswordField
          id="whatsapp_token"
          label="WhatsApp Token"
          value={whatsappToken}
          onChange={setWhatsappToken}
          masked={maskKeys}
          originalValue={initialData?.whatsapp_token}
        />
      </AccordionSection>

      {/* Section 4: Configuracao Operacional */}
      <AccordionSection
        title="Configuracao Operacional"
        index={3}
        open={openSections.has(3)}
        onToggle={toggleSection}
      >
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="daily_budget" className="text-[12px] font-medium text-text-muted">
              Budget diario
            </Label>
            <PriceInput
              id="daily_budget"
              value={dailyBudget}
              onChange={setDailyBudget}
              placeholder="0,00"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="card_limit" className="text-[12px] font-medium text-text-muted">
              Limite do cartao
            </Label>
            <PriceInput
              id="card_limit"
              value={cardLimit}
              onChange={setCardLimit}
              placeholder="0,00"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="target_roas" className="text-[12px] font-medium text-text-muted">
              ROAS alvo
            </Label>
            <Input
              id="target_roas"
              type="number"
              step="0.1"
              value={targetRoas || ''}
              onChange={(e) => setTargetRoas(parseFloat(e.target.value) || 0)}
              placeholder="3.0"
              className={INPUT_CLASS}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="max_cpa" className="text-[12px] font-medium text-text-muted">
              CPA maximo
            </Label>
            <Input
              id="max_cpa"
              type="number"
              step="0.01"
              value={maxCpa || ''}
              onChange={(e) => setMaxCpa(parseFloat(e.target.value) || 0)}
              placeholder="50.00"
              className={INPUT_CLASS}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="alert_phone" className="text-[12px] font-medium text-text-muted">
            Telefone para alertas
          </Label>
          <Input
            id="alert_phone"
            type="tel"
            value={alertPhone}
            onChange={(e) => setAlertPhone(e.target.value)}
            placeholder="+55 11 99999-9999"
            className={INPUT_CLASS}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-[12px] font-medium text-text-muted">Concorrentes</Label>
          <ChipInput
            value={competitors}
            onChange={setCompetitors}
            placeholder="Digite o nome e pressione Enter"
          />
        </div>
      </AccordionSection>

      {/* Section 5: Configuracao Avancada */}
      <AccordionSection
        title="Configuracao Avancada"
        index={4}
        open={openSections.has(4)}
        onToggle={toggleSection}
      >
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
            Handoff
          </p>
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="max_negative_turns" className="text-[12px] font-medium text-text-muted">
                Max turnos negativos
              </Label>
              <Input
                id="max_negative_turns"
                type="number"
                min={0}
                value={maxNegativeTurns}
                onChange={(e) => setMaxNegativeTurns(parseInt(e.target.value) || 0)}
                className={INPUT_CLASS}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="max_llm_failures" className="text-[12px] font-medium text-text-muted">
                Max falhas LLM
              </Label>
              <Input
                id="max_llm_failures"
                type="number"
                min={0}
                value={maxLlmFailures}
                onChange={(e) => setMaxLlmFailures(parseInt(e.target.value) || 0)}
                className={INPUT_CLASS}
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[12px] font-medium text-text-muted">
                Whale auto takeover
              </Label>
              <button
                type="button"
                onClick={() => setWhaleAutoTakeover(!whaleAutoTakeover)}
                className={`relative h-7 w-12 rounded-full transition-colors duration-200 ${
                  whaleAutoTakeover ? 'bg-accent' : 'bg-surface-2'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white transition-transform duration-200 ${
                    whaleAutoTakeover ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="escalation_phone" className="text-[12px] font-medium text-text-muted">
                Telefone de escalacao
              </Label>
              <Input
                id="escalation_phone"
                type="tel"
                value={escalationPhone}
                onChange={(e) => setEscalationPhone(e.target.value)}
                placeholder="+55 11 99999-9999"
                className={INPUT_CLASS}
              />
            </div>
          </div>
        </div>

        <div className="border-t border-border-default/50 pt-5">
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
            Orchestrator
          </p>
          <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="budget_near_limit" className="text-[12px] font-medium text-text-muted">
                Budget near limit (%)
              </Label>
              <Input
                id="budget_near_limit"
                type="number"
                min={0}
                max={100}
                value={budgetNearLimitThreshold}
                onChange={(e) => setBudgetNearLimitThreshold(parseInt(e.target.value) || 0)}
                className={INPUT_CLASS}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bottleneck_threshold" className="text-[12px] font-medium text-text-muted">
                Bottleneck threshold (ms)
              </Label>
              <Input
                id="bottleneck_threshold"
                type="number"
                min={0}
                value={bottleneckThreshold}
                onChange={(e) => setBottleneckThreshold(parseInt(e.target.value) || 0)}
                className={INPUT_CLASS}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="whale_score" className="text-[12px] font-medium text-text-muted">
                Whale score threshold (0-100)
              </Label>
              <Input
                id="whale_score"
                type="number"
                min={0}
                max={100}
                value={whaleScoreThreshold}
                onChange={(e) => setWhaleScoreThreshold(parseInt(e.target.value) || 0)}
                className={INPUT_CLASS}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="budget_scale_factor" className="text-[12px] font-medium text-text-muted">
                Budget scale factor (%)
              </Label>
              <Input
                id="budget_scale_factor"
                type="number"
                min={0}
                value={budgetScaleFactor}
                onChange={(e) => setBudgetScaleFactor(parseInt(e.target.value) || 0)}
                className={INPUT_CLASS}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="roas_target_modifier" className="text-[12px] font-medium text-text-muted">
                ROAS target modifier
              </Label>
              <Input
                id="roas_target_modifier"
                type="number"
                step="0.1"
                min={0}
                value={roasTargetModifier}
                onChange={(e) => setRoasTargetModifier(parseFloat(e.target.value) || 0)}
                className={INPUT_CLASS}
              />
            </div>
          </div>
        </div>
      </AccordionSection>

      {/* Section 6: Quotas */}
      <AccordionSection
        title="Quotas"
        index={5}
        open={openSections.has(5)}
        onToggle={toggleSection}
      >
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="rate_limit" className="text-[12px] font-medium text-text-muted">
              Rate limit / hora
            </Label>
            <Input
              id="rate_limit"
              type="number"
              min={0}
              value={rateLimitPerHour}
              onChange={(e) => setRateLimitPerHour(parseInt(e.target.value) || 0)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="max_whatsapp" className="text-[12px] font-medium text-text-muted">
              Max instancias WhatsApp
            </Label>
            <Input
              id="max_whatsapp"
              type="number"
              min={0}
              value={maxWhatsappInstances}
              onChange={(e) => setMaxWhatsappInstances(parseInt(e.target.value) || 0)}
              className={INPUT_CLASS}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="monthly_quota" className="text-[12px] font-medium text-text-muted">
              Quota mensal de mensagens
            </Label>
            <Input
              id="monthly_quota"
              type="number"
              min={0}
              value={monthlyMessageQuota}
              onChange={(e) => setMonthlyMessageQuota(parseInt(e.target.value) || 0)}
              className={INPUT_CLASS}
            />
          </div>
        </div>
      </AccordionSection>

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={submitting || !name.trim()}
          className="h-11 rounded-xl bg-accent px-8 text-[14px] font-semibold text-primary-foreground hover:brightness-110 disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  )
}
