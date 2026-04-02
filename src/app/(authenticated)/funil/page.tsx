'use client'

import { useState, useEffect, useTransition } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Link from 'next/link'
import { GitBranch, Users, ArrowDown, ChevronDown, Flame, Thermometer, Snowflake, ArrowRight } from 'lucide-react'
import { FunilChart } from '@/components/charts/funil-chart'
import { formatPercent, formatNumber } from '@/lib/utils/format'
import { getFunilData } from './actions'
import { COLORS, TEMPERATURA_COLORS } from '@/lib/constants/theme'
import { MOTION } from '@/lib/motion'
import type { FunnelStats, Lead } from '@/lib/types'

type Periodo = '1d' | '7d' | '30d'

const STAGE_CONFIG = [
  { key: 'captured', label: 'Leads Captados', filter: 'captured', color: COLORS.accent, icon: '◉' },
  { key: 'qualified', label: 'Qualificados', filter: 'qualified', color: '#3BBEB2', icon: '◈' },
  { key: 'negotiation', label: 'Em Negociação', filter: 'negotiation', color: COLORS.emerald, icon: '◆' },
  { key: 'converted', label: 'Convertidos', filter: 'converted', color: COLORS.gold, icon: '★' },
] as const

const TEMP_CONFIG = {
  hot: { color: TEMPERATURA_COLORS.hot, icon: Flame, label: 'Quente' },
  warm: { color: TEMPERATURA_COLORS.warm, icon: Thermometer, label: 'Morno' },
  cold: { color: TEMPERATURA_COLORS.cold, icon: Snowflake, label: 'Frio' },
} as const

export default function FunilPage() {
  const [periodo, setPeriodo] = useState<Periodo>('30d')
  const [stats, setStats] = useState<FunnelStats | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [expandido, setExpandido] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const LEADS_PREVIEW = 8

  useEffect(() => {
    startTransition(async () => {
      const data = await getFunilData(periodo)
      if (data) {
        setStats(data.stats)
        setLeads(data.leads)
      }
    })
  }, [periodo])

  if (!stats) return (
    <div className="flex items-center justify-center py-20">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
    </div>
  )

  const totalConversion = stats.captured > 0 ? stats.converted / stats.captured : 0
  const totalLost = stats.captured - stats.converted
  const rates = [
    stats.rates.captured_to_qualified,
    stats.rates.qualified_to_negotiation,
    stats.rates.negotiation_to_converted,
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent/15 to-accent/5">
            <GitBranch className="h-[18px] w-[18px] text-accent" />
          </div>
          <div>
            <h1 className="font-title text-[22px] font-bold text-text-primary">Funil de Vendas</h1>
            <p className="text-[13px] text-text-muted">Acompanhe a jornada dos seus leads</p>
          </div>
        </div>

        {/* Period toggle */}
        <div className="flex gap-1 rounded-xl bg-[rgba(240,237,232,0.04)] p-1">
          {(['1d', '7d', '30d'] as Periodo[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriodo(p)}
              className={`relative rounded-xl px-4 py-2 text-[13px] font-medium transition-all duration-200 ${
                periodo === p
                  ? 'text-primary-foreground'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {periodo === p && (
                <motion.span
                  layoutId="funil-period"
                  className="absolute inset-0 rounded-xl bg-accent shadow-[0_0_12px_rgba(79,209,197,0.2)]"
                  transition={{ duration: 0.25, ease: MOTION.ease.out }}
                />
              )}
              <span className="relative z-10">
                {p === '1d' ? 'Hoje' : p === '7d' ? '7 dias' : '30 dias'}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* KPI Strip */}
      <div className={`grid gap-5 grid-cols-2 lg:grid-cols-4 transition-opacity duration-200 ${isPending ? 'opacity-50' : ''}`}>
        {[
          { label: 'Total de Leads', value: formatNumber(stats.captured), color: COLORS.accent },
          { label: 'Taxa Conversão', value: formatPercent(totalConversion), color: COLORS.emerald },
          { label: 'Convertidos', value: formatNumber(stats.converted), color: COLORS.gold },
          { label: 'Perdidos', value: formatNumber(totalLost), color: COLORS.danger },
        ].map((kpi) => (
          <div key={kpi.label} className="card-surface p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-subtle">{kpi.label}</p>
            <p className="mt-1.5 font-title text-[24px] font-bold leading-none" style={{ color: kpi.color }}>
              {kpi.value}
            </p>
          </div>
        ))}
      </div>

      {/* Expandable Stages */}
      <div>
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
          Detalhamento por etapa
        </p>
        <div className={`space-y-3 transition-opacity duration-200 ${isPending ? 'opacity-50 pointer-events-none' : ''}`}>
          {STAGE_CONFIG.map((stage, i) => {
            const stageLeads = leads.filter((l) => l.funnel_stage === stage.filter)
            const isOpen = expandido === stage.key
            const count = stats[stage.key]

            return (
              <div key={stage.key}>
                <button
                  onClick={() => setExpandido(isOpen ? null : stage.key)}
                  className="card-surface w-full p-5 text-left transition-all duration-200 hover:border-border-hover"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-[12px]"
                        style={{ backgroundColor: `${stage.color}15`, color: stage.color }}
                      >
                        {stage.icon}
                      </span>
                      <div>
                        <p className="text-[14px] font-semibold text-text-primary">{stage.label}</p>
                        <p className="text-[11px] text-text-subtle">
                          {count} {count === 1 ? 'lead' : 'leads'}
                          {i < rates.length && (
                            <span className="ml-2">
                              <span className="text-emerald">{formatPercent(rates[i])} avança</span>
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-title text-[22px] font-bold" style={{ color: stage.color }}>
                        {count}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-text-subtle transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      />
                    </div>
                  </div>
                </button>

                {/* Expanded leads list */}
                <AnimatePresence>
                  {isOpen && stageLeads.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: MOTION.ease.out }}
                      className="overflow-hidden"
                    >
                      <div className="ml-4 mt-1 space-y-1 border-l border-border-default pl-4 pt-2 pb-1">
                        {stageLeads.slice(0, LEADS_PREVIEW).map((lead) => {
                          const temp = TEMP_CONFIG[lead.temperature]
                          const TempIcon = temp.icon
                          return (
                            <div
                              key={lead.id}
                              className="flex items-center justify-between rounded-lg px-3 py-2.5 transition-colors hover:bg-[rgba(255,255,255,0.02)]"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[rgba(240,237,232,0.04)] text-[10px] font-bold text-text-subtle">
                                  {lead.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-[13px] font-medium text-text-primary">{lead.name}</p>
                                  <p className="text-[11px] text-text-subtle">{lead.product_interest}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span
                                  className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold"
                                  style={{ backgroundColor: `${temp.color}15`, color: temp.color }}
                                >
                                  <TempIcon className="h-2.5 w-2.5" />
                                  {temp.label}
                                </span>
                                <span className="text-[11px] text-text-subtle">Score {lead.score}</span>
                              </div>
                            </div>
                          )
                        })}
                        {stageLeads.length > LEADS_PREVIEW && (
                          <Link
                            href={`/leads?estagio=${stage.filter}`}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 text-[12px] font-medium text-accent transition-colors hover:bg-[rgba(79,209,197,0.05)]"
                          >
                            Ver todos os {stageLeads.length} leads
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Connector arrow between stages */}
                {i < STAGE_CONFIG.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowDown className="h-3.5 w-3.5 text-text-subtle/30" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
