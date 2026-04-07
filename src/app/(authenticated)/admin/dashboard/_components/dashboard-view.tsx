'use client'

import { motion } from 'motion/react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import {
  Users,
  UserX,
  DollarSign,
  CalendarCheck,
  Target,
  MessagesSquare,
  AlertTriangle,
} from 'lucide-react'
import { MOTION, fadeInUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'
import type { AdminDashboardData } from '@/lib/services/interfaces/admin-dashboard-service'

const CHART_COLORS = ['#4FD1C5', '#A78BFA', '#E8C872', '#34D399', '#F07070']

function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface DashboardViewProps {
  data: AdminDashboardData | null
}

export function DashboardView({ data }: DashboardViewProps) {
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

  const cards = [
    {
      label: 'Usuários',
      value: String(data.users.total),
      sub: `+${data.users.newThisMonth} novos este mês`,
      subColor: 'text-accent',
      icon: Users,
      iconBg: 'from-accent/20 to-accent/5',
      iconColor: 'text-accent',
    },
    {
      label: 'Pendentes',
      value: String(data.users.pendingOnboarding),
      sub: data.users.pendingOnboarding > 0 ? 'Aguardando onboarding' : 'Nenhum pendente',
      subColor: data.users.pendingOnboarding > 0 ? 'text-gold' : 'text-text-subtle',
      icon: data.users.pendingOnboarding > 0 ? AlertTriangle : UserX,
      iconBg: data.users.pendingOnboarding > 0 ? 'from-gold/20 to-gold/5' : 'from-surface-2 to-surface-2',
      iconColor: data.users.pendingOnboarding > 0 ? 'text-gold' : 'text-text-subtle',
    },
    {
      label: 'MRR',
      value: formatCurrency(data.revenue.mrr),
      sub: `${data.revenue.planBreakdown.length} planos ativos`,
      subColor: 'text-text-subtle',
      icon: DollarSign,
      iconBg: 'from-emerald/20 to-emerald/5',
      iconColor: 'text-emerald',
    },
    {
      label: 'Agendamentos',
      value: String(data.appointments.totalThisMonth),
      sub: `${data.appointments.cancelledThisMonth} cancelados`,
      subColor: data.appointments.cancelledThisMonth > 0 ? 'text-danger' : 'text-text-subtle',
      icon: CalendarCheck,
      iconBg: 'from-violet/20 to-violet/5',
      iconColor: 'text-violet',
    },
    {
      label: 'Leads',
      value: String(data.leads.totalThisMonth),
      sub: `${Math.round(data.leads.conversionRate * 100)}% conversão`,
      subColor: 'text-accent',
      icon: Target,
      iconBg: 'from-accent/20 to-accent/5',
      iconColor: 'text-accent',
    },
    {
      label: 'Chats',
      value: String(data.chats.totalMessagesThisMonth),
      sub: `${data.chats.activeSessionsThisMonth} sessões ativas`,
      subColor: 'text-text-subtle',
      icon: MessagesSquare,
      iconBg: 'from-gold/20 to-gold/5',
      iconColor: 'text-gold',
    },
  ]

  const chartData = data.revenue.planBreakdown.map((p) => ({
    name: p.planName,
    value: p.userCount,
    cost: p.cost,
  }))

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
      >
        <h1 className="font-title text-2xl font-bold text-text-primary">
          Dashboard Admin
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Visão geral da operação no mês corrente
        </p>
      </motion.div>

      {/* Stat cards */}
      <motion.div
        variants={fadeInUp}
        transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
        className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {cards.map((card) => (
          <div key={card.label} className="card-surface p-5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
                {card.label}
              </p>
              <div
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br',
                  card.iconBg,
                )}
              >
                <card.icon className={cn('h-4.5 w-4.5', card.iconColor)} />
              </div>
            </div>
            <p className="mt-3 font-title text-3xl font-bold text-text-primary">
              {card.value}
            </p>
            <p className={cn('mt-1 text-xs', card.subColor)}>{card.sub}</p>
          </div>
        ))}
      </motion.div>

      {/* Plan distribution chart */}
      {chartData.length > 0 && (
        <motion.div
          variants={fadeInUp}
          transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
          className="mt-8 card-surface p-6"
        >
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
            Distribuição de planos
          </h2>

          <div className="mt-4 flex flex-col items-center gap-6 lg:flex-row lg:gap-10">
            {/* Donut */}
            <div className="h-56 w-56 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E2228',
                      border: '1px solid rgba(240,237,232,0.08)',
                      borderRadius: '0.75rem',
                      fontSize: '0.8rem',
                    }}
                    itemStyle={{ color: '#F0EDE8' }}
                    formatter={(value) => [
                      `${value} usuários`,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex-1 space-y-3">
              {chartData.map((item, i) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        CHART_COLORS[i % CHART_COLORS.length],
                    }}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-text-primary">
                      {item.name}
                    </p>
                    <p className="text-xs text-text-subtle">
                      {formatCurrency(item.cost)}/mês
                    </p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums text-text-primary">
                    {item.value}
                    <span className="ml-1 text-xs font-normal text-text-subtle">
                      usuários
                    </span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
