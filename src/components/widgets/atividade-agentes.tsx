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
        <AnimateIn key={agent.nome} delay={i * 0.08}>
          <div className="card-surface group relative overflow-hidden p-5">
            {/* Subtle top accent line */}
            <div
              className="absolute left-0 right-0 top-0 h-[1px]"
              style={{ background: `linear-gradient(90deg, transparent, ${agent.color}30, transparent)` }}
            />

            <div className="mb-4 flex items-center gap-3">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: `linear-gradient(135deg, ${agent.color}18, ${agent.color}08)` }}
              >
                <agent.icon className="h-4 w-4" style={{ color: agent.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-title text-[14px] font-bold text-text-primary">
                    {agent.nome}
                  </span>
                  <span className="text-[11px] text-text-subtle">
                    {agent.subtitulo}
                  </span>
                </div>
              </div>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                style={{
                  backgroundColor: `${agent.color}0D`,
                  color: agent.color,
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: agent.color }}
                />
                ativo
              </span>
            </div>

            <div className="space-y-2.5">
              {agent.metricas.map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <span className="text-[12px] text-text-subtle">{label}</span>
                  <span className="text-right text-[12px] font-medium text-text-primary">
                    {typeof value === 'string' && value.length > 30
                      ? value.slice(0, 30) + '…'
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
