'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { LineChartSimple } from '@/components/charts/line-chart-simple'
import { formatCurrency } from '@/lib/utils/format'
import { AnimateIn } from '@/components/ui/animate-in'
import { COLORS } from '@/lib/constants/theme'
import { MOTION } from '@/lib/motion'
import { TrendingUp, DollarSign, Users, ShoppingCart, X } from 'lucide-react'
import type { Campaign, CampaignPerformance } from '@/lib/types'

export function CampaignGrid({ campaigns }: { campaigns: Campaign[] }) {
  const [selected, setSelected] = useState<Campaign | null>(null)
  const [perfData, setPerfData] = useState<CampaignPerformance[]>([])
  const [loading, setLoading] = useState(false)

  const sorted = [...campaigns].sort((a, b) => {
    if (a.status === 'ativa' && b.status !== 'ativa') return -1
    if (a.status !== 'ativa' && b.status === 'ativa') return 1
    return b.roas - a.roas
  })

  async function openDrawer(campaign: Campaign) {
    setSelected(campaign)
    setLoading(true)
    const res = await fetch(`/api/campanhas/${campaign.id}/performance`)
    const data = await res.json()
    setPerfData(data)
    setLoading(false)
  }

  return (
    <>
      <div>
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
          {sorted.length} {sorted.length === 1 ? 'campanha' : 'campanhas'}
        </p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((c, i) => {
            const isActive = c.status === 'ativa'
            return (
              <AnimateIn key={c.id} delay={i * 0.05}>
                <button
                  onClick={() => openDrawer(c)}
                  className={`card-surface card-surface-interactive group relative w-full overflow-hidden p-6 text-left ${
                    !isActive ? 'opacity-50' : ''
                  }`}
                >
                  {/* Top accent */}
                  <div
                    className="absolute left-0 right-0 top-0 h-[2px]"
                    style={{
                      background: isActive
                        ? `linear-gradient(90deg, ${COLORS.emerald}, transparent 70%)`
                        : `linear-gradient(90deg, ${COLORS.textSubtle}, transparent 70%)`,
                    }}
                  />

                  {/* Header */}
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-title text-[15px] font-bold text-text-primary">{c.nome}</h3>
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
                      style={{
                        backgroundColor: isActive ? `${COLORS.emerald}12` : `${COLORS.textSubtle}15`,
                        color: isActive ? COLORS.emerald : COLORS.textSubtle,
                      }}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${isActive ? 'animate-pulse' : ''}`}
                        style={{ backgroundColor: isActive ? COLORS.emerald : COLORS.textSubtle }}
                      />
                      {c.status}
                    </span>
                  </div>

                  {/* Hero metric — ROAS */}
                  <div className="mb-4 rounded-xl bg-[rgba(240,237,232,0.03)] p-4">
                    <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-subtle">ROAS</p>
                    <p className="mt-1 font-title text-[28px] font-bold leading-none text-accent">
                      {c.roas.toFixed(1)}×
                    </p>
                  </div>

                  {/* Metrics grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-text-subtle">Gasto</p>
                      <p className="mt-0.5 text-[14px] font-semibold text-text-muted">{formatCurrency(c.gasto_total)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-text-subtle">CPL</p>
                      <p className="mt-0.5 text-[14px] font-semibold text-text-muted">{formatCurrency(c.cpl)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-text-subtle">Leads</p>
                      <p className="mt-0.5 text-[14px] font-semibold text-text-primary">{c.leads_gerados}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-text-subtle">Vendas</p>
                      <p className="mt-0.5 text-[14px] font-semibold text-emerald">{c.vendas_confirmadas}</p>
                    </div>
                  </div>
                </button>
              </AnimateIn>
            )
          })}
        </div>
      </div>

      {/* Detail Drawer */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto border-border-default bg-bg-base sm:max-w-lg">
          {selected && (
            <div className="space-y-6 pt-2">
              {/* Drawer header */}
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="font-title text-[20px] font-bold text-text-primary">{selected.nome}</h2>
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
                    style={{
                      backgroundColor: selected.status === 'ativa' ? `${COLORS.emerald}12` : `${COLORS.textSubtle}15`,
                      color: selected.status === 'ativa' ? COLORS.emerald : COLORS.textSubtle,
                    }}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${selected.status === 'ativa' ? 'animate-pulse' : ''}`}
                      style={{ backgroundColor: selected.status === 'ativa' ? COLORS.emerald : COLORS.textSubtle }}
                    />
                    {selected.status}
                  </span>
                </div>
                <p className="mt-1 text-[13px] text-text-subtle">
                  Criada em {new Date(selected.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>

              {/* KPI cards */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'ROAS', value: `${selected.roas.toFixed(1)}×`, icon: TrendingUp, color: COLORS.accent },
                  { label: 'Gasto Total', value: formatCurrency(selected.gasto_total), icon: DollarSign, color: COLORS.gold },
                  { label: 'Leads Gerados', value: String(selected.leads_gerados), icon: Users, color: COLORS.violet },
                  { label: 'Vendas', value: String(selected.vendas_confirmadas), icon: ShoppingCart, color: COLORS.emerald },
                ].map((kpi) => (
                  <div key={kpi.label} className="card-surface p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${kpi.color}12` }}
                      >
                        <kpi.icon className="h-3.5 w-3.5" style={{ color: kpi.color }} />
                      </div>
                      <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-text-subtle">{kpi.label}</span>
                    </div>
                    <p className="font-title text-[20px] font-bold leading-none text-text-primary">{kpi.value}</p>
                  </div>
                ))}
              </div>

              {/* CPL detail */}
              <div className="card-surface p-4">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] text-text-subtle">Custo por Lead (CPL)</span>
                  <span className="font-title text-[16px] font-bold text-gold">{formatCurrency(selected.cpl)}</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[12px] text-text-subtle">Taxa de conversão</span>
                  <span className="font-title text-[16px] font-bold text-emerald">
                    {selected.leads_gerados > 0 ? ((selected.vendas_confirmadas / selected.leads_gerados) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>

              {/* Performance chart */}
              <div>
                <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
                  Performance ao longo do tempo
                </p>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                  </div>
                ) : perfData.length > 0 ? (
                  <div className="card-surface p-4">
                    <LineChartSimple
                      data={perfData.map((d) => ({ ...d, data: d.data.slice(5) }))}
                      xKey="data"
                      yKey="roas"
                      height={200}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12 text-[13px] text-text-subtle">
                    Sem dados de performance
                  </div>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
