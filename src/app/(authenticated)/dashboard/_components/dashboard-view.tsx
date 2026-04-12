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
}

export function DashboardView({ data }: DashboardViewProps) {
  const greeting = getGreeting()

  const stats = [
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

  const byType = data?.byType ?? { service: 0, product: 0, manual: 0 }
  const maxType = Math.max(byType.service, byType.product, byType.manual, 1)

  const typeBreakdown = [
    { label: 'Serviços', value: byType.service, color: 'bg-teal', icon: Wrench },
    { label: 'Produtos', value: byType.product, color: 'bg-gold', icon: ShoppingBag },
    { label: 'Manual', value: byType.manual, color: 'bg-violet', icon: FileText },
  ]

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
          <p className="text-sm font-medium text-accent">{greeting}</p>
          <h1 className="mt-1 font-title text-3xl font-bold tracking-tight text-text-primary">
            Painel de controle
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            Acompanhe a saúde financeira do seu negócio.
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={fadeInUp}
          transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
          className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {stats.map((stat) => (
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

        {/* Revenue by type */}
        <motion.div
          variants={fadeInUp}
          transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
          className="mt-8"
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
