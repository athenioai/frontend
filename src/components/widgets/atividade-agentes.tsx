'use client'

import { Megaphone, MessageSquare, Brain, Activity } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils/format'
import { AnimateIn } from '@/components/ui/animate-in'
import { AGENT_COLORS } from '@/lib/constants/theme'
import type { AgentsActivity } from '@/lib/types'

function AgentCard({
  nome,
  subtitulo,
  icon: Icon,
  color,
  highlight,
  metricas,
  delay,
  className = '',
}: {
  nome: string
  subtitulo: string
  icon: typeof Megaphone
  color: string
  highlight: { label: string; value: string | number }
  metricas: { label: string; value: string | number }[]
  delay: number
  className?: string
}) {
  return (
    <AnimateIn delay={delay} className={className}>
      <div className="card-surface group relative h-full overflow-hidden p-6">
        {/* Top accent gradient line */}
        <div
          className="absolute left-0 right-0 top-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, ${color}, transparent 70%)` }}
        />

        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: `linear-gradient(135deg, ${color}20, ${color}08)` }}
            >
              <Icon className="h-[18px] w-[18px]" style={{ color }} />
            </div>
            <div>
              <p className="font-title text-[14px] font-bold text-text-primary">{nome}</p>
              <p className="text-[11px] text-text-subtle">{subtitulo}</p>
            </div>
          </div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
            style={{ backgroundColor: `${color}10`, color }}
          >
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: color }} />
            ativo
          </span>
        </div>

        {/* Highlighted metric */}
        <div
          className="mb-5 rounded-xl p-4"
          style={{ background: `linear-gradient(135deg, ${color}08, transparent)` }}
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-subtle">
            {highlight.label}
          </p>
          <p className="mt-1 font-title text-[28px] font-bold leading-none" style={{ color }}>
            {highlight.value}
          </p>
        </div>

        {/* Secondary metrics */}
        <div className="space-y-3">
          {metricas.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between gap-3">
              <span className="text-[12px] text-text-subtle">{label}</span>
              <span className="text-right text-[12px] font-medium text-text-primary">
                {typeof value === 'string' && value.length > 28 ? value.slice(0, 28) + '…' : value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AnimateIn>
  )
}

export function AtividadeAgentesWidget({ data }: { data: AgentsActivity }) {
  return (
    <div className="space-y-5">
      {/* Ares + Kairos — side by side */}
      <div className="grid gap-5 lg:grid-cols-2">
        <AgentCard
          nome="Ares"
          subtitulo="Marketing"
          icon={Megaphone}
          color={AGENT_COLORS.ares}
          highlight={{ label: 'Campanhas ativas', value: data.ares.active_campaigns }}
          metricas={[
            { label: 'Leads em nutrição', value: data.ares.nurturing_leads },
            { label: 'Último criativo', value: data.ares.latest_creative },
            { label: 'Próximo ciclo', value: data.ares.next_cycle },
          ]}
          delay={0}
        />
        <AgentCard
          nome="Kairos"
          subtitulo="Comercial"
          icon={MessageSquare}
          color={AGENT_COLORS.kairos}
          highlight={{ label: 'Vendas hoje', value: data.kairos.sales_today }}
          metricas={[
            { label: 'Conversas ativas', value: data.kairos.active_conversations },
            { label: 'Follow-ups agendados', value: data.kairos.scheduled_followups },
            { label: 'Aguardando resposta', value: data.kairos.waiting_leads },
          ]}
          delay={0.08}
        />
      </div>

      {/* Athena — full width, orchestrator gets special treatment */}
      <AnimateIn delay={0.16}>
        <div className="card-surface group relative overflow-hidden p-6">
          <div
            className="absolute left-0 right-0 top-0 h-[2px]"
            style={{ background: `linear-gradient(90deg, ${AGENT_COLORS.athena}, transparent 50%)` }}
          />

          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            {/* Left: header + highlight */}
            <div className="flex-1">
              <div className="mb-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: `linear-gradient(135deg, ${AGENT_COLORS.athena}20, ${AGENT_COLORS.athena}08)` }}
                  >
                    <Brain className="h-[18px] w-[18px]" style={{ color: AGENT_COLORS.athena }} />
                  </div>
                  <div>
                    <p className="font-title text-[14px] font-bold text-text-primary">Athena</p>
                    <p className="text-[11px] text-text-subtle">Orquestrador — monitora e decide</p>
                  </div>
                </div>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
                  style={{ backgroundColor: `${AGENT_COLORS.athena}10`, color: AGENT_COLORS.athena }}
                >
                  <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: AGENT_COLORS.athena }} />
                  ativo
                </span>
              </div>

              <div
                className="rounded-xl p-4"
                style={{ background: `linear-gradient(135deg, ${AGENT_COLORS.athena}08, transparent)` }}
              >
                <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-subtle">
                  Última decisão
                </p>
                <p className="mt-1.5 text-[14px] font-medium leading-relaxed text-text-primary">
                  {data.athena.last_decision}
                </p>
              </div>
            </div>

            {/* Right: metrics in a row */}
            <div className="flex gap-6 lg:gap-8">
              {[
                { label: 'Alertas disparados', value: data.athena.alerts_fired, color: AGENT_COLORS.athena },
                { label: 'Último ciclo', value: formatRelativeTime(data.athena.last_cycle), color: undefined },
              ].map(({ label, value, color }) => (
                <div key={label} className="text-center lg:text-right">
                  <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-text-subtle">{label}</p>
                  <p
                    className="mt-1 font-title text-[24px] font-bold leading-none"
                    style={color ? { color } : undefined}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Athena summary */}
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-[rgba(240,237,232,0.03)] px-3 py-2">
            <Activity className="h-3.5 w-3.5 text-text-subtle" />
            <p className="text-[12px] text-text-muted">
              {data.athena.last_cycle_summary}
            </p>
          </div>
        </div>
      </AnimateIn>
    </div>
  )
}
