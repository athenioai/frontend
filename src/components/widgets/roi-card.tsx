'use client'

import { useEffect, useState } from 'react'
import { LineChart, Line, ResponsiveContainer } from 'recharts'
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
    <AnimateIn>
      <div className="card-hero relative overflow-hidden p-8">
        <div className="relative flex items-start justify-between">
          <div className="flex-1 text-center lg:text-left">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.05em] text-text-muted">
              Retorno sobre investimento
            </p>
            <p className="font-title text-[clamp(36px,5vw,56px)] font-bold leading-none text-accent">
              <CountUp value={roi.roas} decimals={1} suffix="x" />
            </p>
            <p className="mt-4 text-base text-text-muted">
              Para cada{' '}
              <span className="font-semibold text-text-primary">R$ 1,00</span>{' '}
              investido em anúncio, a Athenio retornou{' '}
              <span className="font-semibold text-amber">{formatCurrency(roi.roas)}</span>{' '}
              em vendas
            </p>
            <div className="mt-4 flex justify-center gap-8 text-sm text-text-subtle lg:justify-start">
              <span>Investido: {formatCurrency(roi.investido)}</span>
              <span>Retorno: <span className="text-amber">{formatCurrency(roi.retorno)}</span></span>
            </div>
          </div>

          {/* Sparkline */}
          <div className="hidden w-32 lg:block">
            <p className="mb-1 text-right text-[10px] font-medium uppercase text-text-subtle">7 dias</p>
            <ResponsiveContainer width="100%" height={60}>
              <LineChart data={sparkData}>
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#4FD1C5"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AnimateIn>
  )
}
