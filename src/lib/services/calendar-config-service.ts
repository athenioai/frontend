import type {
  ICalendarConfigService,
  CalendarConfig,
  UpdateCalendarConfigParams,
} from './interfaces/calendar-config-service'
import { authFetch } from './auth-fetch'

export class CalendarConfigService implements ICalendarConfigService {
  async get(): Promise<CalendarConfig> {
    const res = await authFetch('/calendar-config')

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to fetch calendar config')
    }

    return res.json()
  }

  async update(params: UpdateCalendarConfigParams): Promise<CalendarConfig> {
    const res = await authFetch('/calendar-config', {
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
