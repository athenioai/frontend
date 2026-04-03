export interface SupportTicket {
  id: string
  company_id: string
  subject: string
  status: 'open' | 'resolved'
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
