import type { CompanySummary, Lead, Tenant, CreateTenantPayload, AdminDashboard, OrchestratorDecision, DLQEntry } from '@/lib/types'

export interface IAdminService {
  getAllCompanies(): Promise<CompanySummary[]>
  getDashboard(): Promise<AdminDashboard>
  getTenants(): Promise<Tenant[]>
  getTenant(id: string): Promise<Tenant>
  createTenant(payload: CreateTenantPayload): Promise<Tenant>
  updateTenant(id: string, payload: Partial<CreateTenantPayload>): Promise<Tenant>
  deleteTenant(id: string): Promise<void>
  getTenantLeads(id: string, params?: { limit?: number; offset?: number }): Promise<Lead[]>
  getTenantDecisions(id: string): Promise<OrchestratorDecision[]>
  getDLQ(): Promise<DLQEntry[]>
  replayDLQ(id: string): Promise<void>
}
