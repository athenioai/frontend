'use client'

import { motion } from 'motion/react'
import { fadeInUp, staggerContainer, MOTION } from '@/lib/motion'
import { formatRelativeTime } from '@/lib/utils/format'
import { EmptyState } from '@/components/common/empty-state'
import {
  DollarSign,
  Crown,
  PauseCircle,
  AlertTriangle,
  UserCheck,
  TrendingUp,
  Bell,
} from 'lucide-react'
import type { Alert } from '@/lib/types'
import type { LucideIcon } from 'lucide-react'

const ALERT_CONFIG: Record<string, { icon: LucideIcon; color: string; label: string }> = {
  sale: { icon: DollarSign, color: '#34D399', label: 'Venda' },
  sale_confirmed: { icon: DollarSign, color: '#34D399', label: 'Venda Confirmada' },
  whale: { icon: Crown, color: '#4FD1C5', label: 'Whale' },
  whale_detected: { icon: Crown, color: '#4FD1C5', label: 'Whale Detectado' },
  campaign_paused: { icon: PauseCircle, color: '#E8C872', label: 'Campanha Pausada' },
  campaign_scaled: { icon: TrendingUp, color: '#4FD1C5', label: 'Escala' },
  sensor_failure: { icon: AlertTriangle, color: '#F07070', label: 'Falha' },
  human_requested: { icon: UserCheck, color: '#A78BFA', label: 'Humano Solicitado' },
  anomaly: { icon: AlertTriangle, color: '#F07070', label: 'Anomalia' },
}

interface AlertTimelineProps {
  alerts: Alert[]
}

export function AlertTimeline({ alerts }: AlertTimelineProps) {
  if (alerts.length === 0) {
    return (
      <EmptyState
        icon={Bell}
        title="Nenhum alerta"
        description="Alertas aparecerao aqui quando houver atividade importante."
      />
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="relative"
    >
      {/* Gradient connecting line */}
      <div
        className="absolute left-[19px] top-0 bottom-0 w-[2px]"
        style={{
          background: 'linear-gradient(180deg, rgba(79,209,197,0.20) 0%, transparent 100%)',
        }}
      />

      {/* Alert items */}
      <div className="space-y-0">
        {alerts.map((alert) => {
          const config = ALERT_CONFIG[alert.type] ?? {
            icon: Bell,
            color: '#A0AEC0',
            label: alert.type,
          }
          const Icon = config.icon

          return (
            <motion.div
              key={alert.id}
              variants={fadeInUp}
              transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
              className="relative flex gap-4 pb-8"
            >
              {/* Dot on the timeline */}
              <div
                className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-lg"
                style={{
                  backgroundColor: `${config.color}18`,
                  boxShadow: `0 0 16px ${config.color}20`,
                }}
              >
                <Icon
                  className="h-[18px] w-[18px]"
                  style={{ color: config.color }}
                />
              </div>

              {/* Content card */}
              <div className="card-surface min-w-0 flex-1 p-4 transition-all duration-200 hover:bg-[rgba(255,255,255,0.02)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <span
                      className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold"
                      style={{
                        backgroundColor: `${config.color}12`,
                        color: config.color,
                      }}
                    >
                      {config.label}
                    </span>
                    <p className="mt-2 text-[13px] leading-relaxed text-text-primary">
                      {alert.description}
                    </p>
                  </div>
                  <span className="shrink-0 text-[11px] text-text-subtle">
                    {formatRelativeTime(alert.created_at)}
                  </span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
