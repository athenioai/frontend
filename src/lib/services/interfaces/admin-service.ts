import type { CompanySummary } from '@/lib/types'

export interface IAdminService {
  getAllCompanies(): Promise<CompanySummary[]>
}
