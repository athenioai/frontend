export interface SupportTicket {
  id: string
  empresa_id: string
  assunto: string
  status: 'aberto' | 'resolvido'
  created_at: string
  updated_at: string
}

export interface SupportMessage {
  id: string
  ticket_id: string
  sender: 'user' | 'agent'
  text: string
  created_at: string
}
