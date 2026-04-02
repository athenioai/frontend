import { FunilChart } from '@/components/charts/funil-chart'
import { AnimateIn } from '@/components/ui/animate-in'
import type { FunnelStats } from '@/lib/types'

export function FunilWidget({ stats }: { stats: FunnelStats }) {
  return (
    <AnimateIn>
      <div className="card-surface h-full p-6">
        <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
          Funil de Vendas
        </p>
        <FunilChart stats={stats} compact />
      </div>
    </AnimateIn>
  )
}
