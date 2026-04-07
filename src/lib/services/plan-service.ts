import type {
  IPlanService,
  PaginatedPlans,
  Plan,
  ListPlansParams,
  CreatePlanParams,
  UpdatePlanParams,
} from './interfaces/plan-service'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export class PlanService implements IPlanService {
  private async getToken(): Promise<string | null> {
    const cookieStore = await cookies()
    return cookieStore.get('access_token')?.value ?? null
  }

  private async authFetch(path: string, init?: RequestInit): Promise<Response> {
    const token = await this.getToken()
    if (!token) throw new Error('NOT_AUTHENTICATED')

    return fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        ...init?.headers,
        Authorization: `Bearer ${token}`,
      },
    })
  }

  async list(params?: ListPlansParams): Promise<PaginatedPlans> {
    const sp = new URLSearchParams()
    if (params?.page) sp.set('page', String(params.page))
    if (params?.limit) sp.set('limit', String(params.limit))
    if (params?.search) sp.set('search', params.search)

    const query = sp.toString()
    const res = await this.authFetch(`/admin/plans${query ? `?${query}` : ''}`)

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to fetch plans')
    }

    return res.json()
  }

  async getById(id: string): Promise<Plan> {
    const res = await this.authFetch(`/admin/plans/${id}`)

    if (!res.ok) {
      if (res.status === 404) throw new Error('NOT_FOUND')
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to fetch plan')
    }

    return res.json()
  }

  async create(data: CreatePlanParams): Promise<Plan> {
    const res = await this.authFetch('/admin/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      if (res.status === 409) throw new Error('CONFLICT')
      throw new Error(body.message ?? 'Failed to create plan')
    }

    return res.json()
  }

  async update(id: string, data: UpdatePlanParams): Promise<Plan> {
    const res = await this.authFetch(`/admin/plans/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      if (res.status === 409) throw new Error('CONFLICT')
      if (res.status === 404) throw new Error('NOT_FOUND')
      throw new Error(body.message ?? 'Failed to update plan')
    }

    return res.json()
  }

  async delete(id: string): Promise<void> {
    const res = await this.authFetch(`/admin/plans/${id}`, { method: 'DELETE' })

    if (!res.ok) {
      if (res.status === 404) throw new Error('NOT_FOUND')
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to delete plan')
    }
  }
}
