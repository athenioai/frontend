import type { ICompanyService } from '../interfaces/company-service'
import type { Company } from '@/lib/types'
import { createClient } from '@/lib/supabase/server'

function mapDbTenantToCompany(row: Record<string, unknown>): Company {
  return {
    id: row.id as string,
    name: (row.name as string) ?? '',
    target_roas: Number(row.target_roas ?? 0),
    target_cpl: Number(row.max_cpa ?? 0),
    daily_budget: 0, // Not directly stored on tenant; derived from campaigns
    card_limit: 0, // Not directly stored on tenant
    tone_of_voice: (row.tone_of_voice as string) ?? '',
    whatsapp_alerts: (row.whatsapp_config as Record<string, unknown>)?.phone as string ?? '',
    health_score: 0, // Will be computed separately if needed
    subscription_status: 'active', // Default; no subscription table yet
  }
}

export class SupabaseCompanyService implements ICompanyService {
  async getById(companyId: string): Promise<Company | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', companyId)
      .single()

    if (error || !data) return null

    const company = mapDbTenantToCompany(data)

    // Compute daily_budget from active campaigns
    const supabaseMarketing = await createClient()
    const { data: campaigns } = await supabaseMarketing
      .schema('marketing')
      .from('campaigns')
      .select('daily_budget')
      .eq('tenant_id', companyId)
      .eq('status', 'active')

    if (campaigns) {
      company.daily_budget = campaigns.reduce(
        (sum, c) => sum + Number(c.daily_budget ?? 0),
        0
      )
    }

    return company
  }

  async updateConfig(companyId: string, data: Partial<Company>): Promise<Company> {
    const supabase = await createClient()

    // Map frontend fields back to DB columns
    const updatePayload: Record<string, unknown> = {}
    if (data.name !== undefined) updatePayload.name = data.name
    if (data.tone_of_voice !== undefined) updatePayload.tone_of_voice = data.tone_of_voice
    if (data.target_roas !== undefined) updatePayload.target_roas = data.target_roas
    if (data.target_cpl !== undefined) updatePayload.max_cpa = data.target_cpl
    if (data.whatsapp_alerts !== undefined) {
      updatePayload.whatsapp_config = { phone: data.whatsapp_alerts }
    }

    const { data: updated, error } = await supabase
      .from('tenants')
      .update(updatePayload)
      .eq('id', companyId)
      .select('*')
      .single()

    if (error || !updated) {
      throw new Error(error?.message ?? 'Company not found')
    }

    const company = mapDbTenantToCompany(updated)

    // Re-apply the fields from the input that don't map to DB columns
    if (data.daily_budget !== undefined) company.daily_budget = data.daily_budget
    if (data.card_limit !== undefined) company.card_limit = data.card_limit
    if (data.health_score !== undefined) company.health_score = data.health_score
    if (data.subscription_status !== undefined) company.subscription_status = data.subscription_status

    return company
  }
}
