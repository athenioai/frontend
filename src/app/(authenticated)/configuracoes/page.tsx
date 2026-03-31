'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Save, AlertTriangle, CheckCircle } from 'lucide-react'
import type { Empresa } from '@/lib/types'

export default function ConfiguracoesPage() {
  const [config, setConfig] = useState<Partial<Empresa>>({})
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('athenio-config')
    if (stored) {
      setConfig(JSON.parse(stored))
    } else {
      import('@/lib/services/mock/data').then(({ mockEmpresas }) => {
        setConfig(mockEmpresas[0])
      })
    }
  }, [])

  function handleChange(field: keyof Empresa, value: string | number) {
    setConfig((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  function handleSave() {
    localStorage.setItem('athenio-config', JSON.stringify(config))
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      <h1 className="font-title text-2xl font-bold">Configurações</h1>

      <p className="flex items-center gap-2 text-sm text-warning">
        <AlertTriangle className="h-4 w-4" />
        Alterações aqui impactam o comportamento dos agentes
      </p>

      {/* Metas */}
      <div className="glass-card space-y-4">
        <h2 className="font-title text-lg font-bold">Metas</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-text-muted">ROAS Meta</Label>
            <Input
              type="number"
              step="0.1"
              value={config.roas_meta || ''}
              onChange={(e) => handleChange('roas_meta', parseFloat(e.target.value))}
              className="border-border-default bg-bg-input text-text-primary focus:border-accent"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-text-muted">CPL Alvo (R$)</Label>
            <Input
              type="number"
              step="0.50"
              value={config.cpl_alvo || ''}
              onChange={(e) => handleChange('cpl_alvo', parseFloat(e.target.value))}
              className="border-border-default bg-bg-input text-text-primary focus:border-accent"
            />
          </div>
        </div>
      </div>

      {/* Orçamento */}
      <div className="glass-card space-y-4">
        <h2 className="font-title text-lg font-bold">Orçamento</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-text-muted">Limite Diário (R$)</Label>
            <Input
              type="number"
              value={config.orcamento_diario || ''}
              onChange={(e) => handleChange('orcamento_diario', parseFloat(e.target.value))}
              className="border-border-default bg-bg-input text-text-primary focus:border-accent"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-text-muted">Teto Absoluto do Cartão (R$)</Label>
            <Input
              type="number"
              value={config.teto_cartao || ''}
              onChange={(e) => handleChange('teto_cartao', parseFloat(e.target.value))}
              className="border-border-default bg-bg-input text-text-primary focus:border-accent"
            />
            <p className="text-xs text-danger">Nenhuma lógica de ROAS pode ultrapassar este valor</p>
          </div>
        </div>
      </div>

      {/* Comunicação */}
      <div className="glass-card space-y-4">
        <h2 className="font-title text-lg font-bold">Comunicação</h2>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-text-muted">Tom de Voz do Agente</Label>
            <Textarea
              value={config.tom_de_voz || ''}
              onChange={(e) => handleChange('tom_de_voz', e.target.value)}
              rows={3}
              className="border-border-default bg-bg-input text-text-primary focus:border-accent"
              placeholder="Descreva como os agentes devem se comunicar..."
            />
          </div>
          <div className="space-y-2">
            <Label className="text-text-muted">WhatsApp para Alertas</Label>
            <Input
              type="tel"
              value={config.whatsapp_alertas || ''}
              onChange={(e) => handleChange('whatsapp_alertas', e.target.value)}
              className="border-border-default bg-bg-input text-text-primary focus:border-accent"
              placeholder="+5511999887766"
            />
          </div>
        </div>
      </div>

      {/* Empresa */}
      <div className="glass-card space-y-4">
        <h2 className="font-title text-lg font-bold">Empresa</h2>
        <div className="space-y-2">
          <Label className="text-text-muted">Nome da Empresa</Label>
          <Input
            value={config.nome || ''}
            onChange={(e) => handleChange('nome', e.target.value)}
            className="border-border-default bg-bg-input text-text-primary focus:border-accent"
          />
        </div>
      </div>

      <Button
        onClick={handleSave}
        className="rounded-full bg-accent px-8 font-semibold text-[#070C0C] shadow-[0_0_40px_rgba(79,209,197,0.3)] hover:bg-accent-light"
      >
        {saved ? (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Salvo com sucesso
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Salvar configurações
          </>
        )}
      </Button>
    </div>
  )
}
