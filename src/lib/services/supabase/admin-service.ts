import type { IAdminService } from '../interfaces/admin-service'
import type { CompanySummary } from '@/lib/types'
import { createClient } from '@/lib/supabase/server'

export class SupabaseAdminService implements IAdminService {
  async getAllCompanies(): Promise<CompanySummary[]> {
    // Admin uses the regular server client. RLS policies for tenants
    // require a matching tenant_id in JWT. For admin users, the RLS
    // policy should allow access to all tenants (via role check).
    // If the admin user's JWT has an admin role, the service_role
    // bypass or an admin-specific RLS policy should handle this.
    const supabase = await createClient()

    const { data: tenants, error } = await supabase
      .from('tenants')
      .select('id, name, target_roas, created_at')
      .order('name', { ascending: true })

    if (error) throw new Error(error.message)

    const results: CompanySummary[] = []

    for (const tenant of tenants ?? []) {
      const tenantId = tenant.id as string

      // Get campaign ROAS for this tenant
      const supabaseMarketing = await createClient()
      const { data: campaigns } = await supabaseMarketing
        .schema('marketing')
        .from('campaigns')
        .select('roas_current, total_spent')
        .eq('tenant_id', tenantId)

      const roasList = (campaigns ?? []).map((c) => Number(c.roas_current ?? 0))
      const monthly_roas = roasList.length > 0
        ? roasList.reduce((a, b) => a + b, 0) / roasList.length
        : 0

      // Get latest alert event
      const { data: latestAlert } = await supabase
        .from('agent_events')
        .select('created_at')
        .eq('tenant_id', tenantId)
        .in('event_type', [
          'sale_confirmed', 'payment_confirmed', 'campaign_paused',
          'campaign_scaled', 'whale_detected', 'human_takeover',
          'anomaly', 'anomaly_detected',
        ])
        .order('created_at', { ascending: false })
        .limit(1)

      // Compute a basic health score
      const { data: leads } = await supabase
        .from('leads')
        .select('funnel_stage')
        .eq('tenant_id', tenantId)

      const totalLeads = leads?.length ?? 0
      const converted = leads?.filter((l) => l.funnel_stage === 'converted').length ?? 0
      const convRate = totalLeads > 0 ? converted / totalLeads : 0
      const healthScore = Math.round(
        Math.min(100, convRate * 500 + Math.min(monthly_roas * 15, 50))
      )

      results.push({
        id: tenantId,
        name: (tenant.name as string) ?? '',
        health_score: healthScore,
        monthly_roas: Math.round(monthly_roas * 100) / 100,
        last_alert: latestAlert?.[0]?.created_at ?? null,
        subscription_status: 'active', // Default; no subscription table yet
      })
    }

    return results
  }
}
