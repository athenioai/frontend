import type { IAdminService } from './interfaces/admin-service'
import type { CompanySummary, Lead, Tenant, CreateTenantPayload, AdminDashboard, OrchestratorDecision, DLQEntry } from '@/lib/types'
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
    await apiClient<void>(`/admin/tenants/${id}`, {
      method: 'DELETE',
    })
  }

  async getTenantLeads(id: string, params?: { limit?: number; offset?: number }): Promise<Lead[]> {
    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.offset) searchParams.set('offset', String(params.offset))
    const qs = searchParams.toString()
    return apiClient<Lead[]>(`/admin/tenants/${id}/leads${qs ? `?${qs}` : ''}`)
  }

  async getTenantDecisions(id: string): Promise<OrchestratorDecision[]> {
    return apiClient<OrchestratorDecision[]>(`/admin/tenants/${id}/decisions`)
  }

  async getDLQ(): Promise<DLQEntry[]> {
    return apiClient<DLQEntry[]>('/admin/dlq')
  }

  async replayDLQ(id: string): Promise<void> {
    await apiClient<void>(`/admin/dlq/${id}/replay`, {
      method: 'POST',
    })
  }
}
