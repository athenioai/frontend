'use client'

import { formatNumber, formatPercent } from '@/lib/utils/format'
import type { FunilStats } from '@/lib/types'

interface FunilChartProps {
  stats: FunilStats
  compact?: boolean
}

const STAGES = [
  { key: 'captados', label: 'Leads Captados' },
  { key: 'qualificados', label: 'Qualificados' },
  { key: 'negociacao', label: 'Em Negociação' },
  { key: 'convertidos', label: 'Convertidos' },
] as const

const STAGE_COLORS = ['#4FD1C5', '#3BBEB2', '#27A89C', '#0F3D3E']

export function FunilChart({ stats, compact = false }: FunilChartProps) {
  const max = stats.captados || 1
  const taxas = [
    stats.taxas.captado_qualificado,
    stats.taxas.qualificado_negociacao,
    stats.taxas.negociacao_convertido,
  ]

  return (
    <div className="space-y-3">
      {STAGES.map((stage, i) => {
        const value = stats[stage.key]
        const width = Math.max((value / max) * 100, 15)

        return (
          <div key={stage.key}>
            <div className="mb-1 flex items-baseline justify-between">
              <span className={`font-medium text-text-muted ${compact ? 'text-xs' : 'text-sm'}`}>
                {stage.label}
              </span>
              <span className={`font-title font-bold text-text-primary ${compact ? 'text-sm' : 'text-lg'}`}>
                {formatNumber(value)}
              </span>
            </div>
            <div className="h-8 overflow-hidden rounded-lg bg-white/5">
              <div
                className="flex h-full items-center rounded-lg px-3 transition-all duration-500"
                style={{ width: `${width}%`, background: STAGE_COLORS[i] }}
              />
            </div>
            {i < taxas.length && (
              <p className="mt-1 text-right text-xs text-text-subtle">
                {formatPercent(taxas[i])} para próxima etapa
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
