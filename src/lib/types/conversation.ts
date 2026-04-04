export interface Conversation {
  id: string
  company_id: string
  lead_id: string
  lead_name: string
  lead_phone: string
  messages_count: number
  duration_minutes: number
  agent: 'hermes' | 'ares'
  is_human_takeover: boolean
  is_whale: boolean
  funnel_stage: string
  temperature: string
  last_message_preview: string
  last_message_at: string
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  sender: 'agent' | 'lead' | 'human'
  text: string
  model?: string
  created_at: string
}

export interface ConversationSummary {
  id: string
  company_id: string
  lead_id: string
  lead_name: string
  lead_phone: string
  summary: string
  last_pain_point: string
  funnel_stage: string
  temperature: string
  active_objections: string[]
  is_human_takeover: boolean
  is_whale: boolean
  last_message_preview: string
  last_message_at: string
  created_at: string
}
