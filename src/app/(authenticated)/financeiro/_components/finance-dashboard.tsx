'use client'

import { motion } from 'motion/react'
import {
  TrendingUp,
  Clock,
  AlertTriangle,
  Ticket,
  Plus,
  BookOpen,
  List,
  ArrowRight,
} from 'lucide-react'
import { MOTION, fadeInUp, staggerContainer } from '@/lib/motion'
import Link from 'next/link'
import type { FinanceDashboard as FinanceDashboardData } from '@/lib/services/interfaces/finance-service'

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

interface FinanceDashboardProps {
  data: FinanceDashboardData | null
}

const STAT_CARDS = [
  {
    key: 'revenueThisMonth' as const,
    label: 'Receita do mês',
    icon: TrendingUp,
    accent: 'from-emerald/20 to-emerald/5',
    iconColor: 'text-emerald',
    valueColor: 'text-emerald',
  },
  {
    key: 'pendingAmount' as const,
    label: 'A receber',
    icon: Clock,
    accent: 'from-accent/20 to-accent/5',
    iconColor: 'text-accent',
    valueColor: 'text-accent',
  },
  {
    key: 'overdueAmount' as const,
    label: 'Inadimplência',
    icon: AlertTriangle,
    accent: 'from-danger/20 to-danger/5',
    iconColor: 'text-danger',
    valueColor: 'text-danger',
  },
  {
    key: 'averageTicket' as const,
    label: 'Ticket médio',
    icon: Ticket,
    accent: 'from-gold/20 to-gold/5',
    iconColor: 'text-gold',
    valueColor: 'text-gold',
  },
]

const BY_TYPE_CONFIG = [
  {
    key: 'service' as const,
    label: 'Serviços',
    barColor: 'bg-teal',
    textColor: 'text-teal',
  },
  {
    key: 'product' as const,
    label: 'Produtos',
    barColor: 'bg-gold',
    textColor: 'text-gold',
  },
  {
    key: 'manual' as const,
    label: 'Manual',
    barColor: 'bg-violet',
    textColor: 'text-violet',
  },
]

const QUICK_LINKS = [
  {
    href: '/financeiro/cobrancas/nova',
    label: 'Nova cobrança',
    description: 'Crie uma cobrança para um lead',
    icon: Plus,
    accent: 'from-emerald/20 to-emerald/5',
    iconColor: 'text-emerald',
    ring: 'ring-emerald/15',
    hoverBorder: 'hover:border-emerald/20',
  },
  {
    href: '/financeiro/servicos',
    label: 'Catálogo',
    description: 'Gerencie serviços e produtos',
    icon: BookOpen,
    accent: 'from-accent/20 to-accent/5',
    iconColor: 'text-accent',
    ring: 'ring-accent/15',
    hoverBorder: 'hover:border-accent/20',
  },
  {
    href: '/financeiro/cobrancas',
    label: 'Todas cobranças',
    description: 'Visualize e filtre todas as cobranças',
    icon: List,
    accent: 'from-gold/20 to-gold/5',
    iconColor: 'text-gold',
    ring: 'ring-gold/15',
    hoverBorder: 'hover:border-gold/20',
  },
]

export function FinanceDashboard({ data }: FinanceDashboardProps) {
  const byType = data?.byType ?? { service: 0, product: 0, manual: 0 }
  const maxByType = Math.max(byType.service, byType.product, byType.manual, 1)

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
      >
        <h1 className="font-title text-2xl font-bold text-text-primary">
          Financeiro
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Acompanhe a saúde financeira do seu negócio.
        </p>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        variants={fadeInUp}
        transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
        className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {STAT_CARDS.map((card) => {
          const Icon = card.icon
          const value = data?.[card.key] ?? 0

          return (
            <div key={card.key} className="card-surface p-5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
                  {card.label}
                </p>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${card.accent}`}
                >
                  <Icon className={`h-4 w-4 ${card.iconColor}`} />
                </div>
              </div>
              <p className={`mt-3 font-title text-2xl font-bold tabular-nums ${card.valueColor}`}>
                {formatBRL(value)}
              </p>
            </div>
          )
        })}
      </motion.div>

      {/* Revenue by type */}
      <motion.div
        variants={fadeInUp}
        transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
        className="mt-4"
      >
        <div className="card-surface p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
            Receita por tipo
          </h2>

          <div className="mt-5 space-y-4">
            {BY_TYPE_CONFIG.map((item) => {
              const amount = byType[item.key]
              const widthPercent = Math.round((amount / maxByType) * 100)

              return (
                <div key={item.key}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-text-primary">
                      {item.label}
                    </p>
                    <p className={`text-sm font-semibold tabular-nums ${item.textColor}`}>
                      {formatBRL(amount)}
                    </p>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className={`h-full rounded-full ${item.barColor} transition-all duration-500`}
                      style={{ width: `${widthPercent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* Quick links */}
      <motion.div
        variants={fadeInUp}
        transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
        className="mt-4"
      >
        <h2 className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
          Acesso rápido
        </h2>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon

            return (
              <Link
                key={link.label}
                href={link.href}
                className={`card-surface card-surface-interactive group flex flex-col p-5 transition-all duration-200 ${link.hoverBorder}`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${link.accent} ring-1 ${link.ring}`}
                >
                  <Icon className={`h-5 w-5 ${link.iconColor}`} />
                </div>

                <p className="mt-4 font-title text-sm font-semibold text-text-primary">
                  {link.label}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-text-muted">
                  {link.description}
                </p>

                <div className="mt-auto flex items-center gap-1 pt-4 text-[11px] font-medium text-text-subtle transition-colors group-hover:text-text-muted">
                  Acessar
                  <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                </div>
              </Link>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
