'use client'

import Link from 'next/link'
import { AnimateIn } from '@/components/ui/animate-in'
import { formatRelativeTime } from '@/lib/utils/format'
import type { ConversationSummary, Alert } from '@/lib/types'
import {
  MessageSquare,
  DollarSign,
  PauseCircle,
  TrendingUp,
  Crown,
  UserCheck,
  AlertTriangle,
} from 'lucide-react'

const ALERT_ICONS: Record<string, typeof DollarSign> = {
  sale: DollarSign,
  sale_confirmed: DollarSign,
  campaign_paused: PauseCircle,
  campaign_scaled: TrendingUp,
  whale: Crown,
  whale_detected: Crown,
  human_requested: UserCheck,
  anomaly: AlertTriangle,
  sensor_failure: AlertTriangle,
}

interface RecentActivityProps {
  conversations: ConversationSummary[]
  alerts: Alert[]
}

export function RecentActivity({ conversations, alerts }: RecentActivityProps) {
  return (
    <AnimateIn>
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        {/* Recent conversations */}
        <div className="card-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[13px] font-semibold text-text-primary">Ultimas Conversas</p>
            <Link href="/conversas" className="text-[11px] text-accent hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="space-y-1">
            {conversations.slice(0, 5).map((c) => (
              <Link
                key={c.id}
                href="/conversas"
                className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-[rgba(255,255,255,0.03)]"
              >
                <MessageSquare className="h-4 w-4 shrink-0 text-text-subtle" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-text-primary">{c.lead_name}</p>
                  <p className="truncate text-[11px] text-text-subtle">{c.last_message_preview}</p>
                </div>
                <span className="shrink-0 text-[11px] text-text-subtle">
                  {formatRelativeTime(c.last_message_at)}
                </span>
              </Link>
            ))}
            {conversations.length === 0 && (
              <p className="py-4 text-center text-[13px] text-text-subtle">Nenhuma conversa recente</p>
            )}
          </div>
        </div>

        {/* Recent alerts */}
        <div className="card-surface p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[13px] font-semibold text-text-primary">Ultimos Alertas</p>
            <Link href="/alertas" className="text-[11px] text-accent hover:underline">
              Ver todos
            </Link>
          </div>
          <div className="space-y-1">
            {alerts.slice(0, 5).map((a) => {
              const Icon = ALERT_ICONS[a.type] ?? AlertTriangle
              return (
                <Link
                  key={a.id}
                  href="/alertas"
                  className="flex items-center gap-3 rounded-xl p-2.5 transition-colors hover:bg-[rgba(255,255,255,0.03)]"
                >
                  <Icon className="h-4 w-4 shrink-0 text-text-subtle" />
                  <p className="min-w-0 flex-1 truncate text-[13px] text-text-muted">{a.description}</p>
                  <span className="shrink-0 text-[11px] text-text-subtle">
                    {formatRelativeTime(a.created_at)}
                  </span>
                </Link>
              )
            })}
            {alerts.length === 0 && (
              <p className="py-4 text-center text-[13px] text-text-subtle">Nenhum alerta recente</p>
            )}
          </div>
        </div>
      </div>
    </AnimateIn>
  )
}
