import type { ILeadService } from '../interfaces/lead-service'
import type { Lead, LeadFilters, FunnelStats, ObjectionCount } from '@/lib/types'
import { createClient } from '@/lib/supabase/server'

// Map DB temperature to frontend temperature (now both English)
const tempMap: Record<string, Lead['temperature']> = {
  cold: 'cold',
  warm: 'warm',
  hot: 'hot',
}

// Map DB funnel_stage to frontend funnel_stage (now both English)
const funnelMap: Record<string, Lead['funnel_stage']> = {
  greeting: 'captured',
  qualifying: 'qualified',
  consulting: 'qualified',
  negotiating: 'negotiation',
  closing: 'negotiation',
  converted: 'converted',
  lost: 'lost',
}

// Reverse maps for filtering
const tempReverseMap: Record<string, string[]> = {
  cold: ['cold'],
  warm: ['warm'],
  hot: ['hot'],
}

const funnelReverseMap: Record<string, string[]> = {
  captured: ['greeting'],
  qualified: ['qualifying', 'consulting'],
  negotiation: ['negotiating', 'closing'],
  converted: ['converted'],
  lost: ['lost'],
}

// Map DB sentiment to frontend
const sentimentMap: Record<string, Lead['sentiment']> = {
  positive: 'positive',
  neutral: 'neutral',
  negative: 'negative',
}

const sentimentReverseMap: Record<string, string[]> = {
  positive: ['positive'],
  neutral: ['neutral'],
  negative: ['negative'],
}

function mapDbLead(row: Record<string, unknown>): Lead {
  const objections = (row.objections ?? []) as string[]
  return {
    id: row.id as string,
    company_id: row.tenant_id as string,
    name: (row.name as string) ?? '',
    phone: (row.phone as string) ?? '',
    temperature: tempMap[row.temperature as string] ?? 'cold',
    score: computeScore(row),
    funnel_stage: funnelMap[row.funnel_stage as string] ?? 'captured',
    assigned_agent: inferAgent(row.funnel_stage as string),
    sentiment: sentimentMap[row.sentiment as string] ?? 'neutral',
    product_interest: (row.product_interest as string) ?? '',
    objections: objections,
    utm_source: {
      source: (row.utm_source as string) ?? '',
      medium: (row.utm_medium as string) ?? '',
      campaign: (row.utm_campaign as string) ?? '',
      content: (row.utm_content as string) ?? '',
    },
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  }
}

function computeScore(row: Record<string, unknown>): number {
  // Simple heuristic score based on funnel stage and temperature
  const stageScores: Record<string, number> = {
    greeting: 10, qualifying: 30, consulting: 45,
    negotiating: 65, closing: 80, converted: 95, lost: 5,
  }
  const tempScores: Record<string, number> = { cold: 0, warm: 20, hot: 40 }
  const base = stageScores[row.funnel_stage as string] ?? 10
  const tempBonus = tempScores[row.temperature as string] ?? 0
  return Math.min(100, base + tempBonus * 0.5)
}

function inferAgent(funnelStage: string): 'hermes' | 'ares' | null {
  // Marketing-stage leads belong to hermes, sales-stage to ares
  if (['greeting', 'qualifying'].includes(funnelStage)) return 'hermes'
  if (['consulting', 'negotiating', 'closing', 'converted'].includes(funnelStage)) return 'ares'
  return null
}

export class SupabaseLeadService implements ILeadService {
  async getAll(companyId: string, filters?: LeadFilters): Promise<Lead[]> {
    const supabase = await createClient()

    let query = supabase
      .from('leads')
      .select('*')
      .eq('tenant_id', companyId)

    // Apply temperature filter (translate frontend -> db)
    if (filters?.temperature?.length) {
      const dbValues = filters.temperature.flatMap((t) => tempReverseMap[t] ?? [])
      if (dbValues.length) query = query.in('temperature', dbValues)
    }

    // Apply funnel stage filter
    if (filters?.funnel_stage?.length) {
      const dbValues = filters.funnel_stage.flatMap((s) => funnelReverseMap[s] ?? [])
      if (dbValues.length) query = query.in('funnel_stage', dbValues)
    }

    // Apply sentiment filter
    if (filters?.sentiment?.length) {
      const dbValues = filters.sentiment.flatMap((s) => sentimentReverseMap[s] ?? [])
      if (dbValues.length) query = query.in('sentiment', dbValues)
    }

    // Apply search
    if (filters?.search) {
      const q = filters.search
      query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%`)
    }

    // Apply sorting
    if (filters?.sort_by) {
      const columnMap: Record<string, string> = {
        name: 'name', phone: 'phone', temperature: 'temperature',
        funnel_stage: 'funnel_stage', sentiment: 'sentiment',
        created_at: 'created_at', updated_at: 'updated_at',
        score: 'temperature', // approximate sort
      }
      const col = columnMap[filters.sort_by] ?? 'created_at'
      query = query.order(col, { ascending: filters.sort_order !== 'desc' })
    } else {
      query = query.order('created_at', { ascending: false })
    }

    // Apply pagination
    if (filters?.page && filters?.per_page) {
      const start = (filters.page - 1) * filters.per_page
      const end = start + filters.per_page - 1
      query = query.range(start, end)
    }

    const { data, error } = await query

    if (error) throw new Error(error.message)

    let leads = (data ?? []).map(mapDbLead)

    // Filter by assigned_agent (computed field, filter in memory)
    if (filters?.assigned_agent?.length) {
      leads = leads.filter((l) => filters.assigned_agent!.includes(l.assigned_agent))
    }

    return leads
  }

  async getById(id: string): Promise<Lead | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null

    return mapDbLead(data)
  }

  async getFunnelStats(companyId: string, period: '1d' | '7d' | '30d'): Promise<FunnelStats> {
    const supabase = await createClient()

    const now = new Date()
    const daysBack = period === '1d' ? 1 : period === '7d' ? 7 : 30
    const since = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('leads')
      .select('funnel_stage')
      .eq('tenant_id', companyId)
      .gte('created_at', since)

    if (error) throw new Error(error.message)

    const rows = data ?? []

    // Count by mapped funnel stage
    const captured = rows.filter((r) => ['greeting'].includes(r.funnel_stage)).length
    const qualified = rows.filter((r) => ['qualifying', 'consulting'].includes(r.funnel_stage)).length
    const negotiation = rows.filter((r) => ['negotiating', 'closing'].includes(r.funnel_stage)).length
    const converted = rows.filter((r) => r.funnel_stage === 'converted').length

    const total = rows.length || 1 // avoid division by zero

    return {
      captured,
      qualified,
      negotiation,
      converted,
      rates: {
        captured_to_qualified: total > 0 ? qualified / Math.max(captured, 1) : 0,
        qualified_to_negotiation: qualified > 0 ? negotiation / qualified : 0,
        negotiation_to_converted: negotiation > 0 ? converted / negotiation : 0,
      },
    }
  }

  async getTopObjections(companyId: string): Promise<ObjectionCount[]> {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('leads')
      .select('objections')
      .eq('tenant_id', companyId)
      .not('objections', 'eq', '[]')

    if (error) throw new Error(error.message)

    // Count each objection across all leads
    const counts: Record<string, number> = {}
    for (const row of data ?? []) {
      const objs = (row.objections ?? []) as string[]
      for (const obj of objs) {
        const normalized = obj.charAt(0).toUpperCase() + obj.slice(1).toLowerCase()
        counts[normalized] = (counts[normalized] ?? 0) + 1
      }
    }

    return Object.entries(counts)
      .map(([objection, count]) => ({ objection, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
  }
}
