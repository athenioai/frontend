import Link from 'next/link'
import { campaignService, analyticsService, leadService, alertService, empresaService } from '@/lib/services'
import { ArrowLeft } from 'lucide-react'
import { RoiCard } from '@/components/widgets/roi-card'
import { HealthScoreWidget } from '@/components/widgets/health-score'
import { FunilWidget } from '@/components/widgets/funil-widget'
import { LtvCacWidget } from '@/components/widgets/ltv-cac'
import { TopObjecoesWidget } from '@/components/widgets/top-objecoes'
import { EconomiaTempoWidget } from '@/components/widgets/economia-tempo'
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

      <RoiCard initial={roi} />
      <div className="grid gap-6 lg:grid-cols-2">
        <HealthScoreWidget data={health} />
        <FunilWidget stats={funil} />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <LtvCacWidget data={ltvCac} />
        <div className="lg:col-span-1">
          <TopObjecoesWidget data={objecoes} />
        </div>
      </div>
      <EconomiaTempoWidget horas={economia.horas} />
      <AtividadeAgentesWidget data={agentes} />
      <FeedAlertasWidget alerts={alerts} />
    </div>
  )
}
