export interface Conversation {
  id: string
  empresa_id: string
  lead_id: string
  mensagens_count: number
  duracao_minutos: number
  agente: 'hermes' | 'ares'
  created_at: string
}

export interface ConversationSummary {
  id: string
  empresa_id: string
  lead_id: string
  resumo: string
  ultima_dor: string
  estagio_funil: string
  objecoes_ativas: string[]
  created_at: string
}
