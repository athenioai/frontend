import type { ICompanyService } from '../interfaces/empresa-service'
import type { Company } from '@/lib/types'
import { mockCompanies } from './data'

export class MockCompanyService implements ICompanyService {
  async getById(empresaId: string): Promise<Company | null> {
    return mockCompanies.find((e) => e.id === empresaId) ?? null
  }

  async updateConfig(empresaId: string, data: Partial<Company>): Promise<Company> {
    const company = mockCompanies.find((e) => e.id === empresaId)
    if (!company) throw new Error('Company not found')
    return { ...company, ...data }
  }
}
