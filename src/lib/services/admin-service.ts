import type { IAdminService } from './interfaces/admin-service'
import type { CompanySummary, Tenant, CreateTenantPayload, Lead, OrchestratorDecision, DLQEntry, AdminDashboard } from '@/lib/types'
import { apiClient } from '@/lib/api/client'

export class AdminService implements IAdminService {
  async getAllCompanies(): Promise<CompanySummary[]> {
    return apiClient<CompanySummary[]>('/admin/companies')
  }

  async getDashboard(): Promise<AdminDashboard> {
    return apiClient<AdminDashboard>('/admin/dashboard')
  }

  async getTenants(): Promise<Tenant[]> {
    return apiClient<Tenant[]>('/admin/tenants')
  }

  async getTenant(id: string): Promise<Tenant> {
    return apiClient<Tenant>(`/admin/tenants/${id}`)
  }

  async createTenant(payload: CreateTenantPayload): Promise<Tenant> {
    return apiClient<Tenant>('/admin/tenants', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  }

  async updateTenant(id: string, payload: Partial<CreateTenantPayload>): Promise<Tenant> {
    return apiClient<Tenant>(`/admin/tenants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  }

  async deleteTenant(id: string): Promise<void> {
    await apiClient<void>(`/admin/tenants/${id}`, { method: 'DELETE' })
  }

  async getTenantLeads(id: string, params?: { limit?: number; offset?: number }): Promise<Lead[]> {
    const qs = new URLSearchParams()
    if (params?.limit) qs.set('limit', String(params.limit))
    if (params?.offset) qs.set('offset', String(params.offset))
    const query = qs.toString()
    return apiClient<Lead[]>(`/admin/tenants/${id}/leads${query ? `?${query}` : ''}`)
  }

  async getTenantDecisions(id: string): Promise<OrchestratorDecision[]> {
    return apiClient<OrchestratorDecision[]>(`/admin/tenants/${id}/decisions`)
  }

  async getDLQ(): Promise<DLQEntry[]> {
    return apiClient<DLQEntry[]>('/admin/dlq')
  }

  async replayDLQ(id: string): Promise<void> {
    await apiClient<void>(`/admin/dlq/${id}/replay`, { method: 'POST' })
  }
}
