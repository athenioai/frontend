import { authService, campaignService, analyticsService, leadService, alertService } from '@/lib/services'
import { redirect } from 'next/navigation'
import { RoiCard } from '@/components/widgets/roi-card'
import { HealthScoreWidget } from '@/components/widgets/health-score'
import { KpiCard } from '@/components/widgets/kpi-card'
import { FunilWidget } from '@/components/widgets/funil-widget'
import { TopObjecoesWidget } from '@/components/widgets/top-objecoes'
import { AtividadeAgentesWidget } from '@/components/widgets/atividade-agentes'
import { FeedAlertasWidget } from '@/components/widgets/feed-alertas'
import { DashboardGreeting } from '@/components/widgets/dashboard-greeting'

export default async function DashboardPage() {
  const user = await authService.getSession()
  if (!user) redirect('/login')

  const [roi, health, funil, ltvCac, objecoes, economia, agentes, alerts] = await Promise.all([
    campaignService.getRoiTotal(user.empresa_id),
    analyticsService.getHealthScore(user.empresa_id),
    leadService.getFunilStats(user.empresa_id, '30d'),
    analyticsService.getLtvCac(user.empresa_id),
    leadService.getTopObjecoes(user.empresa_id),
    analyticsService.getEconomiaHoras(user.empresa_id),
    analyticsService.getAtividadeAgentes(user.empresa_id),
    alertService.getRecentes(user.empresa_id),
  ])

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <DashboardGreeting userName={user.nome} healthScore={health.score} />

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
            value={roi.retorno}
            prefix="R$ "
            decimals={0}
            icon="DollarSign"
            accentColor="#E8C872"
            change={12.4}
            delay={0}
          />
          <KpiCard
            label="Conversão"
            value={health.taxa_conversao * 100}
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
            value={economia.horas}
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
            <FunilWidget stats={funil} />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <TopObjecoesWidget data={objecoes} />
          </div>
        </div>
      </div>

      {/* Section: Agentes */}
      <div>
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-subtle">
          Agentes IA
        </p>
        <AtividadeAgentesWidget data={agentes} />
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
