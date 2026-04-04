export type AlertType =
  | 'sale'
  | 'sale_confirmed'
  | 'campaign_paused'
  | 'campaign_scaled'
  | 'whale'
  | 'whale_detected'
  | 'human_requested'
  | 'anomaly'
  | 'sensor_failure'

export interface Alert {
  id: string
  company_id: string
  type: AlertType
  description: string
  created_at: string
}
