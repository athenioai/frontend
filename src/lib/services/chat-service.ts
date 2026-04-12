import type {
  IChatService,
  PaginatedResponse,
  ChatSession,
  ChatMessage,
  ListSessionsParams,
  ListMessagesParams,
} from './interfaces/chat-service'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export class ChatService implements IChatService {
  private async getToken(): Promise<string | null> {
    const cookieStore = await cookies()
    return cookieStore.get('access_token')?.value ?? null
  }

  private async authFetch(path: string, init?: RequestInit): Promise<Response> {
    const token = await this.getToken()
    if (!token) throw new Error('NOT_AUTHENTICATED')

    return fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async listSessions(params?: ListSessionsParams): Promise<PaginatedResponse<ChatSession>> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.agent) searchParams.set('agent', params.agent)

    const query = searchParams.toString()
    const res = await this.authFetch(`/chats${query ? `?${query}` : ''}`)

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
    const res = await this.authFetch(`/chats/${sessionId}/messages${query ? `?${query}` : ''}`)

    if (!res.ok) {
      if (res.status === 404) throw new Error('NOT_FOUND')
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to fetch messages')
    }

    return res.json()
  }

  async deleteSession(sessionId: string): Promise<void> {
    const res = await this.authFetch(`/chats/${sessionId}`, { method: 'DELETE' })

    if (!res.ok) {
      if (res.status === 404) throw new Error('NOT_FOUND')
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to delete session')
    }
  }

  async sendMessage(sessionId: string, message: string): Promise<void> {
    const res = await this.authFetch('/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, message }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to send message')
    }
  }
}
