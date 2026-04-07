'use client'

import { motion } from 'motion/react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts'
import {
  Users,
  DollarSign,
  CalendarCheck,
  Target,
  MessagesSquare,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Clock,
} from 'lucide-react'
import { MOTION, fadeInUp, staggerContainer } from '@/lib/motion'
import { cn } from '@/lib/utils'
import type { AdminDashboardData } from '@/lib/services/interfaces/admin-dashboard-service'
import Link from 'next/link'

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

  const chartData = data.revenue.planBreakdown.map((p) => ({
    name: p.planName,
    value: p.userCount,
    cost: p.cost,
    revenue: p.cost * p.userCount,
  }))

  const totalChartUsers = chartData.reduce((s, d) => s + d.value, 0)

  const appointmentSuccessRate =
    data.appointments.totalThisMonth > 0
      ? Math.round(
          ((data.appointments.totalThisMonth -
            data.appointments.cancelledThisMonth) /
            data.appointments.totalThisMonth) *
            100,
        )
      : 100

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

      {/* ── Row 1: MRR hero + Pendentes ── */}
      <motion.div
        variants={fadeInUp}
        transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
        className="mt-8 grid gap-4 lg:grid-cols-3"
      >
        {/* MRR Hero */}
        <div className="card-hero relative overflow-hidden p-6 lg:col-span-2">
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/15">
                <DollarSign className="h-4 w-4 text-accent" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
                Receita Recorrente Mensal
              </p>
            </div>
            <p className="mt-4 font-title text-4xl font-bold text-text-primary lg:text-5xl">
              {formatCurrency(data.revenue.mrr)}
            </p>
            <div className="mt-3 flex items-center gap-4">
              <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent">
                <TrendingUp className="h-3 w-3" />
                {data.revenue.planBreakdown.length} planos ativos
              </span>
              <span className="text-xs text-text-subtle">
                {totalChartUsers} usuários pagantes
              </span>
            </div>
          </div>
        </div>

        {/* Pendentes */}
        <Link
          href="/admin/usuarios?search="
          className={cn(
            'card-surface card-surface-interactive group relative overflow-hidden p-6',
            data.users.pendingOnboarding > 0 &&
              'ring-1 ring-gold/20',
          )}
        >
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
              Pendentes
            </p>
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br',
                data.users.pendingOnboarding > 0
                  ? 'from-gold/20 to-gold/5'
                  : 'from-surface-2 to-surface-2',
              )}
            >
              {data.users.pendingOnboarding > 0 ? (
                <Clock className="h-4 w-4 text-gold" />
              ) : (
                <Users className="h-4 w-4 text-text-subtle" />
              )}
            </div>
          </div>
          <p className="mt-3 font-title text-4xl font-bold text-text-primary">
            {data.users.pendingOnboarding}
          </p>
          <p
            className={cn(
              'mt-1 text-xs',
              data.users.pendingOnboarding > 0
                ? 'text-gold'
                : 'text-text-subtle',
            )}
          >
            {data.users.pendingOnboarding > 0
              ? 'Aguardando onboarding'
              : 'Nenhum pendente'}
          </p>
          <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-text-subtle/0 transition-all group-hover:text-text-subtle" />
        </Link>
      </motion.div>

      {/* ── Row 2: 4 metric cards ── */}
      <motion.div
        variants={fadeInUp}
        transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
        className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {/* Usuarios */}
        <Link
          href="/admin/usuarios"
          className="card-surface card-surface-interactive group relative p-5"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
              Usuários
            </p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-accent/5">
              <Users className="h-4 w-4 text-accent" />
            </div>
          </div>
          <p className="mt-3 font-title text-3xl font-bold text-text-primary">
            {data.users.total}
          </p>
          <span className="mt-1 inline-flex items-center gap-1 text-xs text-accent">
            +{data.users.newThisMonth} novos este mês
          </span>
          <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-text-subtle/0 transition-all group-hover:text-text-subtle" />
        </Link>

        {/* Agendamentos */}
        <Link
          href="/agenda"
          className="card-surface card-surface-interactive group relative p-5"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
              Agendamentos
            </p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet/20 to-violet/5">
              <CalendarCheck className="h-4 w-4 text-violet" />
            </div>
          </div>
          <p className="mt-3 font-title text-3xl font-bold text-text-primary">
            {data.appointments.totalThisMonth}
          </p>
          <div className="mt-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-text-subtle">
                {appointmentSuccessRate}% confirmados
              </span>
              <span className="text-danger">
                {data.appointments.cancelledThisMonth} cancelados
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-violet"
                style={{ width: `${appointmentSuccessRate}%` }}
              />
            </div>
          </div>
          <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-text-subtle/0 transition-all group-hover:text-text-subtle" />
        </Link>

        {/* Leads */}
        <div className="card-surface p-5">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
              Leads
            </p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald/20 to-emerald/5">
              <Target className="h-4 w-4 text-emerald" />
            </div>
          </div>
          <p className="mt-3 font-title text-3xl font-bold text-text-primary">
            {data.leads.totalThisMonth}
          </p>
          <div className="mt-2">
            <div className="flex items-center justify-between text-[10px]">
              <span className="text-text-subtle">Taxa de conversão</span>
              <span className="font-semibold text-emerald">
                {Math.round(data.leads.conversionRate * 100)}%
              </span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-emerald"
                style={{
                  width: `${Math.round(data.leads.conversionRate * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Chats */}
        <Link
          href="/conversas"
          className="card-surface card-surface-interactive group relative p-5"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-subtle">
              Chats
            </p>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold/20 to-gold/5">
              <MessagesSquare className="h-4 w-4 text-gold" />
            </div>
          </div>
          <p className="mt-3 font-title text-3xl font-bold text-text-primary">
            {data.chats.totalMessagesThisMonth.toLocaleString('pt-BR')}
          </p>
          <p className="mt-1 text-xs text-text-subtle">
            {data.chats.activeSessionsThisMonth} sessões ativas
          </p>
          <ArrowRight className="absolute bottom-4 right-4 h-4 w-4 text-text-subtle/0 transition-all group-hover:text-text-subtle" />
        </Link>
      </motion.div>

      {/* ── Row 3: Charts ── */}
      {chartData.length > 0 && (
        <motion.div
          variants={fadeInUp}
          transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
          className="mt-4 grid gap-4 lg:grid-cols-2"
        >
          {/* Donut chart */}
          <div className="card-surface p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
              Distribuição de planos
            </h2>

            <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
              <div className="relative h-48 w-48 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
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
                      formatter={(value) => [`${value} usuários`]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="font-title text-2xl font-bold text-text-primary">
                    {totalChartUsers}
                  </p>
                  <p className="text-[10px] text-text-subtle">total</p>
                </div>
              </div>

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
                      <p className="text-[11px] text-text-subtle">
                        {formatCurrency(item.cost)}/mês
                      </p>
                    </div>
                    <p className="text-sm font-semibold tabular-nums text-text-primary">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Revenue bar chart */}
          <div className="card-surface p-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-subtle">
              Receita por plano
            </h2>

            <div className="mt-4 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(240,237,232,0.06)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tickFormatter={(v) =>
                      `R$${(v / 1000).toFixed(1)}k`
                    }
                    tick={{ fill: 'rgba(240,237,232,0.45)', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={80}
                    tick={{ fill: 'rgba(240,237,232,0.65)', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E2228',
                      border: '1px solid rgba(240,237,232,0.08)',
                      borderRadius: '0.75rem',
                      fontSize: '0.8rem',
                    }}
                    itemStyle={{ color: '#F0EDE8' }}
                    formatter={(value) => [
                      formatCurrency(Number(value)),
                      'Receita',
                    ]}
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  />
                  <Bar dataKey="revenue" radius={[0, 6, 6, 0]}>
                    {chartData.map((_, i) => (
                      <Cell
                        key={i}
                        fill={CHART_COLORS[i % CHART_COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
