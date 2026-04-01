'use client'

import { formatNumber, formatPercent } from '@/lib/utils/format'
import { COLORS } from '@/lib/constants/theme'
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

const STAGE_COLORS = [COLORS.accent, '#3BBEB2', COLORS.emerald, COLORS.gold]

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
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className={`font-medium text-text-muted ${compact ? 'text-[12px]' : 'text-[13px]'}`}>
                {stage.label}
              </span>
              <span className={`font-title font-bold text-text-primary ${compact ? 'text-[14px]' : 'text-[17px]'}`}>
                {formatNumber(value)}
              </span>
            </div>
            <div className="h-8 overflow-hidden rounded-lg bg-[rgba(240,237,232,0.04)]">
              <div
                className="flex h-full items-center rounded-lg px-3 transition-all duration-700 ease-out"
                style={{
                  width: `${width}%`,
                  background: `linear-gradient(90deg, ${STAGE_COLORS[i]}, ${STAGE_COLORS[i]}90)`,
                }}
              />
            </div>
            {i < taxas.length && (
              <p className="mt-1 text-right text-[11px] text-text-subtle">
                {formatPercent(taxas[i])} para próxima etapa
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
