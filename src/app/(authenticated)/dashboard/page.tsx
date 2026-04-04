import { authService, campaignService, analyticsService, leadService, alertService, readinessService, agentService, conversationService } from '@/lib/services'
import { redirect } from 'next/navigation'
import { RoiCard } from '@/components/widgets/roi-card'
import { HealthScoreWidget } from '@/components/widgets/health-score'
import { KpiCard } from '@/components/widgets/kpi-card'
import { FunilWidget } from '@/components/widgets/funil-widget'
import { TopObjecoesWidget } from '@/components/widgets/top-objecoes'
import { AtividadeAgentesWidget } from '@/components/widgets/atividade-agentes'
import { FeedAlertasWidget } from '@/components/widgets/feed-alertas'
import { DashboardGreeting } from '@/components/widgets/dashboard-greeting'
import { ReadinessBanner } from '@/components/widgets/readiness-banner'
import { LtvCacWidget } from '@/components/widgets/ltv-cac-widget'
import { TimeSavedWidget } from '@/components/widgets/time-saved-widget'
import { AgentStatusCard } from '@/components/widgets/agent-status-card'
import { RecentActivity } from '@/components/widgets/recent-activity'

export default async function DashboardPage() {
  const user = await authService.getSession()
  if (!user) redirect('/login')

  const [roi, health, funnel, ltvCac, objections, hoursSaved, agents, alerts, readiness, agentStatus, conversations] = await Promise.all([
    campaignService.getTotalRoi(user.company_id),
    analyticsService.getHealthScore(user.company_id),
    leadService.getFunnelStats(user.company_id, '30d'),
    analyticsService.getLtvCac(user.company_id),
    leadService.getTopObjections(user.company_id),
    analyticsService.getHoursSaved(user.company_id),
    analyticsService.getAgentsActivity(user.company_id),
    alertService.getRecent(user.company_id),
    readinessService.check(),
    agentService.getStatus(user.company_id),
    conversationService.list(user.company_id),
  ])

  return (
    <div className="space-y-8">
      {/* Readiness Banner */}
      <ReadinessBanner readiness={readiness} />
      {/* Greeting */}
      <DashboardGreeting userName={user.name} healthScore={health.score} />

      {/* Row 1: Hero Zone */}
      <div className="grid gap-6 grid-cols-12">
        <div className="col-span-12 lg:col-span-8">
          <RoiCard initial={roi} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <HealthScoreWidget data={health} />
        </div>
      </div>

      {/* Section: KPIs */}
      <div>
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
          Indicadores principais
        </p>
        <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
          <KpiCard
            label="Revenue"
            value={roi.revenue}
            prefix="R$ "
            decimals={0}
            icon="DollarSign"
            accentColor="#E8C872"
            change={12.4}
            delay={0}
          />
          <KpiCard
            label="Conversão"
            value={health.conversion_rate * 100}
            suffix="%"
            decimals={1}
            icon="TrendingUp"
            accentColor="#4FD1C5"
            change={3.2}
            delay={0.06}
          />
          <KpiCard
            label="LTV / CAC"
            value={ltvCac.ltv / ltvCac.cac}
            suffix="x"
            decimals={1}
            icon="BarChart3"
            accentColor="#A78BFA"
            change={-1.8}
            delay={0.12}
          />
          <KpiCard
            label="Horas Salvas"
            value={hoursSaved.hours}
            suffix="h"
            decimals={0}
            icon="Clock"
            accentColor="#34D399"
            change={8.7}
            delay={0.18}
          />
        </div>
      </div>

      {/* Section: Análise */}
      <div>
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
          Análise
        </p>
        <div className="grid gap-6 grid-cols-12">
          <div className="col-span-12 lg:col-span-8">
            <FunilWidget stats={funnel} />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <TopObjecoesWidget data={objections} />
          </div>
        </div>
      </div>

      {/* Section: LTV/CAC + Economia de Tempo */}
      <div>
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
          Eficiência
        </p>
        <div className="grid gap-6 grid-cols-12">
          <div className="col-span-12 lg:col-span-8">
            <LtvCacWidget
              data={ltvCac.history.map((entry) => ({ name: entry.name, ltv: entry.total_amount }))}
              ltvCacRatio={ltvCac.cac > 0 ? ltvCac.ltv / ltvCac.cac : 0}
            />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <TimeSavedWidget
              hoursSaved={hoursSaved.hours}
              tasksAutomated={Math.round(hoursSaved.hours * 20)}
            />
          </div>
        </div>
      </div>

      {/* Section: Status dos Agentes */}
      <div>
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
          Status dos Agentes
        </p>
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
          {agentStatus.map((agent, i) => (
            <AgentStatusCard key={agent.name} agent={agent} delay={i * 0.06} />
          ))}
        </div>
      </div>

      {/* Section: Atividade Recente */}
      <div>
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
          Atividade Recente
        </p>
        <RecentActivity conversations={conversations} alerts={alerts} />
      </div>

      {/* Section: Agentes */}
      <div>
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
          Agentes IA
        </p>
        <AtividadeAgentesWidget data={agents} />
      </div>

      {/* Section: Alertas */}
      <div>
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
          Atividade recente
        </p>
        <FeedAlertasWidget alerts={alerts} />
      </div>
    </div>
  )
}
