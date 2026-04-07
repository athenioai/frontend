import type { ChatSession, ChatMessage } from './chat-service'
import type { Appointment } from './appointment-service'
import type { CalendarConfig } from './calendar-config-service'

export interface UserDashboardData {
  appointments: {
    total: number
    thisMonth: number
    cancelledThisMonth: number
  }
  leads: {
    total: number
    thisMonth: number
    conversionRate: number
  }
  chats: {
    totalMessages: number
    messagesThisMonth: number
    activeSessionsThisMonth: number
  }
}

export interface PaginatedSessions {
  data: ChatSession[]
  pagination: { page: number; limit: number; total: number }
}

export interface PaginatedAppointments {
  data: Appointment[]
  pagination: { page: number; limit: number; total: number }
}

export interface PaginatedMessages {
  data: ChatMessage[]
  pagination: { page: number; limit: number; total: number }
}

export interface IAdminUserDataService {
  getDashboard(userId: string): Promise<UserDashboardData>
  getChats(userId: string, params?: { page?: number; limit?: number; agent?: string }): Promise<PaginatedSessions>
  getChatMessages(userId: string, sessionId: string, params?: { page?: number; limit?: number }): Promise<PaginatedMessages>
  getAppointments(userId: string, params?: { page?: number; limit?: number; status?: string; date_from?: string; date_to?: string }): Promise<PaginatedAppointments>
  getCalendarConfig(userId: string): Promise<CalendarConfig | null>
}
