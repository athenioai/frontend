import type { IConversationService } from './interfaces/conversation-service'
import type { ConversationSummary, Message } from '@/lib/types'
import { apiClient } from '@/lib/api/client'

export class ConversationService implements IConversationService {
  async list(_companyId: string, params?: { filter?: string; search?: string }): Promise<ConversationSummary[]> {
    const qs = new URLSearchParams()
    if (params?.filter) qs.set('filter', params.filter)
    if (params?.search) qs.set('search', params.search)
    const query = qs.toString()
    return apiClient<ConversationSummary[]>(`/conversations${query ? `?${query}` : ''}`)
  }

  async getMessages(leadId: string): Promise<Message[]> {
    return apiClient<Message[]>(`/conversations/${leadId}`)
  }

  async sendMessage(leadId: string, content: string): Promise<Message> {
    return apiClient<Message>(`/conversations/${leadId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    })
  }

  async takeOver(leadId: string): Promise<void> {
    await apiClient<void>(`/conversations/${leadId}/takeover`, { method: 'POST' })
  }
}
