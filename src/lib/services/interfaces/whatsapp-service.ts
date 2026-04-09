export type WhatsAppInstanceStatus =
  | 'connected'
  | 'disconnected'

export interface WhatsAppInstance {
  id: string
  status: WhatsAppInstanceStatus
  display_name: string | null
  phone_number: string | null
  connected_at: string | null
  created_at: string
  updated_at: string
}

export interface WhatsAppInstanceDetail {
  status: WhatsAppInstanceStatus
  messages_sent_today: number
  messages_received_today: number
  messages_sent_week: number
  messages_received_week: number
}

export interface SendTextParams {
  to: string
  content: string
}

export interface SendTextSequenceParams {
  to: string
  messages: string[]
}

export interface SendTextResponse {
  message_id: string
}

export interface SendTextSequenceResponse {
  message_ids: string[]
}

export interface ConnectParams {
  phone_number: string
}

export interface IWhatsAppService {
  listInstances(): Promise<WhatsAppInstance[]>
  getInstance(id: string): Promise<WhatsAppInstance>
  deleteInstance(id: string): Promise<void>
  connect(id: string, params: ConnectParams): Promise<WhatsAppInstance>
  disconnect(id: string): Promise<{ status: string }>
  getStatus(id: string): Promise<WhatsAppInstanceDetail>
  sendText(id: string, params: SendTextParams): Promise<SendTextResponse>
  sendTextSequence(id: string, params: SendTextSequenceParams): Promise<SendTextSequenceResponse>
}
