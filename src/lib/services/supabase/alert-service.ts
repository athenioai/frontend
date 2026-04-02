import type { IAlertService } from '../interfaces/alert-service'
import type { Alert, AlertType } from '@/lib/types'
import { createClient } from '@/lib/supabase/server'

// Map agent_event event_type to AlertType
const eventTypeToAlertType: Record<string, AlertType> = {
  sale_confirmed: 'sale',
  payment_confirmed: 'sale',
  campaign_paused: 'campaign_paused',
  campaign_scaled: 'campaign_scaled',
  whale_detected: 'whale',
  human_takeover: 'human_requested',
  anomaly: 'anomaly',
  anomaly_detected: 'anomaly',
}

const alertEventTypes = Object.keys(eventTypeToAlertType)

function mapEventToAlert(row: Record<string, unknown>): Alert {
  const eventType = row.event_type as string
  const payload = (row.payload ?? {}) as Record<string, unknown>

  return {
    id: row.id as string,
    company_id: row.tenant_id as string,
    type: eventTypeToAlertType[eventType] ?? 'anomaly',
    description: (payload.description as string)
      ?? (payload.message as string)
      ?? (payload.summary as string)
      ?? `Event: ${eventType}`,
    created_at: row.created_at as string,
  }
}

export class SupabaseAlertService implements IAlertService {
  async getRecent(companyId: string, limit = 20): Promise<Alert[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('agent_events')
      .select('*')
      .eq('tenant_id', companyId)
      .in('event_type', alertEventTypes)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw new Error(error.message)

    return (data ?? []).map(mapEventToAlert)
  }
}
