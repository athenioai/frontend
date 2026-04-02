'use client'

import { formatNumber, formatPercent } from '@/lib/utils/format'
import { COLORS } from '@/lib/constants/theme'
import type { FunnelStats } from '@/lib/types'

interface FunilChartProps {
  stats: FunnelStats
  compact?: boolean
}

const STAGES = [
  { key: 'captured', label: 'Captados', icon: '◉' },
  { key: 'qualified', label: 'Qualificados', icon: '◈' },
  { key: 'negotiation', label: 'Negociação', icon: '◆' },
  { key: 'converted', label: 'Convertidos', icon: '★' },
] as const

const STAGE_COLORS = [COLORS.accent, '#3BBEB2', COLORS.emerald, COLORS.gold]

export function FunilChart({ stats, compact = false }: FunilChartProps) {
  const max = stats.captured || 1
  const totalConversion = stats.captured > 0 ? stats.converted / stats.captured : 0
  const rates = [
    stats.rates.captured_to_qualified,
    stats.rates.qualified_to_negotiation,
    stats.rates.negotiation_to_converted,
  ]

  return (
    <div>
      {/* Conversion highlight */}
      <div className="mb-5 flex items-baseline gap-3">
        <span className="font-title text-[28px] font-bold text-text-primary">
          {formatPercent(totalConversion)}
        </span>
        <span className="text-[12px] text-text-subtle">taxa de conversão total</span>
      </div>

      {/* Stages */}
      <div className="space-y-4">
        {STAGES.map((stage, i) => {
          const value = stats[stage.key]
          const width = Math.max((value / max) * 100, 12)
          const color = STAGE_COLORS[i]

          return (
            <div key={stage.key}>
              <div className="mb-1.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded-md text-[10px]"
                    style={{ backgroundColor: `${color}18`, color }}
                  >
                    {stage.icon}
                  </span>
                  <span className={`font-medium text-text-muted ${compact ? 'text-[12px]' : 'text-[13px]'}`}>
                    {stage.label}
                  </span>
                </div>
                <span className={`font-title font-bold text-text-primary ${compact ? 'text-[14px]' : 'text-[17px]'}`}>
                  {formatNumber(value)}
                </span>
              </div>

              {/* Bar */}
              <div className="h-7 overflow-hidden rounded-lg bg-[rgba(240,237,232,0.04)]">
                <div
                  className="flex h-full items-center rounded-lg transition-all duration-700 ease-out"
                  style={{
                    width: `${width}%`,
                    background: `linear-gradient(90deg, ${color}, ${color}60)`,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.1)`,
                  }}
                />
              </div>

              {/* Conversion connector */}
              {i < rates.length && (
                <div className="ml-2 mt-1 flex items-center gap-1.5">
                  <div className="h-3 w-[1px] bg-border-default" />
                  <span className="text-[10px] font-medium text-text-subtle">
                    ↓ {formatPercent(rates[i])}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
