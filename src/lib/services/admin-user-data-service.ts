import type {
  IAdminUserDataService,
  UserDashboardData,
  PaginatedSessions,
  PaginatedMessages,
  PaginatedAppointments,
} from './interfaces/admin-user-data-service'
import type { CalendarConfig, UpdateCalendarConfigParams } from './interfaces/calendar-config-service'
import { authFetch } from './auth-fetch'

export class AdminUserDataService implements IAdminUserDataService {
  async getDashboard(userId: string): Promise<UserDashboardData> {
    const res = await authFetch(`/admin/users/${userId}/dashboard`)
    if (!res.ok) {
      if (res.status === 404) throw new Error('NOT_FOUND')
      throw new Error('Failed to fetch user dashboard')
    }
    return res.json()
  }

  async getChats(
    userId: string,
    params?: { page?: number; limit?: number; agent?: string },
  ): Promise<PaginatedSessions> {
    const sp = new URLSearchParams()
    if (params?.page) sp.set('page', String(params.page))
    if (params?.limit) sp.set('limit', String(params.limit))
    if (params?.agent) sp.set('agent', params.agent)
    const query = sp.toString()

    const res = await authFetch(
      `/admin/users/${userId}/chats${query ? `?${query}` : ''}`,
    )
    if (!res.ok) {
      if (res.status === 404) throw new Error('NOT_FOUND')
      throw new Error('Failed to fetch user chats')
    }
    return res.json()
  }

  async getChatMessages(
    userId: string,
    sessionId: string,
    params?: { page?: number; limit?: number },
  ): Promise<PaginatedMessages> {
    const sp = new URLSearchParams()
    if (params?.page) sp.set('page', String(params.page))
    if (params?.limit) sp.set('limit', String(params.limit))
    const query = sp.toString()

    const res = await authFetch(
      `/admin/users/${userId}/chats/${sessionId}/messages${query ? `?${query}` : ''}`,
    )
    if (!res.ok) {
      if (res.status === 404) throw new Error('NOT_FOUND')
      throw new Error('Failed to fetch chat messages')
    }
    return res.json()
  }

  async getAppointments(
    userId: string,
    params?: {
      page?: number
      limit?: number
      status?: string
      date_from?: string
      date_to?: string
    },
  ): Promise<PaginatedAppointments> {
    const sp = new URLSearchParams()
    if (params?.page) sp.set('page', String(params.page))
    if (params?.limit) sp.set('limit', String(params.limit))
    if (params?.status) sp.set('status', params.status)
    if (params?.date_from) sp.set('date_from', params.date_from)
    if (params?.date_to) sp.set('date_to', params.date_to)
    const query = sp.toString()

    const res = await authFetch(
      `/admin/users/${userId}/appointments${query ? `?${query}` : ''}`,
    )
    if (!res.ok) {
      if (res.status === 404) throw new Error('NOT_FOUND')
      throw new Error('Failed to fetch user appointments')
    }
    return res.json()
  }

  async getCalendarConfig(userId: string): Promise<CalendarConfig | null> {
    const res = await authFetch(
      `/admin/users/${userId}/calendar-config`,
    )
    if (!res.ok) {
      if (res.status === 404) throw new Error('NOT_FOUND')
      throw new Error('Failed to fetch calendar config')
    }
    const data = await res.json()
    // Backend returns { message: "Calendar not configured" } when not set
    if (data.message) return null
    return data
  }

  async updateCalendarConfig(
    userId: string,
    params: UpdateCalendarConfigParams,
  ): Promise<CalendarConfig> {
    const res = await authFetch(
      `/admin/users/${userId}/calendar-config`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      },
    )

    if (!res.ok) {
      if (res.status === 404) throw new Error('NOT_FOUND')
      throw new Error('Failed to update calendar config')
    }
    return res.json()
  }
}
