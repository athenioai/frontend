import Link from 'next/link'
import { campaignService, analyticsService, leadService, alertService, empresaService } from '@/lib/services'
import { ArrowLeft, DollarSign, TrendingUp, BarChart3, Clock } from 'lucide-react'
import { RoiCard } from '@/components/widgets/roi-card'
import { HealthScoreWidget } from '@/components/widgets/health-score'
import { KpiCard } from '@/components/widgets/kpi-card'
import { FunilWidget } from '@/components/widgets/funil-widget'
import { TopObjecoesWidget } from '@/components/widgets/top-objecoes'
import { AtividadeAgentesWidget } from '@/components/widgets/atividade-agentes'
import { FeedAlertasWidget } from '@/components/widgets/feed-alertas'

export default async function AdminEmpresaPage({
  params,
}: {
  params: Promise<{ empresaId: string }>
}) {
  const { empresaId } = await params
  const empresa = await empresaService.getById(empresaId)

  if (!empresa) {
    return <p className="text-text-muted">Empresa não encontrada.</p>
  }

  const [roi, health, funil, ltvCac, objecoes, economia, agentes, alerts] = await Promise.all([
    campaignService.getRoiTotal(empresaId),
    analyticsService.getHealthScore(empresaId),
    leadService.getFunilStats(empresaId, '30d'),
    analyticsService.getLtvCac(empresaId),
    leadService.getTopObjecoes(empresaId),
    analyticsService.getEconomiaHoras(empresaId),
    analyticsService.getAtividadeAgentes(empresaId),
    alertService.getRecentes(empresaId),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin" className="text-text-muted hover:text-accent">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-title text-2xl font-bold">{empresa.nome}</h1>
        <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          Modo visualização
        </span>
      </div>

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
          icon={DollarSign}
          accentColor="#FBBF24"
          delay={0}
        />
        <KpiCard
          label="Conversão"
          value={health.taxa_conversao * 100}
          suffix="%"
          decimals={1}
          icon={TrendingUp}
          accentColor="#4FD1C5"
          delay={0.06}
        />
        <KpiCard
          label="LTV / CAC"
          value={ltvCac.ltv / ltvCac.cac}
          suffix="x"
          decimals={1}
          icon={BarChart3}
          accentColor="#A78BFA"
          delay={0.12}
        />
        <KpiCard
          label="Horas Salvas"
          value={economia.horas}
          suffix="h"
          decimals={0}
          icon={Clock}
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
