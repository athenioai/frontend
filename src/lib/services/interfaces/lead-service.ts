export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'lost'

export interface LeadPublic {
  id: string
  owner_id: string
  name: string
  email: string
  phone: string | null
  status: LeadStatus
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface LeadBoard {
  new: LeadPublic[]
  contacted: LeadPublic[]
  qualified: LeadPublic[]
  converted: LeadPublic[]
  lost: LeadPublic[]
}

export interface CreateLeadPayload {
  name: string
  email: string
  phone?: string
  status?: LeadStatus
  metadata?: Record<string, unknown>
}

export interface UpdateLeadPayload {
  name?: string
  email?: string
  phone?: string | null
  status?: LeadStatus
  metadata?: Record<string, unknown> | null
}

export interface ListLeadsParams {
  page?: number
  limit?: number
  status?: LeadStatus
  search?: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
}

export interface PaginatedLeadResponse {
  data: LeadPublic[]
  pagination: Pagination
}

export type TimelineEntryType = 'message' | 'appointment' | 'status_change'

export interface TimelineMessage {
  id: string
  session_id: string
  agent: 'horos' | 'kairos' | 'human'
  role: 'lead' | 'assistant'
  content: string
  appointment_id: string | null
  created_at: string
}

export interface TimelineAppointment {
  id: string
  session_id: string
  lead_name: string
  service_type: string
  date: string
  start_time: string
  end_time: string
  status: 'confirmed' | 'cancelled'
  created_at: string
}

export interface TimelineStatusChange {
  id: string
  old_status: string
  new_status: string
  changed_at: string
}

export interface TimelineEntry {
  type: TimelineEntryType
  timestamp: string
  data: TimelineMessage | TimelineAppointment | TimelineStatusChange
}

export interface TimelineParams {
  limit?: number
  type?: TimelineEntryType
}

export interface ILeadService {
  getBoard(): Promise<LeadBoard>
  listLeads(params?: ListLeadsParams): Promise<PaginatedLeadResponse>
  getLead(id: string): Promise<LeadPublic>
  createLead(payload: CreateLeadPayload): Promise<LeadPublic>
  updateLead(id: string, payload: UpdateLeadPayload): Promise<LeadPublic>
  deleteLead(id: string): Promise<void>
  getTimeline(id: string, params?: TimelineParams): Promise<{ data: TimelineEntry[] }>
}
