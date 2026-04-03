'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Settings, Save, CheckCircle, AlertTriangle, Target, Wallet, MessageSquare, Building2, Loader2 } from 'lucide-react'
import { COLORS } from '@/lib/constants/theme'
import type { Company } from '@/lib/types'

const INPUT_CLASS = "h-11 rounded-xl border-border-default bg-[rgba(240,237,232,0.04)] text-text-primary placeholder:text-text-subtle transition-all duration-200 focus:border-accent/30 focus:ring-2 focus:ring-accent/10"

function formatCurrencyInput(value: number | undefined): string {
  if (value === undefined || isNaN(value)) return ''
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function parseCurrencyInput(raw: string): number {
  const clean = raw.replace(/\./g, '').replace(',', '.')
  const num = parseFloat(clean)
  return isNaN(num) ? 0 : num
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

  useEffect(() => {
    async function loadConfig() {
      try {
        const res = await fetch('/api/config')
        if (res.ok) {
          const data = await res.json()
          setConfig(data)
        }
      } catch {
        // Fallback: load from localStorage if API fails
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
      // Also save to localStorage as fallback
      localStorage.setItem('athenio-config', JSON.stringify(config))
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      // Fallback to localStorage
      localStorage.setItem('athenio-config', JSON.stringify(config))
      setSaved(true)
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
            <h1 className="font-title text-[22px] font-bold text-text-primary">Configurações</h1>
            <p className="text-[13px] text-text-muted">Ajuste o comportamento dos agentes</p>
          </div>
        </div>

        {/* Save button — top right */}
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
          Alterações aqui impactam diretamente o comportamento dos agentes Hermes, Ares e Athena.
        </p>
      </div>

      {/* Sections */}
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
              <Label className="text-[12px] font-medium text-text-muted">CPL Alvo (R$)</Label>
              <Input
                type="text"
                inputMode="decimal"
                value={formatCurrencyInput(config.target_cpl)}
                onChange={(e) => handleChange('target_cpl', parseCurrencyInput(e.target.value))}
                className={INPUT_CLASS}
                placeholder="15,00"
              />
            </div>
          </div>
        </div>

        {/* Orçamento */}
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
                <h2 className="font-title text-[15px] font-bold text-text-primary">Orçamento</h2>
                <p className="text-[11px] text-text-subtle">Controle os limites de gasto</p>
              </div>
            </div>
          </div>
          <div className="grid gap-5 p-6 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-[12px] font-medium text-text-muted">Limite Diário (R$)</Label>
              <Input
                type="text"
                inputMode="decimal"
                value={formatCurrencyInput(config.daily_budget)}
                onChange={(e) => handleChange('daily_budget', parseCurrencyInput(e.target.value))}
                className={INPUT_CLASS}
                placeholder="500,00"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[12px] font-medium text-text-muted">Teto Absoluto do Cartão (R$)</Label>
              <Input
                type="text"
                inputMode="decimal"
                value={formatCurrencyInput(config.card_limit)}
                onChange={(e) => handleChange('card_limit', parseCurrencyInput(e.target.value))}
                className={INPUT_CLASS}
                placeholder="10.000,00"
              />
              <p className="flex items-center gap-1 text-[11px] text-danger">
                <AlertTriangle className="h-3 w-3" />
                Nenhuma lógica de ROAS pode ultrapassar este valor
              </p>
            </div>
          </div>
        </div>

        {/* Comunicação */}
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
                <h2 className="font-title text-[15px] font-bold text-text-primary">Comunicação</h2>
                <p className="text-[11px] text-text-subtle">Personalize como os agentes se comunicam</p>
              </div>
            </div>
          </div>
          <div className="space-y-5 p-6">
            <div className="space-y-1.5">
              <Label className="text-[12px] font-medium text-text-muted">Tom de Voz do Agente</Label>
              <Textarea
                value={config.tone_of_voice || ''}
                onChange={(e) => handleChange('tone_of_voice', e.target.value)}
                rows={3}
                className="rounded-xl border-border-default bg-[rgba(240,237,232,0.04)] text-text-primary placeholder:text-text-subtle transition-all duration-200 focus:border-accent/30 focus:ring-2 focus:ring-accent/10"
                placeholder="Ex: Profissional e amigável, usando linguagem simples..."
              />
            </div>
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

        {/* Empresa */}
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
                <h2 className="font-title text-[15px] font-bold text-text-primary">Empresa</h2>
                <p className="text-[11px] text-text-subtle">Informações da sua empresa</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-1.5">
              <Label className="text-[12px] font-medium text-text-muted">Nome da Empresa</Label>
              <Input
                value={config.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
                className={INPUT_CLASS}
                placeholder="Minha Empresa"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
