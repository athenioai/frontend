'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils/format'
import type { RoiTotal } from '@/lib/types'

export function RoiCard({ initial }: { initial: RoiTotal }) {
  const [roi, setRoi] = useState(initial)

  // Simulate real-time updates
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

  return (
    <div className="glass-card relative overflow-hidden">
      <div className="glow-accent absolute inset-0" />
      <div className="relative text-center">
        <p className="mb-2 text-sm font-medium uppercase tracking-[0.12em] text-text-muted">
          Retorno sobre investimento
        </p>
        <p className="font-title text-[clamp(34px,5.5vw,68px)] font-bold leading-none text-accent">
          {roi.roas.toFixed(1)}x
        </p>
        <p className="mt-4 text-base text-text-muted">
          Para cada{' '}
          <span className="font-semibold text-text-primary">R$ 1,00</span>{' '}
          investido em anúncio, a Athenio retornou{' '}
          <span className="font-semibold text-accent">{formatCurrency(roi.roas)}</span>{' '}
          em vendas
        </p>
        <div className="mt-4 flex justify-center gap-8 text-sm text-text-subtle">
          <span>Investido: {formatCurrency(roi.investido)}</span>
          <span>Retorno: {formatCurrency(roi.retorno)}</span>
        </div>
      </div>
    </div>
  )
}
