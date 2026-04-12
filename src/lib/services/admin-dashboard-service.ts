import type {
  IAdminDashboardService,
  AdminDashboardData,
} from './interfaces/admin-dashboard-service'
import { authFetch } from './auth-fetch'

export class AdminDashboardService implements IAdminDashboardService {
  async get(): Promise<AdminDashboardData> {
    const res = await authFetch('/admin/dashboard')

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to fetch dashboard')
    }

    return res.json()
  }
}
