'use client'

import { useState, useEffect, useTransition } from 'react'
import { FunilChart } from '@/components/charts/funil-chart'
import { Badge } from '@/components/ui/badge'
import { formatPercent } from '@/lib/utils/format'
import { getFunilData } from './actions'
import type { FunilStats, Lead } from '@/lib/types'

type Periodo = '1d' | '7d' | '30d'

export default function FunilPage() {
  const [periodo, setPeriodo] = useState<Periodo>('30d')
  const [stats, setStats] = useState<FunilStats | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [expandido, setExpandido] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    startTransition(async () => {
      const data = await getFunilData(periodo)
      if (data) {
        setStats(data.stats)
        setLeads(data.leads)
      }
    })
  }, [periodo])

  if (!stats) return <div className="text-text-muted">Carregando funil...</div>

  const stages = [
    { key: 'captados', label: 'Leads Captados', filter: 'captado' },
    { key: 'qualificados', label: 'Qualificados', filter: 'qualificado' },
    { key: 'negociacao', label: 'Em Negociação', filter: 'negociacao' },
    { key: 'convertidos', label: 'Convertidos', filter: 'convertido' },
  ] as const

  const taxas = [
    stats.taxas.captado_qualificado,
    stats.taxas.qualificado_negociacao,
    stats.taxas.negociacao_convertido,
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-title text-2xl font-bold">Funil de Vendas</h1>
        <div className="flex gap-1 rounded-lg border border-border-default p-1">
          {(['1d', '7d', '30d'] as Periodo[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                periodo === p
                  ? 'bg-accent text-[#070C0C]'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {p === '1d' ? 'Hoje' : p === '7d' ? '7 dias' : '30 dias'}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card">
        <FunilChart stats={stats} />
      </div>

      {/* Expandable stages */}
      <div className="space-y-3">
        {stages.map((stage, i) => {
          const stageLeads = leads.filter((l) => l.estagio_funil === stage.filter)
          const isOpen = expandido === stage.key

          return (
            <div key={stage.key} className="glass-card cursor-pointer" onClick={() => setExpandido(isOpen ? null : stage.key)}>
              <div className="flex items-center justify-between">
                <span className="font-medium">{stage.label}</span>
                <div className="flex items-center gap-3">
                  <span className="font-title text-lg font-bold text-accent">
                    {stats[stage.key]}
                  </span>
                  {i < taxas.length && (
                    <span className="text-xs text-text-subtle">
                      perda: {formatPercent(1 - taxas[i])}
                    </span>
                  )}
                </div>
              </div>
              {isOpen && stageLeads.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-border-default pt-4">
                  {stageLeads.map((lead) => (
                    <div key={lead.id} className="flex items-center justify-between text-sm">
                      <span>{lead.nome}</span>
                      <Badge variant="outline" className="border-border-default text-text-muted">
                        {lead.temperatura}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
