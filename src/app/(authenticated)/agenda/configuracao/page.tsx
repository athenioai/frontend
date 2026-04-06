import { calendarConfigService } from '@/lib/services'
import { ConfigForm } from './_components/config-form'
import type { CalendarConfig } from '@/lib/services/interfaces/calendar-config-service'

async function fetchConfig() {
  let config: CalendarConfig | null = null

  try {
    config = await calendarConfigService.get()
  } catch {
    // Falls back to null — form shows defaults
  }

  return config
}

export default async function ConfiguracaoPage() {
  const config = await fetchConfig()

  return (
    <div className="mx-auto max-w-2xl px-6 py-8 lg:py-10">
      <ConfigForm initialConfig={config} />
    </div>
  )
}
