import type { Lead, LeadFilters, FunilStats, ObjecaoCount } from '@/lib/types'

export interface ILeadService {
  getAll(empresaId: string, filters?: LeadFilters): Promise<Lead[]>
  getById(id: string): Promise<Lead | null>
  getFunilStats(empresaId: string, periodo: '1d' | '7d' | '30d'): Promise<FunilStats>
  getTopObjecoes(empresaId: string): Promise<ObjecaoCount[]>
}
