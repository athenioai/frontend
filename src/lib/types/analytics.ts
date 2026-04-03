export interface HealthScoreData {
  score: number
  message_volume: {
    current: number
    previous: number
    change_percent: number
  }
  conversion_rate: number
  avg_latency_ms: number
  alert_reason?: string
  recommended_action?: string
}

export interface LtvCacData {
  ltv: number
  cac: number
  history: LtvEntry[]
}

export interface LtvEntry {
  lead_id: string
  name: string
  total_amount: number
  active_months: number
}

export interface AgentsActivity {
  hermes: {
    active_campaigns: number
    nurturing_leads: number
    latest_creative: string
    next_cycle: string
  }
  ares: {
    active_conversations: number
    sales_today: number
    scheduled_followups: number
    waiting_leads: number
  }
  athena: {
    last_cycle: string
    last_cycle_summary: string
    last_decision: string
    alerts_fired: number
  }
}
