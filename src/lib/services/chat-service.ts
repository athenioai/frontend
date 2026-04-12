import type {
  IChatService,
  PaginatedResponse,
  ChatSession,
  ChatMessage,
  ListSessionsParams,
  ListMessagesParams,
} from './interfaces/chat-service'
import { authFetch } from './auth-fetch'

export class ChatService implements IChatService {
  async listSessions(params?: ListSessionsParams): Promise<PaginatedResponse<ChatSession>> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.agent) searchParams.set('agent', params.agent)

    const query = searchParams.toString()
    const res = await authFetch(`/chats${query ? `?${query}` : ''}`)

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to fetch sessions')
    }

    return res.json()
  }

  async getMessages(
    sessionId: string,
    params?: ListMessagesParams,
  ): Promise<PaginatedResponse<ChatMessage>> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))

    const query = searchParams.toString()
    const res = await authFetch(`/chats/${sessionId}/messages${query ? `?${query}` : ''}`)

    if (!res.ok) {
      if (res.status === 404) throw new Error('NOT_FOUND')
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to fetch messages')
    }

    return res.json()
  }

  async deleteSession(sessionId: string): Promise<void> {
    const res = await authFetch(`/chats/${sessionId}`, { method: 'DELETE' })

    if (!res.ok) {
      if (res.status === 404) throw new Error('NOT_FOUND')
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to delete session')
    }
  }

  async sendMessage(sessionId: string, message: string): Promise<void> {
    const res = await authFetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, message }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to send message')
    }
  }

  async activateHandoff(sessionId: string): Promise<void> {
    const res = await authFetch(`/chats/${sessionId}/handoff`, { method: 'POST' })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to activate handoff')
    }
  }

  async deactivateHandoff(sessionId: string): Promise<void> {
    const res = await authFetch(`/chats/${sessionId}/handoff`, { method: 'DELETE' })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to deactivate handoff')
    }
  }
}
