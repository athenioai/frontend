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
      <div className="card-surface card-surface-interactive group p-5">
        {/* Icon + label row */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-subtle">
            {label}
          </span>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            style={{ backgroundColor: `color-mix(in srgb, ${accentColor} 10%, transparent)` }}
          >
            <Icon
              className="h-[14px] w-[14px] transition-transform group-hover:scale-110"
              style={{ color: accentColor }}
            />
          </div>
        </div>

        {/* Value — serif for numbers */}
        <p className="font-title text-[28px] font-bold leading-none text-text-primary">
          <CountUp value={value} prefix={prefix} suffix={suffix} decimals={decimals} />
        </p>

        {/* Change badge */}
        {change !== undefined && (
          <div className="mt-2.5 flex items-center gap-1">
            <span
              className={`inline-block h-1 w-1 rounded-full ${change >= 0 ? 'bg-emerald' : 'bg-danger'}`}
            />
            <span className={`text-[11px] font-medium ${change >= 0 ? 'text-emerald' : 'text-danger'}`}>
              {change >= 0 ? '+' : ''}{change.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
    </AnimateIn>
  )
}
