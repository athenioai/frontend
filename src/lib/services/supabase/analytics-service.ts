import type { IAnalyticsService } from '../interfaces/analytics-service'
import type { HealthScoreData, LtvCacData, AgentsActivity } from '@/lib/types'
import { createClient } from '@/lib/supabase/server'

export class SupabaseAnalyticsService implements IAnalyticsService {
  async getHealthScore(companyId: string): Promise<HealthScoreData> {
    const supabase = await createClient()

    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString()

    // Get current week messages count
    const supabaseCommercial = await createClient()
    const { count: currentMessages } = await supabaseCommercial
      .schema('commercial')
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', weekAgo)

    // Get previous week messages count
    const supabaseCommercial2 = await createClient()
    const { count: previousMessages } = await supabaseCommercial2
      .schema('commercial')
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', twoWeeksAgo)
      .lt('created_at', weekAgo)

    const current = currentMessages ?? 0
    const previous = previousMessages ?? 0
    const variation = previous > 0 ? ((current - previous) / previous) * 100 : 0

    // Get conversion rate: converted leads / total leads
    const { data: leads } = await supabase
      .from('leads')
      .select('funnel_stage')
      .eq('tenant_id', companyId)

    const totalLeads = leads?.length ?? 0
    const convertedLeads = leads?.filter((l) => l.funnel_stage === 'converted').length ?? 0
    const conversionRate = totalLeads > 0 ? convertedLeads / totalLeads : 0

    // Get average campaign ROAS
    const supabaseMarketing = await createClient()
    const { data: campaigns } = await supabaseMarketing
      .schema('marketing')
      .from('campaigns')
      .select('roas_current')
      .eq('tenant_id', companyId)
      .eq('status', 'active')

    const avgRoas =
      campaigns && campaigns.length > 0
        ? campaigns.reduce((sum, c) => sum + Number(c.roas_current ?? 0), 0) / campaigns.length
        : 0

    // Compute health score (0-100)
    // Weighted: conversion rate (40%), ROAS vs typical target (30%), message volume trend (30%)
    const conversionScore = Math.min(100, conversionRate * 1000) // 10% conversion = 100
    const roasScore = Math.min(100, avgRoas * 25) // ROAS 4 = 100
    const volumeScore = variation >= 0 ? Math.min(100, 50 + variation) : Math.max(0, 50 + variation)

    const score = Math.round(conversionScore * 0.4 + roasScore * 0.3 + volumeScore * 0.3)

    // Estimate latency from recent agent events
    const supabaseEvents = await createClient()
    const { data: events } = await supabaseEvents
      .from('agent_events')
      .select('created_at, processed_at')
      .eq('tenant_id', companyId)
      .not('processed_at', 'is', null)
      .order('created_at', { ascending: false })
      .limit(50)

    let avgLatencyMs = 1200 // default
    if (events && events.length > 0) {
      const latencies = events
        .filter((e) => e.processed_at)
        .map((e) => new Date(e.processed_at).getTime() - new Date(e.created_at).getTime())
        .filter((l) => l > 0)
      if (latencies.length > 0) {
        avgLatencyMs = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
      }
    }

    const result: HealthScoreData = {
      score,
      message_volume: {
        current,
        previous,
        change_percent: Math.round(variation * 10) / 10,
      },
      conversion_rate: Math.round(conversionRate * 1000) / 1000,
      avg_latency_ms: avgLatencyMs,
    }

    // Add alert info if score is low
    if (score < 50) {
      result.alert_reason = avgRoas < 1.5
        ? 'ROAS below expected'
        : conversionRate < 0.03
          ? 'Conversion rate too low'
          : 'Message volume declining'
      result.recommended_action = 'Review active campaigns and sales funnel'
    }

    return result
  }

  async getLtvCac(companyId: string): Promise<LtvCacData> {
    const supabase = await createClient()

    // Get confirmed payments with lead info
    const supabaseCommercial = await createClient()
    const { data: payments, error: payError } = await supabaseCommercial
      .schema('commercial')
      .from('payments')
      .select('lead_id, amount_cents, paid_at')
      .eq('tenant_id', companyId)
      .eq('status', 'confirmed')
      .order('paid_at', { ascending: false })

    if (payError) throw new Error(payError.message)

    // Get total campaign spend (CAC denominator)
    const supabaseMarketing = await createClient()
    const { data: campaigns } = await supabaseMarketing
      .schema('marketing')
      .from('campaigns')
      .select('total_spent')
      .eq('tenant_id', companyId)

    const totalSpent = (campaigns ?? []).reduce(
      (sum, c) => sum + Number(c.total_spent ?? 0),
      0
    )

    // Get converted lead count for CAC
    const { data: convertedLeads } = await supabase
      .from('leads')
      .select('id')
      .eq('tenant_id', companyId)
      .eq('funnel_stage', 'converted')

    const numConverted = convertedLeads?.length ?? 1
    const cac = numConverted > 0 ? totalSpent / numConverted : 0

    // Calculate LTV per lead and overall
    const paymentsByLead: Record<string, { total: number; earliest: string; latest: string }> = {}
    for (const p of payments ?? []) {
      const lid = p.lead_id as string
      if (!paymentsByLead[lid]) {
        paymentsByLead[lid] = { total: 0, earliest: p.paid_at ?? '', latest: p.paid_at ?? '' }
      }
      paymentsByLead[lid].total += Number(p.amount_cents ?? 0) / 100
      if (p.paid_at && p.paid_at < paymentsByLead[lid].earliest) {
        paymentsByLead[lid].earliest = p.paid_at
      }
      if (p.paid_at && p.paid_at > paymentsByLead[lid].latest) {
        paymentsByLead[lid].latest = p.paid_at
      }
    }

    const leadIds = Object.keys(paymentsByLead)
    const totalRevenue = Object.values(paymentsByLead).reduce((s, v) => s + v.total, 0)
    const ltv = leadIds.length > 0 ? totalRevenue / leadIds.length : 0

    // Build history with lead names
    const { data: leadNames } = await supabase
      .from('leads')
      .select('id, name')
      .in('id', leadIds.length > 0 ? leadIds : ['__none__'])

    const nameMap: Record<string, string> = {}
    for (const l of leadNames ?? []) {
      nameMap[l.id] = l.name ?? 'Unknown'
    }

    const history = leadIds
      .map((lid) => {
        const info = paymentsByLead[lid]
        const months = info.earliest && info.latest
          ? Math.max(1, Math.ceil(
              (new Date(info.latest).getTime() - new Date(info.earliest).getTime()) /
                (30 * 24 * 60 * 60 * 1000)
            ))
          : 1
        return {
          lead_id: lid,
          name: nameMap[lid] ?? 'Unknown',
          total_amount: info.total,
          active_months: months,
        }
      })
      .sort((a, b) => b.total_amount - a.total_amount)
      .slice(0, 10)

    return {
      ltv: Math.round(ltv * 100) / 100,
      cac: Math.round(cac * 100) / 100,
      history,
    }
  }

  async getHoursSaved(companyId: string): Promise<{ hours: number }> {
    const supabase = await createClient()

    // Count automated messages (outbound) as proxy for hours saved
    // Assume each automated message saves ~3 minutes of human time
    const supabaseCommercial = await createClient()
    const { count } = await supabaseCommercial
      .schema('commercial')
      .from('messages')
      .select('id', { count: 'exact', head: true })

    // Also count automated agent events (outbound processed)
    const { count: eventCount } = await supabase
      .from('agent_events')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', companyId)
      .eq('status', 'processed')

    const totalInteractions = (count ?? 0) + (eventCount ?? 0)
    // 3 minutes per interaction, converted to hours
    const hours = Math.round((totalInteractions * 3) / 60)

    return { hours }
  }

  async getAgentsActivity(companyId: string): Promise<AgentsActivity> {
    const supabase = await createClient()
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

    // Hermes (marketing) data: active campaigns, leads in nurturing
    const supabaseMarketing = await createClient()
    const { data: activeCampaigns } = await supabaseMarketing
      .schema('marketing')
      .from('campaigns')
      .select('id')
      .eq('tenant_id', companyId)
      .eq('status', 'active')

    const supabaseNurturing = await createClient()
    const { count: nurturingCount } = await supabaseNurturing
      .schema('marketing')
      .from('nurturing_flows')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', companyId)
      .eq('status', 'active')

    // Get last creative ad copy
    const supabaseAds = await createClient()
    const { data: latestAd } = await supabaseAds
      .schema('marketing')
      .from('ads')
      .select('copy_text, created_at')
      .order('created_at', { ascending: false })
      .limit(1)

    // Ares (sales) data: active conversations today, sales today
    const { data: salesLeads } = await supabase
      .from('leads')
      .select('id, funnel_stage, updated_at')
      .eq('tenant_id', companyId)
      .in('funnel_stage', ['consulting', 'negotiating', 'closing'])

    const { data: salesToday } = await supabase
      .from('leads')
      .select('id')
      .eq('tenant_id', companyId)
      .eq('funnel_stage', 'converted')
      .gte('updated_at', todayStart)

    // Count leads waiting (greeting stage today)
    const { data: waitingLeads } = await supabase
      .from('leads')
      .select('id')
      .eq('tenant_id', companyId)
      .in('funnel_stage', ['greeting', 'qualifying'])
      .gte('created_at', todayStart)

    // Athena data: latest orchestrator cycle
    const { data: latestEvents } = await supabase
      .from('agent_events')
      .select('event_type, payload, created_at')
      .eq('tenant_id', companyId)
      .order('created_at', { ascending: false })
      .limit(20)

    const athenaEvents = (latestEvents ?? []).filter(
      (e) => (e.event_type as string).startsWith('athena_') || (e.event_type as string).startsWith('orchestrator_')
    )
    const latestAthena = athenaEvents[0]

    const alertEvents = (latestEvents ?? []).filter(
      (e) => ['alert', 'campaign_paused', 'campaign_scaled', 'whale_detected', 'human_takeover', 'anomaly'].includes(e.event_type)
    )

    return {
      hermes: {
        active_campaigns: activeCampaigns?.length ?? 0,
        nurturing_leads: nurturingCount ?? 0,
        latest_creative: latestAd?.[0]?.copy_text
          ? (latestAd[0].copy_text as string).slice(0, 60)
          : 'No recent creative',
        next_cycle: '15min',
      },
      ares: {
        active_conversations: salesLeads?.length ?? 0,
        sales_today: salesToday?.length ?? 0,
        scheduled_followups: salesLeads?.filter(
          (l) => ['negotiating', 'closing'].includes(l.funnel_stage)
        ).length ?? 0,
        waiting_leads: waitingLeads?.length ?? 0,
      },
      athena: {
        last_cycle: latestAthena?.created_at ?? new Date().toISOString(),
        last_cycle_summary: latestAthena?.payload
          ? ((latestAthena.payload as Record<string, unknown>).summary as string) ?? 'Cycle completed without anomalies.'
          : 'No recent cycle data.',
        last_decision: latestAthena?.payload
          ? ((latestAthena.payload as Record<string, unknown>).decision as string) ?? 'No recent decision'
          : 'No recent decision',
        alerts_fired: alertEvents.length,
      },
    }
  }
}
