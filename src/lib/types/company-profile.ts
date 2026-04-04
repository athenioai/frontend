export type ToneOfVoice = 'formal' | 'informal' | 'neutro' | 'ousado'

export interface CompanyProfile {
  id: string
  tenant_id: string
  company_name: string
  description?: string
  segment?: string
  target_audience?: string
  tone?: ToneOfVoice
  differentials?: string[]
  created_at: string
  updated_at: string
}

export interface CreateCompanyProfilePayload {
  company_name: string
  description?: string
  segment?: string
  target_audience?: string
  tone?: ToneOfVoice
  differentials?: string[]
}
