import type { CompanyProfile, CreateCompanyProfilePayload } from '@/lib/types'

export interface ICompanyProfileService {
  get(): Promise<CompanyProfile | null>
  create(data: CreateCompanyProfilePayload): Promise<CompanyProfile>
  update(data: Partial<CreateCompanyProfilePayload>): Promise<CompanyProfile>
}
