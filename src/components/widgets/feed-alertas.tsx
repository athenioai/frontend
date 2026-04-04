'use client'

import { DollarSign, Pause, TrendingUp, Star, User, Shield, AlertTriangle } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format'
import { AnimateIn } from '@/components/ui/animate-in'
import type { Alert, AlertType } from '@/lib/types'

const ALERT_CONFIG: Record<AlertType, { icon: typeof DollarSign; color: string; label: string }> = {
  sale: { icon: DollarSign, color: '#34D399', label: 'Venda' },
  sale_confirmed: { icon: DollarSign, color: '#34D399', label: 'Venda Confirmada' },
  campaign_paused: { icon: Pause, color: '#E8C872', label: 'Campanha' },
  campaign_scaled: { icon: TrendingUp, color: '#4FD1C5', label: 'Escala' },
  whale: { icon: Star, color: '#A78BFA', label: 'Baleia' },
  whale_detected: { icon: Star, color: '#4FD1C5', label: 'Whale' },
  human_requested: { icon: User, color: '#E8C872', label: 'Humano' },
  anomaly: { icon: Shield, color: '#F07070', label: 'Alerta' },
  sensor_failure: { icon: AlertTriangle, color: '#F07070', label: 'Falha' },
}

function groupByTime(alerts: Alert[]): { label: string; items: Alert[] }[] {
  const now = Date.now()
  const today: Alert[] = []
  const yesterday: Alert[] = []
  const older: Alert[] = []

  for (const alert of alerts) {
    const diff = now - new Date(alert.created_at).getTime()
    const hours = diff / (1000 * 60 * 60)
    if (hours < 24) today.push(alert)
    else if (hours < 48) yesterday.push(alert)
    else older.push(alert)
  }

  const groups: { label: string; items: Alert[] }[] = []
  if (today.length > 0) groups.push({ label: 'Hoje', items: today })
  if (yesterday.length > 0) groups.push({ label: 'Ontem', items: yesterday })
  if (older.length > 0) groups.push({ label: 'Anteriores', items: older })
  return groups
}

export function FeedAlertasWidget({ alerts }: { alerts: Alert[] }) {
  const groups = groupByTime(alerts)

  return (
    <AnimateIn>
      <div className="card-surface p-6">
        <div className="max-h-80 space-y-5 overflow-y-auto pr-1">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-subtle/60">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.items.map((alert) => {
                  const config = ALERT_CONFIG[alert.type] ?? ALERT_CONFIG.anomaly
                  const Icon = config.icon
                  return (
                    <div
                      key={alert.id}
                      className="group flex items-start gap-3 rounded-xl p-3 transition-all duration-200 hover:bg-[rgba(255,255,255,0.03)]"
                    >
                      <div
                        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105"
                        style={{ background: `linear-gradient(135deg, ${config.color}18, ${config.color}08)` }}
                      >
                        <Icon className="h-3.5 w-3.5" style={{ color: config.color }} />
                      </div>
                      <div className="min-w-0 flex-1 py-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="rounded-md px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
                            style={{ backgroundColor: `${config.color}12`, color: config.color }}
                          >
                            {config.label}
                          </span>
                          <span className="text-[11px] text-text-subtle">
                            {formatRelativeTime(alert.created_at)}
                          </span>
                        </div>
                        <p className="mt-1 text-[13px] leading-snug text-text-muted group-hover:text-text-primary transition-colors">
                          {alert.description}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AnimateIn>
  )
}
