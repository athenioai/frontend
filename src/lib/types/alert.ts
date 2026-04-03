export type AlertType =
  | 'sale'
  | 'campaign_paused'
  | 'campaign_scaled'
  | 'whale'
  | 'human_requested'
  | 'anomaly'

export interface Alert {
  id: string
  company_id: string
  type: AlertType
  description: string
  created_at: string
}
