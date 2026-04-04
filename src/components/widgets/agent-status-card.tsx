'use client'

import { AnimateIn } from '@/components/ui/animate-in'
import type { AgentStatus } from '@/lib/types'

interface AgentStatusCardProps {
  agent: AgentStatus
  delay?: number
}

export function AgentStatusCard({ agent, delay = 0 }: AgentStatusCardProps) {
  const isOnline = agent.status === 'online'

  return (
    <AnimateIn delay={delay}>
      <div className="card-surface p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              {isOnline && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald opacity-75" />
              )}
              <span className={`relative inline-flex h-3 w-3 rounded-full ${isOnline ? 'bg-emerald' : 'bg-danger'}`} />
            </span>
            <div>
              <p className="font-title text-[15px] font-bold text-text-primary">{agent.name}</p>
              <p className="text-[11px] text-text-muted">{isOnline ? 'Online' : 'Offline'}</p>
            </div>
          </div>
          <div className="text-right">
            {agent.active_conversations !== undefined && (
              <p className="text-[13px] text-text-muted">
                <span className="font-title text-[20px] font-bold text-text-primary">{agent.active_conversations}</span>{' '}
                conversas ativas
              </p>
            )}
            {agent.active_campaigns !== undefined && (
              <p className="text-[13px] text-text-muted">
                <span className="font-title text-[20px] font-bold text-text-primary">{agent.active_campaigns}</span>{' '}
                campanhas ativas
              </p>
            )}
          </div>
        </div>
      </div>
    </AnimateIn>
  )
}
