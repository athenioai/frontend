import type {
  IAdminUserService,
  PaginatedAdminUsers,
  AdminUser,
  ListAdminUsersParams,
} from './interfaces/admin-user-service'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export class AdminUserService implements IAdminUserService {
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

  async list(params?: ListAdminUsersParams): Promise<PaginatedAdminUsers> {
    const sp = new URLSearchParams()
    if (params?.page) sp.set('page', String(params.page))
    if (params?.limit) sp.set('limit', String(params.limit))
    if (params?.role) sp.set('role', params.role)
    if (params?.search) sp.set('search', params.search)

    const query = sp.toString()
    const res = await this.authFetch(`/admin/users${query ? `?${query}` : ''}`)

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to fetch users')
    }

    return res.json()
  }

  async getById(id: string): Promise<AdminUser> {
    const res = await this.authFetch(`/admin/users/${id}`)

    if (!res.ok) {
      if (res.status === 404) throw new Error('NOT_FOUND')
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to fetch user')
    }

    return res.json()
  }

  async create(formData: FormData): Promise<AdminUser> {
    // Don't set Content-Type — fetch adds multipart boundary automatically
    const res = await this.authFetch('/admin/users', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      if (res.status === 409) throw new Error('CONFLICT')
      if (res.status === 422) throw new Error('INVALID_PLAN')
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to create user')
    }

    return res.json()
  }
}
