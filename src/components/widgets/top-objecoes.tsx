import { BarChartHorizontal } from '@/components/charts/bar-chart-horizontal'
import { AnimateIn } from '@/components/ui/animate-in'
import type { ObjecaoCount } from '@/lib/types'

export function TopObjecoesWidget({ data }: { data: ObjecaoCount[] }) {
  const chartData = data.map((d) => ({ label: d.objecao, value: d.count }))

  return (
    <AnimateIn>
      <div className="card-surface h-full p-6">
        <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
          Top Objeções
        </p>
        <BarChartHorizontal data={chartData} height={200} />
      </div>
    </AnimateIn>
  )
}
