export interface Campaign {
  id: string
  company_id: string
  name: string
  status: 'active' | 'paused'
  total_spent: number
  cpl: number
  roas: number
  leads_generated: number
  confirmed_sales: number
  created_at: string
}

export interface CampaignPerformance {
  date: string
  spent: number
  leads: number
  sales: number
  roas: number
}

export interface RoiTotal {
  invested: number
  revenue: number
  roas: number
  history_7d: number[]
}
