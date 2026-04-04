import type { ICompanyProfileService } from './interfaces/company-profile-service'
import type { CompanyProfile, CreateCompanyProfilePayload } from '@/lib/types'
import { apiClient } from '@/lib/api/client'

export class CompanyProfileService implements ICompanyProfileService {
  async get(): Promise<CompanyProfile | null> {
    try {
      return await apiClient<CompanyProfile>('/api/company/profile')
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) return null
      throw error
    }
  }

  async create(data: CreateCompanyProfilePayload): Promise<CompanyProfile> {
    return apiClient<CompanyProfile>('/api/company/profile', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async update(data: Partial<CreateCompanyProfilePayload>): Promise<CompanyProfile> {
    return apiClient<CompanyProfile>('/api/company/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }
}
