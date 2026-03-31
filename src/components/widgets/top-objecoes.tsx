import { BarChartHorizontal } from '@/components/charts/bar-chart-horizontal'
import { AnimateIn } from '@/components/ui/animate-in'
import type { ObjecaoCount } from '@/lib/types'

export function TopObjecoesWidget({ data }: { data: ObjecaoCount[] }) {
  const chartData = data.map((d) => ({ label: d.objecao, value: d.count }))

  return (
    <AnimateIn>
      <div className="card-surface h-full p-6">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.05em] text-text-muted">
          Top Objeções dos Leads
        </p>
        <BarChartHorizontal data={chartData} height={200} />
      </div>
    </AnimateIn>
  )
}
