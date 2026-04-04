import type { ICompanyService } from './interfaces/empresa-service'
import type { Company } from '@/lib/types'
import { apiClient } from '@/lib/api/client'

export class CompanyService implements ICompanyService {
  async getById(_companyId: string): Promise<Company | null> {
    return apiClient<Company | null>('/company')
  }

  async updateConfig(_companyId: string, data: Partial<Company>): Promise<Company> {
    return apiClient<Company>('/company', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }
}
