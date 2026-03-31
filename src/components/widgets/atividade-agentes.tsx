import { Megaphone, MessageSquare, Brain } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format'
import { AnimateIn } from '@/components/ui/animate-in'
import { AGENT_COLORS } from '@/lib/constants/theme'
import type { AgentesAtividade } from '@/lib/types'

export function AtividadeAgentesWidget({ data }: { data: AgentesAtividade }) {
  const agents = [
    {
      nome: 'Hermes',
      subtitulo: 'Marketing',
      icon: Megaphone,
      color: AGENT_COLORS.hermes,
      metricas: [
        { label: 'Campanhas ativas', value: data.hermes.campanhas_ativas },
        { label: 'Leads em nutrição', value: data.hermes.leads_nutricao },
        { label: 'Último criativo', value: data.hermes.ultimo_criativo },
        { label: 'Próximo ciclo', value: data.hermes.proximo_ciclo },
      ],
    },
    {
      nome: 'Ares',
      subtitulo: 'Comercial',
      icon: MessageSquare,
      color: AGENT_COLORS.ares,
      metricas: [
        { label: 'Conversas ativas', value: data.ares.conversas_ativas },
        { label: 'Vendas hoje', value: data.ares.vendas_hoje },
        { label: 'Follow-ups agendados', value: data.ares.followups_agendados },
        { label: 'Aguardando resposta', value: data.ares.leads_aguardando },
      ],
    },
    {
      nome: 'Athena',
      subtitulo: 'Orquestrador',
      icon: Brain,
      color: AGENT_COLORS.athena,
      metricas: [
        { label: 'Último ciclo', value: formatRelativeTime(data.athena.ultimo_ciclo) },
        { label: 'Resumo', value: data.athena.ultimo_ciclo_resumo },
        { label: 'Última decisão', value: data.athena.ultima_decisao },
        { label: 'Alertas disparados', value: data.athena.alertas_disparados },
      ],
    },
  ]

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {agents.map((agent, i) => (
        <AnimateIn key={agent.nome} delay={i * 0.06}>
          <div
            className="card-surface p-5"
            style={{ borderLeft: `3px solid ${agent.color}` }}
          >
            <div className="mb-3 flex items-center gap-2">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full"
                style={{ backgroundColor: `color-mix(in srgb, ${agent.color} 15%, transparent)` }}
              >
                <agent.icon className="h-3.5 w-3.5" style={{ color: agent.color }} />
              </div>
              <span className="font-title text-sm font-bold">{agent.nome}</span>
              <span className="text-xs text-text-subtle">({agent.subtitulo})</span>
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
                style={{
                  backgroundColor: `color-mix(in srgb, ${agent.color} 10%, transparent)`,
                  color: agent.color,
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: agent.color }} />
                ativo
              </span>
            </div>
            <div className="space-y-2">
              {agent.metricas.map(({ label, value }) => (
                <div key={label} className="flex justify-between gap-2">
                  <span className="text-xs text-text-subtle">{label}</span>
                  <span className="text-right text-xs font-medium text-text-primary">
                    {typeof value === 'string' && value.length > 35
                      ? value.slice(0, 35) + '...'
                      : value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </AnimateIn>
      ))}
    </div>
  )
}
