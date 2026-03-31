import { FunilChart } from '@/components/charts/funil-chart'
import { AnimateIn } from '@/components/ui/animate-in'
import type { FunilStats } from '@/lib/types'

export function FunilWidget({ stats }: { stats: FunilStats }) {
  return (
    <AnimateIn>
      <div className="card-surface h-full p-6">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.05em] text-text-muted">
          Funil de Vendas
        </p>
        <FunilChart stats={stats} compact />
      </div>
    </AnimateIn>
  )
}
