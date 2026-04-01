'use client'

import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { formatCurrency } from '@/lib/utils/format'
import { AnimateIn } from '@/components/ui/animate-in'
import { COLORS } from '@/lib/constants/theme'
import { TrendingUp, DollarSign, Users, ShoppingCart, Target, Percent, Calendar } from 'lucide-react'
import type { Campaign, CampaignPerformance } from '@/lib/types'

type Metric = { key: string; label: string; color: string; format: (v: number) => string }

const METRICS: Metric[] = [
  { key: 'roas', label: 'ROAS', color: COLORS.accent, format: (v: number) => `${v.toFixed(1)}×` },
  { key: 'leads', label: 'Leads', color: COLORS.violet, format: (v: number) => String(v) },
  { key: 'vendas', label: 'Vendas', color: COLORS.emerald, format: (v: number) => String(v) },
  { key: 'gasto', label: 'Gasto', color: COLORS.gold, format: (v: number) => formatCurrency(v) },
]

function CampaignChart({ data, loading }: { data: CampaignPerformance[]; loading: boolean }) {
  const [activeMetric, setActiveMetric] = useState<Metric>(METRICS[0])
  const chartData = data.map((d) => ({ ...d, data: d.data.slice(5) }))

  return (
    <div className="px-8 py-8">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
          Performance ao longo do tempo
        </p>
        {/* Metric toggle */}
        {data.length > 0 && (
          <div className="flex gap-1 rounded-lg bg-[rgba(240,237,232,0.04)] p-0.5">
            {METRICS.map((m) => (
              <button
                key={m.key}
                onClick={() => setActiveMetric(m)}
                className={`rounded-md px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider transition-all duration-200 ${
                  activeMetric.key === m.key
                    ? 'bg-[rgba(240,237,232,0.08)] text-text-primary'
                    : 'text-text-subtle hover:text-text-muted'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
        </div>
      ) : data.length > 0 ? (
        <div className="rounded-xl border border-border-default bg-[rgba(240,237,232,0.02)] p-4">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ left: 0, right: 10, top: 5, bottom: 5 }}>
              <defs>
                <linearGradient id={`gradient-${activeMetric.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={activeMetric.color} stopOpacity={0.2} />
                  <stop offset="100%" stopColor={activeMetric.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(240,237,232,0.04)" strokeDasharray="3 3" />
              <XAxis
                dataKey="data"
                tick={{ fill: COLORS.textSubtle, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: COLORS.textSubtle, fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  background: COLORS.surface2,
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 10,
                  padding: '8px 12px',
                  fontSize: 12,
                }}
                labelStyle={{ color: COLORS.textSubtle, fontSize: 10, marginBottom: 4 }}
                formatter={(value) => [activeMetric.format(Number(value)), activeMetric.label]}
              />
              <Area
                type="monotone"
                dataKey={activeMetric.key}
                stroke={activeMetric.color}
                strokeWidth={2}
                fill={`url(#gradient-${activeMetric.key})`}
                dot={false}
                activeDot={{ r: 4, fill: activeMetric.color, stroke: COLORS.surface1, strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <TrendingUp className="mb-2 h-5 w-5 text-text-subtle/40" />
          <p className="text-[13px] text-text-subtle">Sem dados de performance ainda</p>
        </div>
      )}
    </div>
  )
}

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
                  <div className="grid grid-cols-2 gap-4">
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

      {/* ─── Detail Drawer ─── */}
      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto border-border-default bg-bg-base p-0 sm:max-w-xl">
          {selected && (() => {
            const isActive = selected.status === 'ativa'
            const conversionRate = selected.leads_gerados > 0
              ? ((selected.vendas_confirmadas / selected.leads_gerados) * 100).toFixed(1)
              : '0.0'

            return (
              <div>
                {/* Hero header with gradient */}
                <div className="relative overflow-hidden px-8 pt-10 pb-8">
                  {/* Background glow */}
                  <div
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background: isActive
                        ? `linear-gradient(135deg, ${COLORS.accent}08, transparent 60%)`
                        : `linear-gradient(135deg, ${COLORS.textSubtle}05, transparent 60%)`,
                    }}
                  />
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <span
                          className="mb-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
                          style={{
                            backgroundColor: isActive ? `${COLORS.emerald}12` : `${COLORS.textSubtle}15`,
                            color: isActive ? COLORS.emerald : COLORS.textSubtle,
                          }}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${isActive ? 'animate-pulse' : ''}`}
                            style={{ backgroundColor: isActive ? COLORS.emerald : COLORS.textSubtle }}
                          />
                          {selected.status}
                        </span>
                        <h2 className="font-title text-[22px] font-bold text-text-primary">{selected.nome}</h2>
                        <div className="mt-2 flex items-center gap-1.5 text-[12px] text-text-subtle">
                          <Calendar className="h-3 w-3" />
                          Criada em {new Date(selected.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                    </div>

                    {/* Hero ROAS */}
                    <div className="mt-6 flex items-baseline gap-2">
                      <span className="font-title text-[48px] font-bold leading-none text-accent">
                        {selected.roas.toFixed(1)}
                      </span>
                      <span className="font-title text-[24px] font-bold text-accent/50">×</span>
                      <span className="ml-2 text-[13px] text-text-subtle">ROAS</span>
                    </div>
                  </div>
                </div>

                {/* Separator */}
                <div className="mx-8 h-[1px] bg-gradient-to-r from-transparent via-border-default to-transparent" />

                {/* Metrics section */}
                <div className="space-y-5 px-8 py-8">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
                    Métricas da campanha
                  </p>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: 'Gasto Total', value: formatCurrency(selected.gasto_total), icon: DollarSign, color: COLORS.gold },
                      { label: 'Custo por Lead', value: formatCurrency(selected.cpl), icon: Target, color: COLORS.gold },
                      { label: 'Leads Gerados', value: String(selected.leads_gerados), icon: Users, color: COLORS.violet },
                      { label: 'Vendas Confirmadas', value: String(selected.vendas_confirmadas), icon: ShoppingCart, color: COLORS.emerald },
                    ].map((kpi) => (
                      <div key={kpi.label} className="rounded-xl border border-border-default bg-[rgba(240,237,232,0.02)] p-4">
                        <div className="mb-2.5 flex items-center gap-2">
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

                  {/* Conversion rate bar */}
                  <div className="rounded-xl border border-border-default bg-[rgba(240,237,232,0.02)] p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ backgroundColor: `${COLORS.emerald}12` }}>
                          <Percent className="h-3.5 w-3.5" style={{ color: COLORS.emerald }} />
                        </div>
                        <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-text-subtle">Taxa de conversão</span>
                      </div>
                      <span className="font-title text-[18px] font-bold text-emerald">{conversionRate}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[rgba(240,237,232,0.05)]">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${Math.min(parseFloat(conversionRate), 100)}%`,
                          background: `linear-gradient(90deg, ${COLORS.emerald}, ${COLORS.emerald}80)`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Separator */}
                <div className="mx-8 h-[1px] bg-gradient-to-r from-transparent via-border-default to-transparent" />

                {/* Performance chart */}
                <CampaignChart data={perfData} loading={loading} />
              </div>
            )
          })()}
        </SheetContent>
      </Sheet>
    </>
  )
}
