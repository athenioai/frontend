'use client'

import { GaugeChart } from '@/components/charts/gauge-chart'
import { Activity, TrendingUp, Zap } from 'lucide-react'
import { formatPercent } from '@/lib/utils/format'
import { AnimateIn } from '@/components/ui/animate-in'
import type { HealthScoreData } from '@/lib/types'

export function HealthScoreWidget({ data }: { data: HealthScoreData }) {
  const indicators = [
    {
      icon: Activity,
      label: 'Mensagens',
      value: `${data.volume_mensagens.atual}`,
      change: `${data.volume_mensagens.variacao_percent > 0 ? '+' : ''}${data.volume_mensagens.variacao_percent.toFixed(1)}%`,
      positive: data.volume_mensagens.variacao_percent > 0,
    },
    {
      icon: TrendingUp,
      label: 'Conversão',
      value: formatPercent(data.taxa_conversao),
      change: null,
      positive: true,
    },
    {
      icon: Zap,
      label: 'Latência',
      value: `${(data.latencia_media_ms / 1000).toFixed(1)}s`,
      change: null,
      positive: data.latencia_media_ms < 2000,
    },
  ]

  return (
    <AnimateIn>
      <div className="card-elevated flex h-full flex-col items-center p-6">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
          Health Score
        </p>

        <GaugeChart value={data.score} />

        <div className="mt-5 grid w-full grid-cols-3 gap-2">
          {indicators.map(({ icon: Icon, label, value, change, positive }) => (
            <div key={label} className="rounded-lg border border-border-default bg-[rgba(255,255,255,0.02)] p-2.5 text-center">
              <Icon className="mx-auto mb-1.5 h-3.5 w-3.5 text-text-subtle" />
              <p className="text-[10px] font-medium uppercase tracking-wider text-text-subtle">{label}</p>
              <p className="mt-0.5 font-display text-[15px] text-text-primary">{value}</p>
              {change && (
                <p className={`mt-0.5 text-[10px] font-medium ${positive ? 'text-emerald' : 'text-danger'}`}>
                  {change}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </AnimateIn>
  )
}
