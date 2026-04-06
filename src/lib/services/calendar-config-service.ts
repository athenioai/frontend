import type {
  ICalendarConfigService,
  CalendarConfig,
  UpdateCalendarConfigParams,
} from './interfaces/calendar-config-service'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export class CalendarConfigService implements ICalendarConfigService {
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

  async get(): Promise<CalendarConfig> {
    const res = await this.authFetch('/calendar-config')

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to fetch calendar config')
    }

    return res.json()
  }

  async update(params: UpdateCalendarConfigParams): Promise<CalendarConfig> {
    const res = await this.authFetch('/calendar-config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to update calendar config')
    }

    return res.json()
  }
}
