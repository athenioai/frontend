import { DollarSign, Pause, TrendingUp, Star, User, Shield } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format'
import { AnimateIn } from '@/components/ui/animate-in'
import type { Alert, AlertTipo } from '@/lib/types'

const ALERT_ICON_MAP: Record<AlertTipo, typeof DollarSign> = {
  venda: DollarSign,
  campanha_pausada: Pause,
  campanha_escalada: TrendingUp,
  baleia: Star,
  humano_solicitado: User,
  anomalia: Shield,
}

const ALERT_COLOR_MAP: Record<AlertTipo, string> = {
  venda: '#4FD1C5',
  campanha_pausada: '#FBBF24',
  campanha_escalada: '#4FD1C5',
  baleia: '#A78BFA',
  humano_solicitado: '#FBBF24',
  anomalia: '#E07070',
}

export function FeedAlertasWidget({ alerts }: { alerts: Alert[] }) {
  return (
    <AnimateIn>
      <div className="card-surface p-6">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.05em] text-text-muted">
          Feed de Alertas
        </p>
        <div className="max-h-80 space-y-3 overflow-y-auto pr-2">
          {alerts.map((alert) => {
            const Icon = ALERT_ICON_MAP[alert.tipo] ?? Shield
            const color = ALERT_COLOR_MAP[alert.tipo] ?? '#4FD1C5'
            return (
              <div
                key={alert.id}
                className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-surface-2"
              >
                <div
                  className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` }}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color }} />
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
    </AnimateIn>
  )
}
