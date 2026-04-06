export interface BusinessHour {
  dia: string
  horario: string
}

export interface CalendarConfig {
  id: string
  user_id: string
  business_hours: BusinessHour[]
  slot_duration_minutes: number
  min_advance_hours: number
  min_cancel_advance_hours: number
  updated_at: string
}

export interface UpdateCalendarConfigParams {
  business_hours?: BusinessHour[]
  slot_duration_minutes?: number
  min_advance_hours?: number
  min_cancel_advance_hours?: number
}

export interface ICalendarConfigService {
  get(): Promise<CalendarConfig>
  update(params: UpdateCalendarConfigParams): Promise<CalendarConfig>
}
