'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { formatCurrency } from '@/lib/utils/format'
import { CHART_COLORS } from '@/lib/constants/theme'
import type { LtvCacData } from '@/lib/types'

export function LtvCacWidget({ data }: { data: LtvCacData }) {
  return (
    <div className="glass-card">
      <div className="mb-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-text-subtle">LTV Médio</p>
          <p className="font-title text-2xl font-bold text-accent">{formatCurrency(data.ltv)}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-text-subtle">CAC</p>
          <p className="font-title text-2xl font-bold text-text-primary">{formatCurrency(data.cac)}</p>
        </div>
      </div>

      <p className="mb-2 text-xs text-text-subtle">LTV individual — últimos clientes</p>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart data={data.historico}>
          <XAxis
            dataKey="nome"
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            interval={0}
            angle={-20}
            textAnchor="end"
            height={40}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{
              background: CHART_COLORS.tooltipBg,
              border: `1px solid ${CHART_COLORS.primary}33`,
              borderRadius: 8,
              color: '#fff',
              fontSize: 12,
            }}
            formatter={(value) => [formatCurrency(Number(value)), 'LTV']}
          />
          <Bar dataKey="valor_total" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} barSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
