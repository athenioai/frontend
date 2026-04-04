'use client'

import { motion } from 'motion/react'
import { fadeInUp, staggerContainer, MOTION } from '@/lib/motion'
import { StatusBadge, DECISION_TYPE_COLORS } from '@/components/common/status-badge'
import { EmptyState } from '@/components/common/empty-state'
import { formatRelativeTime } from '@/lib/utils/format'
import { GitBranch } from 'lucide-react'
import type { OrchestratorDecision } from '@/lib/types'

interface DecisionTimelineProps {
  decisions: OrchestratorDecision[]
}

const DECISION_LABELS: Record<string, string> = {
  scale_budget: 'Escalar Budget',
  pause_campaigns: 'Pausar Campanhas',
  reduce_bids: 'Reduzir Lances',
  whale_detected: 'Whale Detectado',
  handoff: 'Handoff',
  cycle_summary: 'Resumo do Ciclo',
  tenant_config_invalid: 'Config Invalida',
  reflection_failed: 'Reflexao Falhou',
}

const DOT_COLORS: Record<string, string> = {
  scale_budget: 'bg-emerald',
  pause_campaigns: 'bg-gold',
  reduce_bids: 'bg-orange-400',
  whale_detected: 'bg-accent',
  handoff: 'bg-violet',
  cycle_summary: 'bg-text-subtle',
  tenant_config_invalid: 'bg-danger',
  reflection_failed: 'bg-danger',
}

export function DecisionTimeline({ decisions }: DecisionTimelineProps) {
  if (decisions.length === 0) {
    return (
      <EmptyState
        icon={GitBranch}
        title="Nenhuma decisao registrada"
        description="As decisoes do orchestrator aparecerao aqui quando forem tomadas."
      />
    )
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="relative"
    >
      {/* Gradient timeline line */}
      <div className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-accent/20 via-accent/10 to-transparent" />

      <div className="space-y-1">
        {decisions.map((decision) => (
          <motion.div
            key={decision.id}
            variants={fadeInUp}
            transition={{ duration: MOTION.duration.slow, ease: MOTION.ease.out }}
            className="relative flex gap-4 pl-10 py-3"
          >
            {/* Timeline dot */}
            <div
              className={`absolute left-[10px] top-5 h-[12px] w-[12px] rounded-full border-2 border-surface-1 ${
                DOT_COLORS[decision.type] ?? 'bg-text-subtle'
              }`}
            />

            {/* Card */}
            <div className="card-surface flex-1 p-4 transition-colors hover:bg-accent/5">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <StatusBadge
                    status={DECISION_LABELS[decision.type] ?? decision.type}
                    colorMap={
                      Object.fromEntries(
                        Object.entries(DECISION_LABELS).map(([k, v]) => [
                          v,
                          DECISION_TYPE_COLORS[k],
                        ]),
                      ) as Record<string, 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'orange' | 'purple'>
                    }
                  />
                </div>
                <span className="shrink-0 text-[11px] text-text-subtle">
                  {formatRelativeTime(decision.created_at)}
                </span>
              </div>
              <p className="text-[13px] text-text-primary">{decision.input_summary}</p>
              {decision.result && (
                <p className="mt-1 text-[12px] text-text-muted">{decision.result}</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
