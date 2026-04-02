import type { Company } from '@/lib/types'

export interface ICompanyService {
  getById(companyId: string): Promise<Company | null>
  updateConfig(companyId: string, data: Partial<Company>): Promise<Company>
}
