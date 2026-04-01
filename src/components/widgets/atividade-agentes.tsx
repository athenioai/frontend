'use client'

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
      highlight: { label: 'Campanhas ativas', value: data.hermes.campanhas_ativas },
      metricas: [
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
      highlight: { label: 'Vendas hoje', value: data.ares.vendas_hoje },
      metricas: [
        { label: 'Conversas ativas', value: data.ares.conversas_ativas },
        { label: 'Follow-ups agendados', value: data.ares.followups_agendados },
        { label: 'Aguardando resposta', value: data.ares.leads_aguardando },
      ],
    },
    {
      nome: 'Athena',
      subtitulo: 'Orquestrador',
      icon: Brain,
      color: AGENT_COLORS.athena,
      highlight: { label: 'Alertas disparados', value: data.athena.alertas_disparados },
      metricas: [
        { label: 'Último ciclo', value: formatRelativeTime(data.athena.ultimo_ciclo) },
        { label: 'Resumo', value: data.athena.ultimo_ciclo_resumo },
        { label: 'Última decisão', value: data.athena.ultima_decisao },
      ],
    },
  ]

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {agents.map((agent, i) => (
        <AnimateIn key={agent.nome} delay={i * 0.08}>
          <div className="card-surface group relative overflow-hidden p-6">
            {/* Top accent gradient line */}
            <div
              className="absolute left-0 right-0 top-0 h-[2px]"
              style={{ background: `linear-gradient(90deg, ${agent.color}, transparent 70%)` }}
            />

            {/* Header: icon + name + status */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl"
                  style={{ background: `linear-gradient(135deg, ${agent.color}20, ${agent.color}08)` }}
                >
                  <agent.icon className="h-[18px] w-[18px]" style={{ color: agent.color }} />
                </div>
                <div>
                  <p className="font-title text-[14px] font-bold text-text-primary">{agent.nome}</p>
                  <p className="text-[11px] text-text-subtle">{agent.subtitulo}</p>
                </div>
              </div>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
                style={{ backgroundColor: `${agent.color}10`, color: agent.color }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full animate-pulse"
                  style={{ backgroundColor: agent.color }}
                />
                ativo
              </span>
            </div>

            {/* Highlighted metric — big number */}
            <div
              className="mb-5 rounded-xl p-4"
              style={{ background: `linear-gradient(135deg, ${agent.color}08, transparent)` }}
            >
              <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-subtle">
                {agent.highlight.label}
              </p>
              <p className="mt-1 font-title text-[28px] font-bold leading-none" style={{ color: agent.color }}>
                {agent.highlight.value}
              </p>
            </div>

            {/* Secondary metrics */}
            <div className="space-y-3">
              {agent.metricas.map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <span className="text-[12px] text-text-subtle">{label}</span>
                  <span className="text-right text-[12px] font-medium text-text-primary">
                    {typeof value === 'string' && value.length > 28
                      ? value.slice(0, 28) + '…'
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
