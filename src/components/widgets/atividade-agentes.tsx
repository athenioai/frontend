import { Megaphone, MessageSquare, Brain } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format'
import type { AgentesAtividade } from '@/lib/types'

export function AtividadeAgentesWidget({ data }: { data: AgentesAtividade }) {
  const agents = [
    {
      nome: 'Hermes',
      subtitulo: 'Marketing',
      icon: Megaphone,
      status: 'ativo',
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
      status: 'ativo',
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
      status: 'ativo',
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
      {agents.map((agent) => (
        <div key={agent.nome} className="glass-card border-l-[3px] border-l-accent">
          <div className="mb-3 flex items-center gap-2">
            <agent.icon className="h-4 w-4 text-accent" />
            <span className="font-title text-sm font-bold">{agent.nome}</span>
            <span className="text-xs text-text-subtle">({agent.subtitulo})</span>
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {agent.status}
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
      ))}
    </div>
  )
}
