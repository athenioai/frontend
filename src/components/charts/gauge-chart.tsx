'use client'

import { getHealthScoreColor } from '@/lib/constants/theme'
import { CountUp } from '@/components/ui/count-up'

interface GaugeChartProps {
  value: number
  size?: number
}

export function GaugeChart({ value, size = 160 }: GaugeChartProps) {
  const color = getHealthScoreColor(value)
  const strokeWidth = 10
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = (value / 100) * circumference
  const offset = circumference - progress

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(240, 237, 232, 0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 6px ${color}40)` }}
        />
      </svg>
      {/* Center number */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-title text-[32px] font-bold leading-none" style={{ color }}>
          <CountUp value={value} decimals={0} />
        </span>
        <span className="mt-1 text-[10px] font-medium uppercase tracking-[0.1em] text-text-subtle">
          de 100
        </span>
      </div>
    </div>
  )
}
