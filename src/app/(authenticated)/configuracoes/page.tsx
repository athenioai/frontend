import { calendarConfigService, whatsAppService } from '@/lib/services'
import { SettingsHub } from './_components/settings-hub'
import type { CalendarConfig } from '@/lib/services/interfaces/calendar-config-service'
import type { WhatsAppInstance, WhatsAppInstanceDetail } from '@/lib/services/interfaces/whatsapp-service'

async function fetchCalendarConfig() {
  let config: CalendarConfig | null = null
  try {
    config = await calendarConfigService.get()
  } catch {
    // Falls back to null
  }
  return config
}

async function fetchWhatsApp() {
  let instance: WhatsAppInstance | null = null
  let detail: WhatsAppInstanceDetail | null = null

  try {
    const instances = await whatsAppService.listInstances()
    console.log('[WhatsApp] listInstances response:', JSON.stringify(instances))
    if (instances.length > 0) {
      instance = instances[0]
    }
  } catch (err) {
    console.error('[WhatsApp] listInstances error:', err)
  }

  if (instance) {
    try {
      detail = await whatsAppService.getStatus(instance.id)
    } catch {
      // Stats unavailable, instance still shows
    }
  }

  return { instance, detail }
}

export default async function ConfiguracoesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const params = await searchParams
  const tab = params.tab || 'agenda'

  const [calendarConfig, whatsApp] = await Promise.all([
    fetchCalendarConfig(),
    tab === 'canais' ? fetchWhatsApp() : Promise.resolve({ instance: null, detail: null }),
  ])

  return (
    <div className="mx-auto max-w-screen-2xl px-6 py-8 lg:py-10">
      <SettingsHub
        activeTab={tab}
        calendarConfig={calendarConfig}
        whatsAppInstance={whatsApp.instance}
        whatsAppDetail={whatsApp.detail}
      />
    </div>
  )
}
