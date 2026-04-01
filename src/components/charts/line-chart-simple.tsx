'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { CHART_COLORS, COLORS } from '@/lib/constants/theme'

interface LineChartSimpleProps {
  data: Record<string, unknown>[]
  xKey: string
  yKey: string
  height?: number
}

export function LineChartSimple({ data, xKey, yKey, height = 250 }: LineChartSimpleProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ left: 10, right: 10, top: 5, bottom: 5 }}>
        <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
        <XAxis
          dataKey={xKey}
          tick={{ fill: COLORS.textSubtle, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: COLORS.textSubtle, fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: COLORS.surface1,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 10,
            color: COLORS.textPrimary,
            fontSize: 12,
          }}
        />
        <Line
          type="monotone"
          dataKey={yKey}
          stroke={CHART_COLORS.primary}
          strokeWidth={2}
          dot={{ fill: CHART_COLORS.primary, r: 3, stroke: COLORS.surface1, strokeWidth: 2 }}
          activeDot={{ r: 5, fill: CHART_COLORS.primary, stroke: COLORS.surface1, strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
