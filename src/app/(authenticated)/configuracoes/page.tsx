import { calendarConfigService } from '@/lib/services'
import { SettingsHub } from './_components/settings-hub'
import type { CalendarConfig } from '@/lib/services/interfaces/calendar-config-service'

async function fetchCalendarConfig() {
  let config: CalendarConfig | null = null
  try {
    config = await calendarConfigService.get()
  } catch {
    // Falls back to null
  }
  return config
}

export default async function ConfiguracoesPage() {
  const calendarConfig = await fetchCalendarConfig()

  return (
    <div className="mx-auto max-w-3xl px-6 py-8 lg:py-10">
      <SettingsHub calendarConfig={calendarConfig} />
    </div>
  )
}
