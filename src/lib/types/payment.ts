export interface PaymentLog {
  id: string
  company_id: string
  lead_id: string
  amount: number
  status: 'confirmed' | 'pending' | 'failed'
  campaign_id: string
  created_at: string
}
