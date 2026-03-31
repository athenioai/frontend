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
      <div className="card-hero relative p-8 lg:p-10">
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Main content */}
          <div className="flex-1">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-accent/70">
              Retorno sobre investimento
            </p>

            {/* The hero number — serif italic, editorial */}
            <div className="flex items-baseline gap-2">
              <span className="font-title text-[clamp(48px,7vw,80px)] font-bold leading-[0.9] text-text-primary">
                <CountUp value={roi.roas} decimals={1} />
              </span>
              <span className="font-title text-[clamp(24px,3vw,36px)] font-bold text-accent/60">×</span>
            </div>

            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-text-muted">
              Para cada{' '}
              <span className="font-semibold text-text-primary">R$ 1,00</span>{' '}
              investido, a Athenio gerou{' '}
              <span className="font-semibold text-gold">{formatCurrency(roi.roas)}</span>{' '}
              em retorno
            </p>

            <div className="mt-5 flex gap-8">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-subtle">Investido</p>
                <p className="mt-0.5 text-[15px] font-semibold text-text-muted">{formatCurrency(roi.investido)}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-subtle">Retorno</p>
                <p className="mt-0.5 text-[15px] font-semibold text-gold">{formatCurrency(roi.retorno)}</p>
              </div>
            </div>
          </div>

          {/* Sparkline */}
          <div className="hidden w-36 lg:block">
            <p className="mb-2 text-right text-[10px] font-medium uppercase tracking-[0.12em] text-text-subtle">
              Últimos 7 dias
            </p>
            <div className="rounded-xl bg-[rgba(255,255,255,0.02)] p-3">
              <ResponsiveContainer width="100%" height={64}>
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
      </div>
    </AnimateIn>
  )
}
