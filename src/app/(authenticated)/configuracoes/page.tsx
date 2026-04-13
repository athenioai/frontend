import { calendarConfigService, channelAccountService, financeService, agentConfigService } from '@/lib/services'
import { SettingsHub } from './_components/settings-hub'
import type { CalendarConfig } from '@/lib/services/interfaces/calendar-config-service'
import type { ChannelAccount } from '@/lib/services/interfaces/channel-account-service'
import type { AgentConfig } from '@/lib/services/interfaces/agent-config-service'

export default async function ConfiguracoesPage() {
  let calendarConfig: CalendarConfig | null = null
  let channelAccounts: ChannelAccount[] = []
  let prepaymentEnabled = false
  let agentConfig: AgentConfig | null = null

  try {
    const [config, accounts, prepayment, agent] = await Promise.all([
      calendarConfigService.get().catch(() => null),
      channelAccountService.list().catch(() => []),
      financeService.getPrepaymentSetting().catch(() => ({ enabled: false })),
      agentConfigService.getConfig().catch(() => null),
    ])
    calendarConfig = config
    channelAccounts = accounts
    prepaymentEnabled = prepayment.enabled
    agentConfig = agent
  } catch {
    // fallback defaults
  }

  return (
    <div className="mx-auto max-w-screen-2xl px-6 py-8 lg:py-10">
      <SettingsHub
        activeTab="agenda"
        calendarConfig={calendarConfig}
        channelAccounts={channelAccounts}
        prepaymentEnabled={prepaymentEnabled}
        agentConfig={agentConfig}
      />
    </div>
  )
}
