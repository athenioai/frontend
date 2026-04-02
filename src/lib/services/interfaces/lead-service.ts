import type { Lead, LeadFilters, FunnelStats, ObjectionCount } from '@/lib/types'

export interface ILeadService {
  getAll(companyId: string, filters?: LeadFilters): Promise<Lead[]>
  getById(id: string): Promise<Lead | null>
  getFunnelStats(companyId: string, periodo: '1d' | '7d' | '30d'): Promise<FunnelStats>
  getTopObjections(companyId: string): Promise<ObjectionCount[]>
}
