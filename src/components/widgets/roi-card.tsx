'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '@/lib/utils/format'
import { CountUp } from '@/components/ui/count-up'
import { AnimateIn } from '@/components/ui/animate-in'
import type { RoiTotal } from '@/lib/types'

export function RoiCard({ initial }: { initial: RoiTotal }) {
  const [roi, setRoi] = useState(initial)

  useEffect(() => {
    const interval = setInterval(() => {
      setRoi((prev) => ({
        ...prev,
        retorno: prev.retorno + Math.random() * 50,
        roas: (prev.retorno + Math.random() * 50) / prev.investido,
      }))
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const sparkData = roi.historico_7d.map((v, i) => ({ day: i, value: v }))

  return (
    <AnimateIn className="h-full">
      <div className="card-hero relative flex h-full flex-col justify-between p-8 lg:p-10">
        <div className="relative z-10">
          {/* Top: label + hero number */}
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em] text-accent/70">
            Retorno sobre investimento
          </p>

          <div className="flex items-baseline gap-2">
            <span className="font-title text-[clamp(48px,7vw,80px)] font-bold leading-[0.9] text-text-primary">
              <CountUp value={roi.roas} decimals={1} />
            </span>
            <span className="font-title text-[clamp(24px,3vw,36px)] font-bold text-accent/60">×</span>
          </div>

          <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-text-muted">
            Para cada{' '}
            <span className="font-semibold text-text-primary">R$ 1,00</span>{' '}
            investido, a Athenio gerou{' '}
            <span className="font-semibold text-gold">{formatCurrency(roi.roas)}</span>{' '}
            em retorno
          </p>
        </div>

        {/* Bottom: stats + sparkline — spread across full width */}
        <div className="relative z-10 mt-8 flex items-end justify-between gap-6">
          <div className="flex gap-8">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-subtle">Investido</p>
              <p className="mt-1 text-[18px] font-semibold text-text-muted">{formatCurrency(roi.investido)}</p>
            </div>
            <div className="h-10 w-[1px] bg-gradient-to-b from-transparent via-border-default to-transparent" />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-subtle">Retorno</p>
              <p className="mt-1 text-[18px] font-semibold text-gold">{formatCurrency(roi.retorno)}</p>
            </div>
            <div className="h-10 w-[1px] bg-gradient-to-b from-transparent via-border-default to-transparent" />
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-subtle">Lucro</p>
              <p className="mt-1 text-[18px] font-semibold text-emerald">{formatCurrency(roi.retorno - roi.investido)}</p>
            </div>
          </div>

          {/* Sparkline — ROAS trend */}
          <div className="hidden w-48 lg:block">
            <p className="mb-2 text-right text-[10px] font-medium uppercase tracking-[0.12em] text-text-subtle">
              ROAS — últimos 7 dias
            </p>
            <div className="rounded-xl bg-[rgba(255,255,255,0.03)] px-3 pt-3 pb-1">
              <ResponsiveContainer width="100%" height={56}>
                <LineChart data={sparkData}>
                  <Tooltip
                    contentStyle={{
                      background: '#161A1E',
                      border: '1px solid rgba(240,237,232,0.08)',
                      borderRadius: 8,
                      fontSize: 11,
                      color: '#F0EDE8',
                      padding: '4px 8px',
                    }}
                    formatter={(v) => [`${Number(v).toFixed(1)}×`, 'ROAS']}
                    labelFormatter={(i) => `Dia ${Number(i) + 1}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#4FD1C5"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 3, fill: '#4FD1C5', stroke: '#0E1012', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
              {/* Min / Max labels */}
              <div className="flex justify-between px-1 text-[9px] text-text-subtle">
                <span>{Math.min(...roi.historico_7d).toFixed(1)}×</span>
                <span>{Math.max(...roi.historico_7d).toFixed(1)}×</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AnimateIn>
  )
}
