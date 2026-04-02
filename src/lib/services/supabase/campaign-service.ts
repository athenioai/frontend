import type { ICampaignService } from '../interfaces/campaign-service'
import type { Campaign, CampaignPerformance, RoiTotal } from '@/lib/types'
import { createClient } from '@/lib/supabase/server'

// Map DB status to frontend status
const statusMap: Record<string, Campaign['status']> = {
  active: 'active',
  scaling: 'active',
  paused: 'paused',
  killed: 'paused',
}

function mapDbCampaign(row: Record<string, unknown>): Campaign {
  return {
    id: row.id as string,
    company_id: row.tenant_id as string,
    name: (row.meta_campaign_id as string) ?? `Campaign ${(row.id as string).slice(0, 8)}`,
    status: statusMap[row.status as string] ?? 'paused',
    total_spent: Number(row.total_spent ?? 0),
    cpl: Number(row.cpa_current ?? 0),
    roas: Number(row.roas_current ?? 0),
    leads_generated: 0, // will be enriched below
    confirmed_sales: 0, // will be enriched below
    created_at: row.created_at as string,
  }
}

export class SupabaseCampaignService implements ICampaignService {
  async getAll(companyId: string): Promise<Campaign[]> {
    const supabase = await createClient()

    const { data: campaigns, error } = await supabase
      .schema('marketing')
      .from('campaigns')
      .select('*')
      .eq('tenant_id', companyId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    // Enrich with lead counts from public.leads using campaign_id FK
    const mapped = (campaigns ?? []).map(mapDbCampaign)

    // Get lead counts per campaign (leads have campaign_id field)
    const campaignIds = mapped.map((c) => c.id)
    if (campaignIds.length > 0) {
      const supabasePublic = await createClient()
      const { data: leads } = await supabasePublic
        .from('leads')
        .select('campaign_id, funnel_stage')
        .eq('tenant_id', companyId)
        .in('campaign_id', campaignIds)

      if (leads) {
        for (const campaign of mapped) {
          const campaignLeads = leads.filter((l) => l.campaign_id === campaign.id)
          campaign.leads_generated = campaignLeads.length
          campaign.confirmed_sales = campaignLeads.filter(
            (l) => l.funnel_stage === 'converted'
          ).length
        }
      }
    }

    return mapped
  }

  async getTotalRoi(companyId: string): Promise<RoiTotal> {
    const supabase = await createClient()

    // Get total spent from campaigns
    const { data: campaigns, error: campError } = await supabase
      .schema('marketing')
      .from('campaigns')
      .select('total_spent, roas_current')
      .eq('tenant_id', companyId)

    if (campError) throw new Error(campError.message)

    const invested = (campaigns ?? []).reduce((sum, c) => sum + Number(c.total_spent ?? 0), 0)

    // Get total revenue from payments
    const supabaseCommercial = await createClient()
    const { data: payments, error: payError } = await supabaseCommercial
      .schema('commercial')
      .from('payments')
      .select('amount_cents, status, created_at')
      .eq('tenant_id', companyId)
      .eq('status', 'confirmed')

    if (payError) throw new Error(payError.message)

    const revenue = (payments ?? []).reduce(
      (sum, p) => sum + Number(p.amount_cents ?? 0) / 100,
      0
    )

    const roas = invested > 0 ? revenue / invested : 0

    // Build 7-day ROAS history from system_metrics
    const supabaseMetrics = await createClient()
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const { data: metrics } = await supabaseMetrics
      .schema('marketing')
      .from('system_metrics')
      .select('metric_value, recorded_at')
      .eq('tenant_id', companyId)
      .eq('metric_name', 'daily_roas')
      .gte('recorded_at', sevenDaysAgo)
      .order('recorded_at', { ascending: true })
      .limit(7)

    const history_7d = (metrics ?? []).map((m) => Number(m.metric_value))

    // If not enough metrics, pad with calculated roas
    while (history_7d.length < 7) {
      history_7d.unshift(roas)
    }

    return { invested, revenue, roas, history_7d: history_7d.slice(-7) }
  }

  async getPerformance(campaignId: string): Promise<CampaignPerformance[]> {
    const supabase = await createClient()

    // Query system_metrics for this campaign's daily performance
    const { data: metrics, error } = await supabase
      .schema('marketing')
      .from('system_metrics')
      .select('metric_name, metric_value, metadata, recorded_at')
      .eq('metadata->>campaign_id', campaignId)
      .order('recorded_at', { ascending: true })

    if (error) throw new Error(error.message)

    // Group metrics by date
    const byDate: Record<string, CampaignPerformance> = {}

    for (const m of metrics ?? []) {
      const date = new Date(m.recorded_at).toISOString().split('T')[0]
      if (!byDate[date]) {
        byDate[date] = { date, spent: 0, leads: 0, sales: 0, roas: 0 }
      }
      const entry = byDate[date]
      const val = Number(m.metric_value)

      switch (m.metric_name) {
        case 'daily_spend':
          entry.spent = val
          break
        case 'daily_leads':
          entry.leads = val
          break
        case 'daily_sales':
          entry.sales = val
          break
        case 'daily_roas':
          entry.roas = val
          break
      }
    }

    const result = Object.values(byDate).sort(
      (a, b) => a.date.localeCompare(b.date)
    )

    // If no metrics found, return last 14 days with campaign-level averages
    if (result.length === 0) {
      const { data: campaign } = await supabase
        .schema('marketing')
        .from('campaigns')
        .select('total_spent, roas_current, created_at')
        .eq('id', campaignId)
        .single()

      if (campaign) {
        const days: CampaignPerformance[] = []
        for (let i = 13; i >= 0; i--) {
          const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
          days.push({
            date: d.toISOString().split('T')[0],
            spent: Number(campaign.total_spent ?? 0) / 14,
            leads: 0,
            sales: 0,
            roas: Number(campaign.roas_current ?? 0),
          })
        }
        return days
      }
    }

    return result
  }
}
