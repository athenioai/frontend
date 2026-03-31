import { BarChartHorizontal } from '@/components/charts/bar-chart-horizontal'
import type { ObjecaoCount } from '@/lib/types'

export function TopObjecoesWidget({ data }: { data: ObjecaoCount[] }) {
  const chartData = data.map((d) => ({ label: d.objecao, value: d.count }))

  return (
    <div className="glass-card">
      <p className="mb-4 text-sm font-medium uppercase tracking-[0.12em] text-text-muted">
        Top Objeções dos Leads
      </p>
      <BarChartHorizontal data={chartData} height={200} />
    </div>
  )
}
