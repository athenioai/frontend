export interface Company {
  id: string
  name: string
  target_roas: number
  target_cpl: number
  daily_budget: number
  card_limit: number
  tone_of_voice: string
  whatsapp_alerts: string
  health_score: number
  subscription_status: 'active' | 'cancelled' | 'delinquent'
}

export interface CompanySummary {
  id: string
  name: string
  health_score: number
  monthly_roas: number
  last_alert: string | null
  subscription_status: Company['subscription_status']
}
