'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { CHART_COLORS } from '@/lib/constants/theme'

interface LineChartSimpleProps {
  data: Record<string, unknown>[]
  xKey: string
  yKey: string
  height?: number
}

export function LineChartSimple({ data, xKey, yKey, height = 250 }: LineChartSimpleProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ left: 10, right: 10 }}>
        <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
        <XAxis
          dataKey={xKey}
          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: CHART_COLORS.tooltipBg,
            border: `1px solid ${CHART_COLORS.primary}33`,
            borderRadius: 8,
            color: '#fff',
          }}
        />
        <Line
          type="monotone"
          dataKey={yKey}
          stroke={CHART_COLORS.primary}
          strokeWidth={2}
          dot={{ fill: CHART_COLORS.primary, r: 3 }}
          activeDot={{ r: 5, fill: CHART_COLORS.secondary }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
