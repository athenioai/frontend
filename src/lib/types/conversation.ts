export interface Conversation {
  id: string
  company_id: string
  lead_id: string
  messages_count: number
  duration_minutes: number
  agent: 'hermes' | 'ares'
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender: 'agent' | 'lead'
  text: string
  created_at: string
}

export interface ConversationSummary {
  id: string
  company_id: string
  lead_id: string
  summary: string
  last_pain_point: string
  funnel_stage: string
  active_objections: string[]
  created_at: string
}
