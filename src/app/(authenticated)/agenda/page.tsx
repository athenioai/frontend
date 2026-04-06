import { appointmentService } from '@/lib/services'
import { getMonday, addDays, formatISODate } from '@/lib/format'
import { CalendarView } from './_components/calendar-view'
import type {
  Appointment,
} from '@/lib/services/interfaces/appointment-service'

async function fetchWeekAppointments(
  weekStartStr: string,
  weekEndStr: string,
  status?: 'confirmed' | 'cancelled',
) {
  let appointments: Appointment[] = []

  try {
    const result = await appointmentService.list({
      limit: 100,
      status,
      date_from: weekStartStr,
      date_to: weekEndStr,
    })
    appointments = result.data
  } catch {
    // Falls back to empty
  }

  return appointments
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{
    week?: string
    status?: string
  }>
}) {
  const params = await searchParams

  const weekStart = params.week
    ? new Date(params.week + 'T00:00:00')
    : getMonday(new Date())
  const weekEnd = addDays(weekStart, 6)

  const status =
    params.status === 'confirmed' || params.status === 'cancelled'
      ? params.status
      : undefined

  const appointments = await fetchWeekAppointments(
    formatISODate(weekStart),
    formatISODate(weekEnd),
    status,
  )

  return (
    <div className="flex h-full flex-col px-4 py-6 lg:px-6 lg:py-8">
      <CalendarView
        appointments={appointments}
        weekStart={formatISODate(weekStart)}
        currentStatus={status}
      />
    </div>
  )
}
