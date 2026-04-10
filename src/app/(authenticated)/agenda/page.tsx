import { appointmentService } from '@/lib/services'
import { getMonday, addDays, formatISODate } from '@/lib/format'
import { CalendarView } from './_components/calendar-view'
import type { Appointment } from '@/lib/services/interfaces/appointment-service'

type View = 'day' | 'week' | 'month'

function computeRange(view: View, dateParam?: string) {
  const now = new Date()

  if (view === 'day') {
    const date = dateParam ? new Date(dateParam + 'T00:00:00') : now
    const str = formatISODate(date)
    return { from: str, to: str, anchor: str }
  }

  if (view === 'month') {
    const ref = dateParam ? new Date(dateParam + 'T00:00:00') : now
    const first = new Date(ref.getFullYear(), ref.getMonth(), 1)
    // Extend to full grid (Monday before 1st → Sunday after last)
    const gridStart = getMonday(first)
    const gridEnd = addDays(gridStart, 41)
    return {
      from: formatISODate(gridStart),
      to: formatISODate(gridEnd),
      anchor: formatISODate(first),
    }
  }

  // week (default)
  const monday = dateParam
    ? new Date(dateParam + 'T00:00:00')
    : getMonday(now)
  const sunday = addDays(monday, 6)
  return {
    from: formatISODate(monday),
    to: formatISODate(sunday),
    anchor: formatISODate(monday),
  }
}

async function fetchAppointments(
  from: string,
  to: string,
  status?: 'confirmed' | 'cancelled',
) {
  let appointments: Appointment[] = []
  try {
    const result = await appointmentService.list({
      limit: 100,
      status,
      date_from: from,
      date_to: to,
    })
    appointments = result.data
  } catch {
    // empty
  }
  return appointments
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string
    date?: string
    status?: string
  }>
}) {
  const params = await searchParams

  const view: View =
    params.view === 'day' || params.view === 'month' ? params.view : 'week'

  const status =
    params.status === 'confirmed' || params.status === 'cancelled'
      ? params.status
      : undefined

  const { from, to, anchor } = computeRange(view, params.date)
  const appointments = await fetchAppointments(from, to, status)

  return (
    <div className="mx-auto flex h-full max-w-screen-2xl flex-col px-6 py-8 lg:py-10">
      <CalendarView
        appointments={appointments}
        anchorDate={anchor}
        view={view}
        currentStatus={status}
      />
    </div>
  )
}
