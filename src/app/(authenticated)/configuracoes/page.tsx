import { calendarConfigService, channelAccountService } from '@/lib/services'
import { SettingsHub } from './_components/settings-hub'
import type { CalendarConfig } from '@/lib/services/interfaces/calendar-config-service'
import type { ChannelAccount } from '@/lib/services/interfaces/channel-account-service'

async function fetchCalendarConfig() {
  let config: CalendarConfig | null = null
  try {
    config = await calendarConfigService.get()
  } catch {
    // Falls back to null
  }
  return config
}

async function fetchChannelAccounts(): Promise<ChannelAccount[]> {
  try {
    return await channelAccountService.list()
  } catch {
    return []
  }
}

export default async function ConfiguracoesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const params = await searchParams
  const tab = params.tab || 'agenda'

  const [calendarConfig, channelAccounts] = await Promise.all([
    fetchCalendarConfig(),
    tab === 'canais' ? fetchChannelAccounts() : Promise.resolve([]),
  ])

  return (
    <div className="mx-auto max-w-screen-2xl px-6 py-8 lg:py-10">
      <SettingsHub
        activeTab={tab}
        calendarConfig={calendarConfig}
        channelAccounts={channelAccounts}
      />
    </div>
  )
}
