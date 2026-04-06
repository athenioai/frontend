import { appointmentService } from '@/lib/services'
import { AppointmentList } from './_components/appointment-list'
import type {
  Appointment,
  AppointmentPagination,
} from '@/lib/services/interfaces/appointment-service'

async function fetchAppointments(
  page: number,
  status?: 'confirmed' | 'cancelled',
  dateFrom?: string,
  dateTo?: string,
) {
  let appointments: Appointment[] = []
  let pagination: AppointmentPagination = { page: 1, limit: 20, total: 0 }

  try {
    const result = await appointmentService.list({
      page,
      status,
      date_from: dateFrom,
      date_to: dateTo,
    })
    appointments = result.data
    pagination = result.pagination
  } catch {
    // Falls back to empty state
  }

  return { appointments, pagination }
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string
    status?: string
    date_from?: string
    date_to?: string
  }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const status =
    params.status === 'confirmed' || params.status === 'cancelled'
      ? params.status
      : undefined
  const dateFrom = params.date_from || undefined
  const dateTo = params.date_to || undefined

  const { appointments, pagination } = await fetchAppointments(
    page,
    status,
    dateFrom,
    dateTo,
  )

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 lg:py-10">
      <AppointmentList
        appointments={appointments}
        pagination={pagination}
        currentStatus={status}
        currentDateFrom={dateFrom}
        currentDateTo={dateTo}
      />
    </div>
  )
}
