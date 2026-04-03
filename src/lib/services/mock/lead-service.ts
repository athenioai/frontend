import type { ILeadService } from '../interfaces/lead-service'
import type { Lead, LeadFilters, FunnelStats, ObjectionCount } from '@/lib/types'
import { mockLeads } from './data'

export class MockLeadService implements ILeadService {
  async getAll(companyId: string, filters?: LeadFilters): Promise<Lead[]> {
    let leads = mockLeads.filter((l) => l.company_id === companyId)

    if (filters?.search) {
      const q = filters.search.toLowerCase()
      leads = leads.filter(
        (l) => l.name.toLowerCase().includes(q) || l.phone.includes(q)
      )
    }
    if (filters?.temperature?.length) {
      leads = leads.filter((l) => filters.temperature!.includes(l.temperature))
    }
    if (filters?.funnel_stage?.length) {
      leads = leads.filter((l) => filters.funnel_stage!.includes(l.funnel_stage))
    }
    if (filters?.assigned_agent?.length) {
      leads = leads.filter((l) => filters.assigned_agent!.includes(l.assigned_agent))
    }
    if (filters?.sentiment?.length) {
      leads = leads.filter((l) => filters.sentiment!.includes(l.sentiment))
    }
    if (filters?.sort_by) {
      const key = filters.sort_by
      const dir = filters.sort_order === 'desc' ? -1 : 1
      leads.sort((a, b) => {
        const av = a[key], bv = b[key]
        if (av == null) return 1
        if (bv == null) return -1
        return av < bv ? -dir : av > bv ? dir : 0
      })
    }
    if (filters?.page && filters?.per_page) {
      const start = (filters.page - 1) * filters.per_page
      leads = leads.slice(start, start + filters.per_page)
    }

    return leads
  }

  async getById(id: string): Promise<Lead | null> {
    return mockLeads.find((l) => l.id === id) ?? null
  }

  async getFunnelStats(_companyId: string, _period: '1d' | '7d' | '30d'): Promise<FunnelStats> {
    return {
      captured: 330,
      qualified: 145,
      negotiation: 58,
      converted: 28,
      rates: {
        captured_to_qualified: 0.439,
        qualified_to_negotiation: 0.4,
        negotiation_to_converted: 0.483,
      },
    }
  }

  async getTopObjections(_companyId: string): Promise<ObjectionCount[]> {
    return [
      { objection: 'Preço', count: 42 },
      { objection: 'Prazo', count: 28 },
      { objection: 'Desconfiança', count: 19 },
      { objection: 'Não entendeu o produto', count: 15 },
      { objection: 'Concorrente', count: 11 },
    ]
  }
}
