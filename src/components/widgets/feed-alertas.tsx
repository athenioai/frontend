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
  venda: '#34D399',
  campanha_pausada: '#E8C872',
  campanha_escalada: '#4FD1C5',
  baleia: '#A78BFA',
  humano_solicitado: '#E8C872',
  anomalia: '#F07070',
}

export function FeedAlertasWidget({ alerts }: { alerts: Alert[] }) {
  return (
    <AnimateIn>
      <div className="card-surface p-6">
        <p className="mb-5 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
          Feed de Alertas
        </p>
        <div className="max-h-72 space-y-1 overflow-y-auto pr-1">
          {alerts.map((alert) => {
            const Icon = ALERT_ICON_MAP[alert.tipo] ?? Shield
            const color = ALERT_COLOR_MAP[alert.tipo] ?? '#4FD1C5'
            return (
              <div
                key={alert.id}
                className="group flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-[rgba(255,255,255,0.02)]"
              >
                <div
                  className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform group-hover:scale-105"
                  style={{ background: `linear-gradient(135deg, ${color}15, ${color}08)` }}
                >
                  <Icon className="h-3.5 w-3.5" style={{ color }} />
                </div>
                <div className="min-w-0 flex-1 py-0.5">
                  <p className="text-[13px] leading-snug text-text-primary">{alert.descricao}</p>
                  <p className="mt-1 text-[11px] text-text-subtle">
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
