'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { CHART_COLORS, COLORS } from '@/lib/constants/theme'

interface BarChartHorizontalProps {
  data: { label: string; value: number }[]
  height?: number
}

export function BarChartHorizontal({ data, height = 250 }: BarChartHorizontalProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ left: 20, right: 20 }}>
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="label"
          width={140}
          tick={{ fill: COLORS.textMuted, fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: CHART_COLORS.tooltipBg,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 10,
            color: COLORS.textPrimary,
            fontSize: 12,
          }}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={CHART_COLORS.primary}
              fillOpacity={1 - i * 0.15}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
