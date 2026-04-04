'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { PriceInput } from '@/components/common/price-input'
import { AgentStatusCard } from '@/components/widgets/agent-status-card'
import { useApi } from '@/hooks/useApi'
import { useReadiness } from '@/hooks/useReadiness'
import { clientApi } from '@/lib/api/client-api'
import { toast } from 'sonner'
import {
  Settings,
  Save,
  CheckCircle,
  AlertTriangle,
  Target,
  Wallet,
  MessageSquare,
  Building2,
  Loader2,
  User,
  Activity,
  Check,
  X,
} from 'lucide-react'
import { COLORS } from '@/lib/constants/theme'
import type { Company, AgentStatus } from '@/lib/types'

const INPUT_CLASS = 'h-11 rounded-xl border-border-default bg-[rgba(240,237,232,0.04)] text-text-primary placeholder:text-text-subtle transition-all duration-200 focus:border-accent/30 focus:ring-2 focus:ring-accent/10'

interface SystemHealth {
  supabase: boolean
  redis: boolean
  kairos: boolean
  ares: boolean
  whatsapp: boolean
}

const HEALTH_SERVICES: { key: keyof SystemHealth; label: string }[] = [
  { key: 'supabase', label: 'Supabase' },
  { key: 'redis', label: 'Redis' },
  { key: 'kairos', label: 'Kairos' },
  { key: 'ares', label: 'Ares' },
  { key: 'whatsapp', label: 'WhatsApp' },
]

const READINESS_LABELS: Record<string, string> = {
  company_profile: 'Perfil da Empresa',
  products: 'Produtos',
  knowledge_base: 'Base de Conhecimento',
  whatsapp: 'WhatsApp',
  orchestrator_config: 'Configuracao do Orquestrador',
}

function formatCurrencyInput(value: number | undefined): string {
  if (value === undefined || isNaN(value)) return ''
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatPhoneInput(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  if (digits.length <= 13) return `+${digits.slice(0, 2)} (${digits.slice(2, 4)}) ${digits.slice(4, 9)}-${digits.slice(9)}`
  return value
}

function parsePhoneInput(raw: string): string {
  return raw.replace(/\D/g, '')
}

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<Partial<Company>>({})
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Tab 3: Status data
  const { readiness, loading: readinessLoading } = useReadiness()
  const { data: agentStatus, loading: agentsLoading } = useApi<AgentStatus[]>('/agents')
  const { data: systemHealth, loading: healthLoading } = useApi<SystemHealth>('/health')

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/config')
        if (res.ok) {
          const data = await res.json()
          setConfig(data)
        }
      } catch {
        const stored = localStorage.getItem('athenio-config')
        if (stored) {
          setConfig(JSON.parse(stored))
        }
      } finally {
        setLoading(false)
      }
    }
    loadConfig()
  }, [])

  function handleChange(field: keyof Company, value: string | number) {
    setConfig((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      })
      if (res.ok) {
        const updated = await res.json()
        setConfig(updated)
      }
      localStorage.setItem('athenio-config', JSON.stringify(config))
      setSaved(true)
      toast.success('Configuracoes salvas')
      setTimeout(() => setSaved(false), 3000)
    } catch {
      localStorage.setItem('athenio-config', JSON.stringify(config))
      setSaved(true)
      toast.success('Configuracoes salvas localmente')
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }, [config])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent/15 to-accent/5">
            <Settings className="h-[18px] w-[18px] text-accent" />
          </div>
          <div>
            <h1 className="font-title text-[22px] font-bold text-text-primary">Configuracoes</h1>
            <p className="text-[13px] text-text-muted">Ajuste o comportamento dos agentes</p>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-11 rounded-xl bg-accent px-6 text-[14px] font-semibold text-primary-foreground shadow-[0_0_24px_rgba(79,209,197,0.12)] transition-all duration-200 hover:brightness-110 hover:shadow-[0_0_32px_rgba(79,209,197,0.18)] active:scale-[0.99]"
        >
          <AnimatePresence mode="wait">
            {saving ? (
              <motion.span
                key="saving"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2"
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </motion.span>
            ) : saved ? (
              <motion.span
                key="saved"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Salvo
              </motion.span>
            ) : (
              <motion.span
                key="save"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Salvar
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </div>

      {/* Warning banner */}
      <div className="flex items-center gap-3 rounded-xl border border-gold/20 bg-gold/5 px-4 py-3">
        <AlertTriangle className="h-4 w-4 shrink-0 text-gold" />
        <p className="text-[13px] text-gold/90">
          Alteracoes aqui impactam diretamente o comportamento dos agentes Hermes, Ares e Athena.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile">
        <TabsList variant="line" className="w-full justify-start border-b border-border-default pb-0">
          <TabsTrigger value="profile" className="gap-1.5 text-[13px]">
            <User className="h-4 w-4" />
            Perfil da Empresa
          </TabsTrigger>
          <TabsTrigger value="operational" className="gap-1.5 text-[13px]">
            <Settings className="h-4 w-4" />
            Configuracoes Operacionais
          </TabsTrigger>
          <TabsTrigger value="status" className="gap-1.5 text-[13px]">
            <Activity className="h-4 w-4" />
            Status do Sistema
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Perfil da Empresa */}
        <TabsContent value="profile" className="pt-6">
          <div className="space-y-6">
            <div className="card-surface overflow-hidden">
              <div className="relative border-b border-border-default px-6 py-4">
                <div
                  className="absolute left-0 right-0 top-0 h-[2px]"
                  style={{ background: `linear-gradient(90deg, ${COLORS.emerald}, transparent 60%)` }}
                />
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${COLORS.emerald}12` }}>
                    <Building2 className="h-4 w-4" style={{ color: COLORS.emerald }} />
                  </div>
                  <div>
                    <h2 className="font-title text-[15px] font-bold text-text-primary">Dados da Empresa</h2>
                    <p className="text-[11px] text-text-subtle">Informacoes basicas do seu negocio</p>
                  </div>
                </div>
              </div>
              <div className="space-y-5 p-6">
                <div className="space-y-1.5">
                  <Label className="text-[12px] font-medium text-text-muted">Nome da Empresa</Label>
                  <Input
                    value={config.name || ''}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className={INPUT_CLASS}
                    placeholder="Minha Empresa"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] font-medium text-text-muted">Tom de Voz do Agente</Label>
                  <Textarea
                    value={config.tone_of_voice || ''}
                    onChange={(e) => handleChange('tone_of_voice', e.target.value)}
                    rows={3}
                    className="rounded-xl border-border-default bg-[rgba(240,237,232,0.04)] text-text-primary placeholder:text-text-subtle transition-all duration-200 focus:border-accent/30 focus:ring-2 focus:ring-accent/10"
                    placeholder="Ex: Profissional e amigavel, usando linguagem simples..."
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 2: Configuracoes Operacionais */}
        <TabsContent value="operational" className="pt-6">
          <div className="space-y-6">
            {/* Metas */}
            <div className="card-surface overflow-hidden">
              <div className="relative border-b border-border-default px-6 py-4">
                <div
                  className="absolute left-0 right-0 top-0 h-[2px]"
                  style={{ background: `linear-gradient(90deg, ${COLORS.accent}, transparent 60%)` }}
                />
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${COLORS.accent}12` }}>
                    <Target className="h-4 w-4" style={{ color: COLORS.accent }} />
                  </div>
                  <div>
                    <h2 className="font-title text-[15px] font-bold text-text-primary">Metas</h2>
                    <p className="text-[11px] text-text-subtle">Defina os objetivos de performance</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-5 p-6 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-[12px] font-medium text-text-muted">ROAS Meta</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={config.target_roas || ''}
                    onChange={(e) => handleChange('target_roas', parseFloat(e.target.value))}
                    className={INPUT_CLASS}
                    placeholder="3.0"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] font-medium text-text-muted">CPL Maximo (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={config.target_cpl || ''}
                    onChange={(e) => handleChange('target_cpl', parseFloat(e.target.value))}
                    className={INPUT_CLASS}
                    placeholder="15.00"
                  />
                </div>
              </div>
            </div>

            {/* Orcamento */}
            <div className="card-surface overflow-hidden">
              <div className="relative border-b border-border-default px-6 py-4">
                <div
                  className="absolute left-0 right-0 top-0 h-[2px]"
                  style={{ background: `linear-gradient(90deg, ${COLORS.gold}, transparent 60%)` }}
                />
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${COLORS.gold}12` }}>
                    <Wallet className="h-4 w-4" style={{ color: COLORS.gold }} />
                  </div>
                  <div>
                    <h2 className="font-title text-[15px] font-bold text-text-primary">Orcamento</h2>
                    <p className="text-[11px] text-text-subtle">Controle os limites de gasto</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-5 p-6 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-[12px] font-medium text-text-muted">Limite Diario</Label>
                  <PriceInput
                    value={Math.round((config.daily_budget ?? 0) * 100)}
                    onChange={(cents) => handleChange('daily_budget', cents / 100)}
                    placeholder="500,00"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[12px] font-medium text-text-muted">Teto Absoluto do Cartao</Label>
                  <PriceInput
                    value={Math.round((config.card_limit ?? 0) * 100)}
                    onChange={(cents) => handleChange('card_limit', cents / 100)}
                    placeholder="10.000,00"
                  />
                  <p className="flex items-center gap-1 text-[11px] text-danger">
                    <AlertTriangle className="h-3 w-3" />
                    Nenhuma logica de ROAS pode ultrapassar este valor
                  </p>
                </div>
              </div>
            </div>

            {/* Comunicacao */}
            <div className="card-surface overflow-hidden">
              <div className="relative border-b border-border-default px-6 py-4">
                <div
                  className="absolute left-0 right-0 top-0 h-[2px]"
                  style={{ background: `linear-gradient(90deg, ${COLORS.violet}, transparent 60%)` }}
                />
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${COLORS.violet}12` }}>
                    <MessageSquare className="h-4 w-4" style={{ color: COLORS.violet }} />
                  </div>
                  <div>
                    <h2 className="font-title text-[15px] font-bold text-text-primary">Comunicacao</h2>
                    <p className="text-[11px] text-text-subtle">Telefone para alertas</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-1.5">
                  <Label className="text-[12px] font-medium text-text-muted">WhatsApp para Alertas</Label>
                  <Input
                    type="tel"
                    value={formatPhoneInput(config.whatsapp_alerts || '')}
                    onChange={(e) => handleChange('whatsapp_alerts', parsePhoneInput(e.target.value))}
                    className={INPUT_CLASS}
                    placeholder="(11) 99988-7766"
                  />
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Status do Sistema */}
        <TabsContent value="status" className="pt-6">
          <div className="space-y-6">
            {/* Readiness checklist */}
            <div className="card-surface overflow-hidden">
              <div className="relative border-b border-border-default px-6 py-4">
                <div
                  className="absolute left-0 right-0 top-0 h-[2px]"
                  style={{ background: `linear-gradient(90deg, ${COLORS.accent}, transparent 60%)` }}
                />
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${COLORS.accent}12` }}>
                    <CheckCircle className="h-4 w-4" style={{ color: COLORS.accent }} />
                  </div>
                  <div>
                    <h2 className="font-title text-[15px] font-bold text-text-primary">Checklist de Prontidao</h2>
                    <p className="text-[11px] text-text-subtle">Status da configuracao do sistema</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {readinessLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-accent" />
                  </div>
                ) : readiness ? (
                  <div className="space-y-3">
                    {Object.entries(readiness.checks).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded-xl bg-[rgba(255,255,255,0.02)] px-4 py-3 transition-colors"
                      >
                        <span className="text-[13px] text-text-primary">
                          {READINESS_LABELS[key] ?? key}
                        </span>
                        {value ? (
                          <span className="flex items-center gap-1.5 text-[12px] text-emerald">
                            <Check className="h-4 w-4" />
                            Configurado
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-[12px] text-danger">
                            <X className="h-4 w-4" />
                            Pendente
                          </span>
                        )}
                      </div>
                    ))}
                    <div className="mt-3 flex items-center gap-2 rounded-xl border px-4 py-3" style={{
                      borderColor: readiness.ready ? `${COLORS.emerald}30` : `${COLORS.gold}30`,
                      backgroundColor: readiness.ready ? `${COLORS.emerald}08` : `${COLORS.gold}08`,
                    }}>
                      {readiness.ready ? (
                        <CheckCircle className="h-4 w-4" style={{ color: COLORS.emerald }} />
                      ) : (
                        <AlertTriangle className="h-4 w-4" style={{ color: COLORS.gold }} />
                      )}
                      <span className="text-[13px]" style={{ color: readiness.ready ? COLORS.emerald : COLORS.gold }}>
                        {readiness.ready ? 'Sistema pronto para operar' : 'Configuracao incompleta'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="py-4 text-center text-[13px] text-text-subtle">
                    Nao foi possivel carregar o status de prontidao
                  </p>
                )}
              </div>
            </div>

            {/* Agent status */}
            <div>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
                Status dos Agentes
              </p>
              {agentsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-accent" />
                </div>
              ) : agentStatus && agentStatus.length > 0 ? (
                <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
                  {agentStatus.map((agent, i) => (
                    <AgentStatusCard key={agent.name} agent={agent} delay={i * 0.06} />
                  ))}
                </div>
              ) : (
                <p className="py-4 text-center text-[13px] text-text-subtle">
                  Nenhum agente encontrado
                </p>
              )}
            </div>

            {/* System health */}
            <div className="card-surface overflow-hidden">
              <div className="relative border-b border-border-default px-6 py-4">
                <div
                  className="absolute left-0 right-0 top-0 h-[2px]"
                  style={{ background: `linear-gradient(90deg, ${COLORS.emerald}, transparent 60%)` }}
                />
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: `${COLORS.emerald}12` }}>
                    <Activity className="h-4 w-4" style={{ color: COLORS.emerald }} />
                  </div>
                  <div>
                    <h2 className="font-title text-[15px] font-bold text-text-primary">Saude do Sistema</h2>
                    <p className="text-[11px] text-text-subtle">Status dos servicos em tempo real</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                {healthLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-5 w-5 animate-spin text-accent" />
                  </div>
                ) : systemHealth ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
                    {HEALTH_SERVICES.map(({ key, label }) => {
                      const up = systemHealth[key]
                      return (
                        <div key={key} className="flex items-center gap-2.5 rounded-xl bg-[rgba(255,255,255,0.03)] p-3">
                          <span className="relative flex h-3 w-3">
                            {up && (
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-75" />
                            )}
                            <span className={`relative inline-flex h-3 w-3 rounded-full ${up ? 'bg-emerald' : 'bg-danger'}`} />
                          </span>
                          <span className="text-[13px] text-text-muted">{label}</span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="py-4 text-center text-[13px] text-text-subtle">
                    Nao foi possivel verificar a saude do sistema
                  </p>
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
