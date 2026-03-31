import { authService, campaignService, analyticsService, leadService, alertService } from '@/lib/services'
import { redirect } from 'next/navigation'
import { RoiCard } from '@/components/widgets/roi-card'
import { HealthScoreWidget } from '@/components/widgets/health-score'
import { KpiCard } from '@/components/widgets/kpi-card'
import { FunilWidget } from '@/components/widgets/funil-widget'
import { TopObjecoesWidget } from '@/components/widgets/top-objecoes'
import { AtividadeAgentesWidget } from '@/components/widgets/atividade-agentes'
import { FeedAlertasWidget } from '@/components/widgets/feed-alertas'

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
    <div className="space-y-6">
      {/* Row 1: Hero Zone */}
      <div className="grid gap-6 grid-cols-12">
        <div className="col-span-12 lg:col-span-8">
          <RoiCard initial={roi} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <HealthScoreWidget data={health} />
        </div>
      </div>

      {/* Row 2: KPI Strip */}
      <div className="grid gap-6 grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Revenue"
          value={roi.retorno}
          prefix="R$ "
          decimals={0}
          icon="DollarSign"
          accentColor="#FBBF24"
          delay={0}
        />
        <KpiCard
          label="Conversão"
          value={health.taxa_conversao * 100}
          suffix="%"
          decimals={1}
          icon="TrendingUp"
          accentColor="#4FD1C5"
          delay={0.06}
        />
        <KpiCard
          label="LTV / CAC"
          value={ltvCac.ltv / ltvCac.cac}
          suffix="x"
          decimals={1}
          icon="BarChart3"
          accentColor="#A78BFA"
          delay={0.12}
        />
        <KpiCard
          label="Horas Salvas"
          value={economia.horas}
          suffix="h"
          decimals={0}
          icon="Clock"
          accentColor="#4FD1C5"
          delay={0.18}
        />
      </div>

      {/* Row 3: Análise */}
      <div className="grid gap-6 grid-cols-12">
        <div className="col-span-12 lg:col-span-8">
          <FunilWidget stats={funil} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <TopObjecoesWidget data={objecoes} />
        </div>
      </div>

      {/* Row 4: Agentes */}
      <AtividadeAgentesWidget data={agentes} />

      {/* Row 5: Alertas */}
      <FeedAlertasWidget alerts={alerts} />
    </div>
  )
}
