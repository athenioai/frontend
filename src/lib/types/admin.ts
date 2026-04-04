export type ToneOfVoice = 'formal' | 'informal' | 'neutro' | 'ousado'

export interface HandoffConfig {
  max_negative_turns: number
  max_llm_failures: number
  whale_auto_takeover: boolean
  escalation_phone?: string
}

export interface OrchestratorConfig {
  budget_near_limit_threshold: number
  bottleneck_threshold: number
  whale_score_threshold: number
  budget_scale_factor: number
  roas_target_modifier: number
}

export interface TenantQuotas {
  rate_limit_per_hour: number
  max_whatsapp_instances: number
  monthly_message_quota: number
}

export interface Tenant {
  id: string
  name: string
  slug: string
  tone_of_voice?: ToneOfVoice
  approach_script?: string
  asaas_key?: string
  stripe_key?: string
  meta_account_id?: string
  meta_access_token?: string
  pixel_id?: string
  whatsapp_phone_id?: string
  whatsapp_token?: string
  daily_budget?: number
  card_limit?: number
  target_roas?: number
  max_cpa?: number
  alert_phone?: string
  competitors?: string[]
  handoff_config?: HandoffConfig
  orchestrator_config?: OrchestratorConfig
  quotas?: TenantQuotas
  created_at: string
  updated_at: string
}

export type CreateTenantPayload = Omit<Tenant, 'id' | 'created_at' | 'updated_at'>

export interface OrchestratorDecision {
  id: string
  tenant_id: string
  type: 'scale_budget' | 'pause_campaigns' | 'reduce_bids' | 'whale_detected' | 'handoff' | 'cycle_summary' | 'tenant_config_invalid' | 'reflection_failed'
  input_summary: string
  result: string
  created_at: string
}

export type DecisionType = OrchestratorDecision['type']

export interface DLQEntry {
  id: string
  job_type: string
  data: Record<string, unknown>
  error: string
  created_at: string
}

export interface AdminDashboard {
  total_tenants: number
  total_leads: number
  total_whales: number
}

export interface SystemHealth {
  supabase: boolean
  redis: boolean
  kairos: boolean
  ares: boolean
  whatsapp: boolean
}
