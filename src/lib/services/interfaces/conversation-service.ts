import type { ConversationSummary, Message } from '@/lib/types'

export interface IConversationService {
  list(companyId: string, params?: { filter?: string; search?: string }): Promise<ConversationSummary[]>
  getMessages(leadId: string): Promise<Message[]>
  sendMessage(leadId: string, content: string): Promise<Message>
  takeOver(leadId: string): Promise<void>
}
