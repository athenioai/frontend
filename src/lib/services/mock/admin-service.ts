import type { IAdminService } from '../interfaces/admin-service'
import type { CompanySummary } from '@/lib/types'
import { mockCompanies, mockAlerts } from './data'

export class MockAdminService implements IAdminService {
  async getAllCompanies(): Promise<CompanySummary[]> {
    return mockCompanies.map((e) => {
      const lastAlert = mockAlerts
        .filter((a) => a.empresa_id === e.id)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0]

      return {
        id: e.id,
        name: e.name,
        health_score: e.health_score,
        roas_mes: e.id === 'emp-001' ? 3.55 : e.id === 'emp-002' ? 1.8 : 6.2,
        ultimo_alerta: lastAlert?.created_at ?? null,
        assinatura_status: e.assinatura_status,
      }
    })
  }
}
