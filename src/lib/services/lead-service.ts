import type {
  ILeadService,
  LeadBoard,
  LeadPublic,
  CreateLeadPayload,
  UpdateLeadPayload,
  ListLeadsParams,
  PaginatedLeadResponse,
  TimelineEntry,
  TimelineParams,
} from './interfaces/lead-service'
import { cookies } from 'next/headers'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

/** CRM lead management service. Proxies requests to backend /leads/* endpoints. */
export class LeadService implements ILeadService {
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
        'Content-Type': 'application/json',
      },
    })
  }

  /** Fetches the Kanban board — all leads grouped by status. Rate limit: 20/min. */
  async getBoard(): Promise<LeadBoard> {
    const res = await this.authFetch('/leads/board')

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to fetch board')
    }

    return res.json()
  }

  /** Lists leads with optional pagination, status filter, and search. */
  async listLeads(params?: ListLeadsParams): Promise<PaginatedLeadResponse> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.status) searchParams.set('status', params.status)
    if (params?.search) searchParams.set('search', params.search)

    const query = searchParams.toString()
    const res = await this.authFetch(`/leads${query ? `?${query}` : ''}`)

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to fetch leads')
    }

    return res.json()
  }

  /** Fetches a single lead by UUID. Throws NOT_FOUND (404) or FORBIDDEN (403). */
  async getLead(id: string): Promise<LeadPublic> {
    const res = await this.authFetch(`/leads/${id}`)

    if (!res.ok) {
      if (res.status === 404) throw new Error('NOT_FOUND')
      if (res.status === 403) throw new Error('FORBIDDEN')
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to fetch lead')
    }

    return res.json()
  }

  /** Creates a new lead. Throws CONFLICT (409) if email already exists. */
  async createLead(payload: CreateLeadPayload): Promise<LeadPublic> {
    const res = await this.authFetch('/leads', {
      method: 'POST',
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      if (res.status === 400) throw new Error('VALIDATION_ERROR')
      if (res.status === 409) throw new Error('CONFLICT')
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to create lead')
    }

    return res.json()
  }

  /** Updates lead fields. Used by both inline editing and drag-and-drop status changes. */
  async updateLead(id: string, payload: UpdateLeadPayload): Promise<LeadPublic> {
    const res = await this.authFetch(`/leads/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    })

    if (!res.ok) {
      if (res.status === 400) throw new Error('VALIDATION_ERROR')
      if (res.status === 404) throw new Error('NOT_FOUND')
      if (res.status === 403) throw new Error('FORBIDDEN')
      if (res.status === 409) throw new Error('CONFLICT')
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to update lead')
    }

    return res.json()
  }

  /** Soft-deletes a lead by UUID. Authorization enforced by backend. */
  async deleteLead(id: string): Promise<void> {
    const res = await this.authFetch(`/leads/${id}`, { method: 'DELETE' })

    if (!res.ok) {
      if (res.status === 404) throw new Error('NOT_FOUND')
      if (res.status === 403) throw new Error('FORBIDDEN')
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to delete lead')
    }
  }

  /** Fetches unified timeline (messages, appointments, status changes). Rate limit: 30/min. */
  async getTimeline(
    id: string,
    params?: TimelineParams,
  ): Promise<{ data: TimelineEntry[] }> {
    const searchParams = new URLSearchParams()
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.type) searchParams.set('type', params.type)

    const query = searchParams.toString()
    const res = await this.authFetch(`/leads/${id}/timeline${query ? `?${query}` : ''}`)

    if (!res.ok) {
      if (res.status === 404) throw new Error('NOT_FOUND')
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to fetch timeline')
    }

    return res.json()
  }
}
