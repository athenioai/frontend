export interface Lead {
  id: string
  company_id: string
  name: string
  phone: string
  temperature: 'cold' | 'warm' | 'hot'
  score: number
  funnel_stage: 'captured' | 'qualified' | 'negotiation' | 'converted' | 'lost'
  assigned_agent: 'hermes' | 'ares' | null
  sentiment: 'positive' | 'neutral' | 'negative'
  product_interest: string
  objections: string[]
  utm_source: UtmParams
  created_at: string
  updated_at: string
}

export interface UtmParams {
  source: string
  medium: string
  campaign: string
  content: string
}

export interface LeadFilters {
  temperature?: Lead['temperature'][]
  funnel_stage?: Lead['funnel_stage'][]
  assigned_agent?: Lead['assigned_agent'][]
  sentiment?: Lead['sentiment'][]
  search?: string
  page?: number
  per_page?: number
  sort_by?: keyof Lead
  sort_order?: 'asc' | 'desc'
}

export interface FunnelStats {
  captured: number
  qualified: number
  negotiation: number
  converted: number
  rates: {
    captured_to_qualified: number
    qualified_to_negotiation: number
    negotiation_to_converted: number
  }
}

export interface ObjectionCount {
  objection: string
  count: number
}
