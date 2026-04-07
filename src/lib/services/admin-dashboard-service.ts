import type {
  IAdminDashboardService,
  AdminDashboardData,
} from './interfaces/admin-dashboard-service'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export class AdminDashboardService implements IAdminDashboardService {
  private async getToken(): Promise<string | null> {
    const cookieStore = await cookies()
    return cookieStore.get('access_token')?.value ?? null
  }

  async get(): Promise<AdminDashboardData> {
    const token = await this.getToken()
    if (!token) throw new Error('NOT_AUTHENTICATED')

    const res = await fetch(`${API_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to fetch dashboard')
    }

    return res.json()
  }
}
