import { DollarSign, Pause, TrendingUp, Star, User, Shield } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format'
import type { Alert, AlertTipo } from '@/lib/types'

const ALERT_ICON_MAP: Record<AlertTipo, typeof DollarSign> = {
  venda: DollarSign,
  campanha_pausada: Pause,
  campanha_escalada: TrendingUp,
  baleia: Star,
  humano_solicitado: User,
  anomalia: Shield,
}

export function FeedAlertasWidget({ alerts }: { alerts: Alert[] }) {
  return (
    <div className="glass-card">
      <p className="mb-4 text-sm font-medium uppercase tracking-[0.12em] text-text-muted">
        Feed de Alertas
      </p>
      <div className="max-h-80 space-y-3 overflow-y-auto pr-2">
        {alerts.map((alert) => {
          const Icon = ALERT_ICON_MAP[alert.tipo] ?? Shield
          return (
            <div key={alert.id} className="flex items-start gap-3">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10">
                <Icon className="h-3.5 w-3.5 text-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-text-primary">{alert.descricao}</p>
                <p className="text-xs text-text-subtle">
                  {formatRelativeTime(alert.created_at)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
