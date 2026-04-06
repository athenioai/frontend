export interface Appointment {
  id: string
  sessionId: string
  leadName: string
  serviceType: string
  date: string
  startTime: string
  endTime: string
  status: 'confirmed' | 'cancelled'
  createdAt: string
}

export interface AppointmentPagination {
  page: number
  limit: number
  total: number
}

export interface PaginatedAppointments {
  data: Appointment[]
  pagination: AppointmentPagination
}

export interface ListAppointmentsParams {
  page?: number
  limit?: number
  status?: 'confirmed' | 'cancelled'
  date_from?: string
  date_to?: string
  user_id?: string
}

export interface IAppointmentService {
  list(params?: ListAppointmentsParams): Promise<PaginatedAppointments>
  getById(id: string): Promise<Appointment>
}
