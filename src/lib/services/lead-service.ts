import type { ILeadService } from './interfaces/lead-service'
import type { Lead, LeadFilters, FunnelStats, ObjectionCount } from '@/lib/types'
import { apiClient } from '@/lib/api/client'

export class LeadService implements ILeadService {
  async getAll(_companyId: string, filters?: LeadFilters): Promise<Lead[]> {
    const params = new URLSearchParams()
    if (filters?.temperature) params.set('temperature', filters.temperature.join(','))
    if (filters?.funnel_stage) params.set('funnel_stage', filters.funnel_stage.join(','))
    if (filters?.sentiment) params.set('sentiment', filters.sentiment.join(','))
    if (filters?.search) params.set('search', filters.search)
    if (filters?.page) params.set('page', String(filters.page))
    if (filters?.per_page) params.set('per_page', String(filters.per_page))
    if (filters?.sort_by) params.set('sort_by', String(filters.sort_by))
    if (filters?.sort_order) params.set('sort_order', filters.sort_order)
    const qs = params.toString()
    return apiClient<Lead[]>(`/leads${qs ? `?${qs}` : ''}`)
  }

  async getById(id: string): Promise<Lead | null> {
    return apiClient<Lead | null>(`/leads/${id}`)
  }

  async getFunnelStats(_companyId: string, periodo: '1d' | '7d' | '30d'): Promise<FunnelStats> {
    return apiClient<FunnelStats>(`/leads/funnel-stats?period=${periodo}`)
  }

  async getTopObjections(_companyId: string): Promise<ObjectionCount[]> {
    return apiClient<ObjectionCount[]>('/leads/top-objections')
  }
}
