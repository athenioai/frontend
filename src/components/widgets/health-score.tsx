'use client'

import { GaugeChart } from '@/components/charts/gauge-chart'
import { Activity, TrendingUp, Zap } from 'lucide-react'
import { formatPercent } from '@/lib/utils/format'
import type { HealthScoreData } from '@/lib/types'

export function HealthScoreWidget({ data }: { data: HealthScoreData }) {
  const indicators = [
    {
      icon: Activity,
      label: 'Volume msgs',
      value: `${data.volume_mensagens.atual}`,
      change: `${data.volume_mensagens.variacao_percent > 0 ? '+' : ''}${data.volume_mensagens.variacao_percent.toFixed(1)}%`,
      positive: data.volume_mensagens.variacao_percent > 0,
    },
    {
      icon: TrendingUp,
      label: 'Taxa conversão',
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
    <div className="glass-card flex flex-col items-center">
      <p className="mb-3 text-sm font-medium uppercase tracking-[0.12em] text-text-muted">
        Health Score
      </p>
      <GaugeChart value={data.score} />
      <div className="mt-4 grid w-full grid-cols-3 gap-3">
        {indicators.map(({ icon: Icon, label, value, change, positive }) => (
          <div key={label} className="text-center">
            <Icon className="mx-auto mb-1 h-4 w-4 text-text-subtle" />
            <p className="text-xs text-text-subtle">{label}</p>
            <p className="font-title text-sm font-bold text-text-primary">{value}</p>
            {change && (
              <p className={`text-xs ${positive ? 'text-success' : 'text-danger'}`}>{change}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
