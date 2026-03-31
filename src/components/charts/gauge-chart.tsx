'use client'

import { PieChart, Pie, Cell } from 'recharts'
import { getHealthScoreColor } from '@/lib/constants/theme'

interface GaugeChartProps {
  value: number
  size?: number
}

export function GaugeChart({ value, size = 200 }: GaugeChartProps) {
  const color = getHealthScoreColor(value)
  const data = [
    { value: value },
    { value: 100 - value },
  ]

  return (
    <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
      <PieChart width={size} height={size}>
        <Pie
          data={data}
          cx={size / 2}
          cy={size / 2}
          startAngle={180}
          endAngle={0}
          innerRadius={size * 0.32}
          outerRadius={size * 0.42}
          dataKey="value"
          stroke="none"
        >
          <Cell fill={color} />
          <Cell fill="rgba(255,255,255,0.05)" />
        </Pie>
      </PieChart>
      <div className="absolute inset-0 flex items-end justify-center pb-2">
        <span className="font-title text-3xl font-bold" style={{ color }}>
          {value}
        </span>
      </div>
    </div>
  )
}
