import { adminUserService, chatService, appointmentService, calendarConfigService } from '@/lib/services'
import { notFound } from 'next/navigation'
import { UserContextView } from './_components/user-context-view'
import type { AdminUser } from '@/lib/services/interfaces/admin-user-service'
import type { ChatSession } from '@/lib/services/interfaces/chat-service'
import type { Appointment } from '@/lib/services/interfaces/appointment-service'
import type { CalendarConfig } from '@/lib/services/interfaces/calendar-config-service'

async function fetchUserData(userId: string) {
  let user: AdminUser | null = null
  let sessions: ChatSession[] = []
  let appointments: Appointment[] = []
  let calendarConfig: CalendarConfig | null = null
  let notFoundError = false

  try {
    user = await adminUserService.getById(userId)
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      notFoundError = true
    }
  }

  if (notFoundError || !user) return { user: null, sessions, appointments, calendarConfig, notFoundError: true }

  // Fetch user-specific data in parallel
  const [sessionsResult, appointmentsResult, configResult] = await Promise.allSettled([
    chatService.listSessions({ limit: 100 }),
    appointmentService.list({ limit: 100, user_id: userId }),
    calendarConfigService.get(),
  ])

  if (sessionsResult.status === 'fulfilled') sessions = sessionsResult.value.data
  if (appointmentsResult.status === 'fulfilled') appointments = appointmentsResult.value.data
  if (configResult.status === 'fulfilled') calendarConfig = configResult.value

  return { user, sessions, appointments, calendarConfig, notFoundError: false }
}

export default async function UserDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}) {
  const { id } = await params
  const { tab } = await searchParams
  const activeTab = tab || 'dashboard'

  const { user, sessions, appointments, calendarConfig, notFoundError } =
    await fetchUserData(id)

  if (notFoundError || !user) notFound()

  return (
    <div className="px-6 py-8 lg:py-10">
      <UserContextView
        user={user}
        sessions={sessions}
        appointments={appointments}
        calendarConfig={calendarConfig}
        activeTab={activeTab}
      />
    </div>
  )
}
