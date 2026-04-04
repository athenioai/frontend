export type ReadinessCheckName =
  | 'company_profile'
  | 'products'
  | 'knowledge_base'
  | 'whatsapp'
  | 'orchestrator_config'

export interface ReadinessCheck {
  name: ReadinessCheckName
  ready: boolean
  detail: string
}

export interface ReadinessResult {
  ready: boolean
  checks: ReadinessCheck[]
}
