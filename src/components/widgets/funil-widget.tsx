import { FunilChart } from '@/components/charts/funil-chart'
import type { FunilStats } from '@/lib/types'

export function FunilWidget({ stats }: { stats: FunilStats }) {
  return (
    <div className="glass-card">
      <p className="mb-4 text-sm font-medium uppercase tracking-[0.12em] text-text-muted">
        Funil de Vendas
      </p>
      <FunilChart stats={stats} compact />
    </div>
  )
}
