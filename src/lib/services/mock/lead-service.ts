import type { ILeadService } from '../interfaces/lead-service'
import type { Lead, LeadFilters, FunilStats, ObjecaoCount } from '@/lib/types'
import { mockLeads } from './data'

export class MockLeadService implements ILeadService {
  async getAll(empresaId: string, filters?: LeadFilters): Promise<Lead[]> {
    let leads = mockLeads.filter((l) => l.empresa_id === empresaId)

    if (filters?.busca) {
      const q = filters.busca.toLowerCase()
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

  async getFunnelStats(_empresaId: string, _periodo: '1d' | '7d' | '30d'): Promise<FunilStats> {
    return {
      captados: 330,
      qualificados: 145,
      negociacao: 58,
      convertidos: 28,
      taxas: {
        captado_qualificado: 0.439,
        qualificado_negociacao: 0.4,
        negociacao_convertido: 0.483,
      },
    }
  }

  async getTopObjections(_empresaId: string): Promise<ObjecaoCount[]> {
    return [
      { objecao: 'Preço', count: 42 },
      { objecao: 'Prazo', count: 28 },
      { objecao: 'Desconfiança', count: 19 },
      { objecao: 'Não entendeu o produto', count: 15 },
      { objecao: 'Concorrente', count: 11 },
    ]
  }
}
