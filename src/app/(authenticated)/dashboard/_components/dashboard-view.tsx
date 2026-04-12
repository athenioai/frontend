'use client'

import { motion } from 'motion/react'
import {
  DollarSign,
  Clock,
  AlertTriangle,
  TrendingUp,
  ShoppingBag,
  Wrench,
  FileText,
  MessagesSquare,
  CalendarCheck,
  Users,
  Zap,
} from 'lucide-react'
import { MOTION, fadeInUp, staggerContainer } from '@/lib/motion'
import type { FinanceDashboard } from '@/lib/services/interfaces/finance-service'

const fmt = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

interface DashboardViewProps {
  data: FinanceDashboard | null
  userName: string | null
}

export function DashboardView({ data, userName }: DashboardViewProps) {
  const greeting = getGreeting()

  const financialStats = [
    {
      label: 'Receita do mês',
      value: fmt(data?.revenueThisMonth ?? 0),
      icon: DollarSign,
      color: 'text-emerald',
      bg: 'bg-emerald/10',
      ring: 'ring-emerald/15',
    },
    {
      label: 'A receber',
      value: fmt(data?.pendingAmount ?? 0),
      icon: Clock,
      color: 'text-accent',
      bg: 'bg-accent/10',
      ring: 'ring-accent/15',
    },
    {
      label: 'Inadimplência',
      value: fmt(data?.overdueAmount ?? 0),
      icon: AlertTriangle,
      color: 'text-danger',
      bg: 'bg-danger/10',
      ring: 'ring-danger/15',
    },
    {
      label: 'Ticket médio',
      value: fmt(data?.averageTicket ?? 0),
      icon: TrendingUp,
      color: 'text-gold',
      bg: 'bg-gold/10',
      ring: 'ring-gold/15',
    },
  ]

  const operationsStats = [
    {
      label: 'Conversas ativas',
      value: String(data?.conversationsThisMonth ?? 0),
      icon: MessagesSquare,
      color: 'text-accent',
      bg: 'bg-accent/10',
      ring: 'ring-accent/15',
    },
    {
      label: 'Agendamentos',
      value: String(data?.appointmentsThisMonth ?? 0),
      icon: CalendarCheck,
      color: 'text-emerald',
      bg: 'bg-emerald/10',
      ring: 'ring-emerald/15',
    },
    {
      label: 'Leads novos',
      value: String(data?.leadsThisMonth ?? 0),
      icon: Users,
      color: 'text-teal',
      bg: 'bg-teal/10',
      ring: 'ring-teal/15',
    },
    {
      label: 'Taxa de conversão',
      value: `${(data?.conversionRate ?? 0).toFixed(1)}%`,
      icon: TrendingUp,
      color: 'text-gold',
      bg: 'bg-gold/10',
      ring: 'ring-gold/15',
    },
  ]

  const byType = data?.byType ?? { service: 0, product: 0, manual: 0 }
  const maxType = Math.max(byType.service, byType.product, byType.manual, 1)

  const typeBreakdown = [
    { label: 'Serviços', value: byType.service, color: 'bg-teal', icon: Wrench },
    { label: 'Produtos', value: byType.product, color: 'bg-gold', icon: ShoppingBag },
    { label: 'Manual', value: byType.manual, color: 'bg-violet', icon: FileText },
  ]

  const dailyRevenue = data?.dailyRevenue ?? []
  const maxDailyAmount = Math.max(...dailyRevenue.map((d) => d.amount), 1)

  const roi = data?.roi ?? null
  const planCost = data?.planCost ?? 0
  const revenueThisMonth = data?.revenueThisMonth ?? 0

  return (
    <div className="mx-auto max-w-screen-2xl px-6 py-8 lg:py-10">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div
          variants={fadeInUp}
          transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
        >
          <p className="text-sm font-medium text-accent">{greeting}{userName ? `, ${userName.split(' ')[0]}` : ''}</p>
          <h1 className="mt-1 font-title text-3xl font-bold tracking-tight text-text-primary">
            Painel de controle
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            Acompanhe a saúde financeira e operacional do seu negócio.
          </p>
        </motion.div>

        {/* Row 1 — Financial stats */}
        <motion.div
          variants={fadeInUp}
          transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
          className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {financialStats.map((stat) => (
            <div key={stat.label} className="card-surface p-5">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg} ring-1 ${stat.ring}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
                  {stat.label}
                </p>
              </div>
              <p className={`mt-3 font-title text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Row 2 — Operations stats */}
        <motion.div
          variants={fadeInUp}
          transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
          className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {operationsStats.map((stat) => (
            <div key={stat.label} className="card-surface p-5">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.bg} ring-1 ${stat.ring}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
                  {stat.label}
                </p>
              </div>
              <p className={`mt-3 font-title text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Row 3 — Revenue chart + ROI */}
        <motion.div
          variants={fadeInUp}
          transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
          className="mt-4 grid gap-4 lg:grid-cols-3"
        >
          {/* Daily revenue chart */}
          <div className="card-surface p-5 lg:col-span-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
              Faturamento últimos 30 dias
            </h2>

            {dailyRevenue.length === 0 ? (
              <div className="mt-6 flex items-center justify-center py-12">
                <p className="text-sm text-text-subtle">Sem dados disponíveis</p>
              </div>
            ) : (
              <div className="mt-4">
                <div className="flex items-end gap-[2px]" style={{ height: 160 }}>
                  {dailyRevenue.map((day, i) => {
                    const heightPercent = Math.max((day.amount / maxDailyAmount) * 100, 2)
                    return (
                      <div
                        key={day.date}
                        className="group relative flex-1"
                        style={{ height: '100%' }}
                      >
                        <div
                          className="absolute bottom-0 w-full rounded-t bg-accent/80 transition-colors group-hover:bg-accent"
                          style={{ height: `${heightPercent}%` }}
                        />
                        {/* Tooltip on hover */}
                        <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 rounded-lg bg-surface-1 px-2 py-1 text-[10px] text-text-primary opacity-0 shadow-lg ring-1 ring-border-default transition-opacity group-hover:opacity-100 whitespace-nowrap">
                          <p className="font-semibold">{fmt(day.amount)}</p>
                          <p className="text-text-subtle">
                            {new Date(day.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                {/* X axis labels — show every 5th date */}
                <div className="mt-2 flex gap-[2px]">
                  {dailyRevenue.map((day, i) => (
                    <div key={day.date} className="flex-1 text-center">
                      {i % 5 === 0 ? (
                        <span className="text-[9px] tabular-nums text-text-subtle">
                          {new Date(day.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                          })}
                        </span>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ROI card */}
          <div className="card-surface p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
              Retorno sobre investimento
            </h2>

            <div className="mt-6 flex flex-col items-center justify-center">
              {roi !== null ? (
                <>
                  <div className={`flex h-20 w-20 items-center justify-center rounded-2xl ${roi >= 1 ? 'bg-emerald/10' : 'bg-danger/10'}`}>
                    <Zap className={`h-8 w-8 ${roi >= 1 ? 'text-emerald' : 'text-danger'}`} />
                  </div>
                  <p className={`mt-4 font-title text-3xl font-bold ${roi >= 1 ? 'text-emerald' : 'text-danger'}`}>
                    {roi.toFixed(1)}x
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    o valor do seu plano
                  </p>
                </>
              ) : (
                <>
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-2">
                    <Zap className="h-8 w-8 text-text-subtle/50" />
                  </div>
                  <p className="mt-4 text-sm text-text-subtle">
                    Sem dados suficientes
                  </p>
                </>
              )}

              <div className="mt-6 w-full space-y-2 border-t border-border-default pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Custo do plano</span>
                  <span className="font-medium tabular-nums text-text-primary">
                    {fmt(planCost)}/mês
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-text-muted">Receita</span>
                  <span className="font-medium tabular-nums text-text-primary">
                    {fmt(revenueThisMonth)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Row 4 — Revenue by type */}
        <motion.div
          variants={fadeInUp}
          transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
          className="mt-4"
        >
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
            Receita por tipo
          </h2>

          <div className="mt-4 card-surface p-5 space-y-4">
            {typeBreakdown.map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <item.icon className="h-4 w-4 text-text-subtle shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2 mb-1.5">
                    <span className="text-sm font-medium text-text-primary">{item.label}</span>
                    <span className="text-sm font-semibold text-text-primary">{fmt(item.value)}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-2">
                    <div
                      className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                      style={{ width: `${(item.value / maxType) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
