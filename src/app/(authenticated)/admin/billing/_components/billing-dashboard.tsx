'use client'

import { motion } from 'motion/react'
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Users,
} from 'lucide-react'
import { MOTION, fadeInUp, staggerContainer } from '@/lib/motion'
import type { AdminBillingDashboard } from '@/lib/services/interfaces/finance-service'

function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

interface BillingDashboardProps {
  data: AdminBillingDashboard | null
}

export function BillingDashboard({ data }: BillingDashboardProps) {
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <AlertTriangle className="h-10 w-10 text-text-subtle/50" />
        <p className="mt-4 font-title text-lg font-semibold text-text-muted">
          Não foi possível carregar o dashboard
        </p>
        <p className="mt-1 text-sm text-text-subtle">
          Verifique sua conexão e tente novamente
        </p>
      </div>
    )
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
      >
        <h1 className="font-title text-2xl font-bold text-text-primary">
          Faturamento
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Visão geral do faturamento recorrente
        </p>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        variants={fadeInUp}
        transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
        className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {/* MRR */}
        <div className="card-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
              MRR
            </p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald/20 to-emerald/5">
              <TrendingUp className="h-4 w-4 text-emerald" />
            </div>
          </div>
          <p className="mt-3 font-title text-2xl font-bold tabular-nums text-emerald">
            {formatBRL(data.mrr)}
          </p>
          <p className="mt-1 text-xs text-text-subtle">
            Receita recorrente mensal
          </p>
        </div>

        {/* Collected this month */}
        <div className="card-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
              Recebido este mês
            </p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent/5">
              <DollarSign className="h-4 w-4 text-accent" />
            </div>
          </div>
          <p className="mt-3 font-title text-2xl font-bold tabular-nums text-accent">
            {formatBRL(data.totalCollectedThisMonth)}
          </p>
          <p className="mt-1 text-xs text-text-subtle">
            Total coletado no mês atual
          </p>
        </div>

        {/* Overdue invoices */}
        <div className="card-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
              Faturas vencidas
            </p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-danger/20 to-danger/5">
              <AlertTriangle className="h-4 w-4 text-danger" />
            </div>
          </div>
          <p className="mt-3 font-title text-2xl font-bold tabular-nums text-danger">
            {data.overdueCount.toLocaleString('pt-BR')}
          </p>
          <p className="mt-1 text-xs text-text-subtle">
            Faturas em atraso
          </p>
        </div>

        {/* Active subscriptions */}
        <div className="card-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
              Assinaturas ativas
            </p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent/5">
              <Users className="h-4 w-4 text-accent" />
            </div>
          </div>
          <p className="mt-3 font-title text-2xl font-bold tabular-nums text-text-primary">
            {data.activeSubscriptions.toLocaleString('pt-BR')}
          </p>
          <p className="mt-1 text-xs text-text-subtle">
            Usuários com assinatura ativa
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}
