'use client'

import { DollarSign, TrendingUp, BarChart3, Clock } from 'lucide-react'
import { CountUp } from '@/components/ui/count-up'
import { AnimateIn } from '@/components/ui/animate-in'

const ICON_MAP = {
  DollarSign,
  TrendingUp,
  BarChart3,
  Clock,
} as const

type IconName = keyof typeof ICON_MAP

interface KpiCardProps {
  label: string
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  change?: number
  icon: IconName
  accentColor?: string
  delay?: number
}

export function KpiCard({
  label,
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  change,
  icon,
  accentColor = 'var(--color-accent)',
  delay = 0,
}: KpiCardProps) {
  const Icon = ICON_MAP[icon]
  return (
    <AnimateIn delay={delay}>
      <div className="card-surface card-surface-interactive p-5">
        <div className="mb-2 flex items-center gap-2">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 12%, transparent)` }}
          >
            <Icon className="h-4 w-4" style={{ color: accentColor }} />
          </div>
          <span className="text-xs font-medium uppercase tracking-[0.05em] text-text-subtle">{label}</span>
        </div>
        <p className="font-title text-2xl font-bold text-text-primary">
          <CountUp value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
        </p>
        {change !== undefined && (
          <p className={`mt-1 text-xs font-medium ${change >= 0 ? 'text-success' : 'text-danger'}`}>
            {change >= 0 ? '+' : ''}{change.toFixed(1)}%
          </p>
        )}
      </div>
    </AnimateIn>
  )
}
