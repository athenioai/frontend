import { Clock } from 'lucide-react'
import { formatNumber } from '@/lib/utils/format'

export function EconomiaTempoWidget({ horas }: { horas: number }) {
  return (
    <div className="glass-card flex items-center gap-6">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-accent/10">
        <Clock className="h-7 w-7 text-accent" />
      </div>
      <div>
        <p className="text-sm text-text-muted">Este mês, a Athenio economizou</p>
        <p className="font-title text-3xl font-bold text-accent">
          {formatNumber(horas)} horas
        </p>
        <p className="text-sm text-text-subtle">de trabalho humano</p>
      </div>
    </div>
  )
}
