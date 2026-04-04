import type { IAdminService } from './interfaces/admin-service'
import type { CompanySummary } from '@/lib/types'
import { apiClient } from '@/lib/api/client'

export class AdminService implements IAdminService {
  async getAllCompanies(): Promise<CompanySummary[]> {
    return apiClient<CompanySummary[]>('/admin/companies')
  }
}
