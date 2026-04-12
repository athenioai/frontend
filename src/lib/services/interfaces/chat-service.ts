export interface ChatSession {
  sessionId: string
  agent: string
  channel: string | null
  leadName: string | null
  handoff: boolean
  lastMessage: string
  lastRole: 'lead' | 'assistant'
  messageCount: number
  startedAt: string
  lastMessageAt: string
}

export interface ChatMessage {
  id: string
  sessionId: string
  agent: string
  role: 'lead' | 'assistant'
  content: string
  appointmentId: string | null
  createdAt: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: Pagination
}

export interface ListSessionsParams {
  page?: number
  limit?: number
  agent?: string
}

export interface ListMessagesParams {
  page?: number
  limit?: number
}

export interface IChatService {
  listSessions(params?: ListSessionsParams): Promise<PaginatedResponse<ChatSession>>
  getMessages(sessionId: string, params?: ListMessagesParams): Promise<PaginatedResponse<ChatMessage>>
  deleteSession(sessionId: string): Promise<void>
  sendMessage(sessionId: string, message: string): Promise<void>
}
