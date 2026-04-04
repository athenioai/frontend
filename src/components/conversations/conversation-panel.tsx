'use client'

import { useState } from 'react'
import { ConversationList } from './conversation-list'
import { ChatView } from './chat-view'
import { MessageSquare } from 'lucide-react'
import type { ConversationSummary } from '@/lib/types'

interface ConversationPanelProps {
  initialConversations: ConversationSummary[]
}

export function ConversationPanel({ initialConversations }: ConversationPanelProps) {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)

  const selected = initialConversations.find((c) => c.lead_id === selectedLeadId)

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Left column: Conversation list */}
      <div
        className={`h-full w-full shrink-0 border-r border-border-default md:w-[380px] ${
          selectedLeadId ? 'hidden md:block' : 'block'
        }`}
      >
        <ConversationList
          conversations={initialConversations}
          selectedLeadId={selectedLeadId}
          onSelect={setSelectedLeadId}
        />
      </div>

      {/* Right column: Chat view */}
      <div
        className={`h-full min-w-0 flex-1 ${
          selectedLeadId ? 'block' : 'hidden md:block'
        }`}
      >
        {selected ? (
          <ChatView
            leadId={selected.lead_id}
            leadName={selected.lead_name}
            leadPhone={selected.lead_phone}
            funnelStage={selected.funnel_stage}
            temperature={selected.temperature}
            isHumanTakeover={selected.is_human_takeover}
            onBack={() => setSelectedLeadId(null)}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface-2">
              <MessageSquare className="h-7 w-7 text-text-subtle" />
            </div>
            <p className="font-title text-[16px] font-semibold text-text-muted">
              Selecione uma conversa
            </p>
            <p className="mt-1 text-[13px] text-text-subtle">
              Escolha uma conversa na lista ao lado para visualizar
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
