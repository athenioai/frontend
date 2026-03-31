import { authService, campaignService, analyticsService, leadService, alertService } from '@/lib/services'
import { redirect } from 'next/navigation'
import { RoiCard } from '@/components/widgets/roi-card'
import { HealthScoreWidget } from '@/components/widgets/health-score'
import { FunilWidget } from '@/components/widgets/funil-widget'
import { LtvCacWidget } from '@/components/widgets/ltv-cac'
import { TopObjecoesWidget } from '@/components/widgets/top-objecoes'
import { EconomiaTempoWidget } from '@/components/widgets/economia-tempo'
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
      {/* ROI — full width, first visible element */}
      <RoiCard initial={roi} />

      {/* Health Score + Funil — 2 cols */}
      <div className="grid gap-6 lg:grid-cols-2">
        <HealthScoreWidget data={health} />
        <FunilWidget stats={funil} />
      </div>

      {/* LTV/CAC + Objeções — 3 cols */}
      <div className="grid gap-6 lg:grid-cols-3">
        <LtvCacWidget data={ltvCac} />
        <div className="lg:col-span-1">
          <TopObjecoesWidget data={objecoes} />
        </div>
      </div>

      {/* Economia de tempo — full width */}
      <EconomiaTempoWidget horas={economia.horas} />

      {/* Atividade dos agentes — 3 cols */}
      <AtividadeAgentesWidget data={agentes} />

      {/* Feed de alertas — full width */}
      <FeedAlertasWidget alerts={alerts} />
    </div>
  )
}
