import { adminUserService, adminUserDataService } from '@/lib/services'
import { notFound } from 'next/navigation'
import { UserContextView } from './_components/user-context-view'
import type { AdminUser } from '@/lib/services/interfaces/admin-user-service'
import type { UserDashboardData } from '@/lib/services/interfaces/admin-user-data-service'
import type { ChatSession } from '@/lib/services/interfaces/chat-service'
import type { Appointment } from '@/lib/services/interfaces/appointment-service'
import type { CalendarConfig } from '@/lib/services/interfaces/calendar-config-service'

async function fetchUserData(userId: string) {
  let user: AdminUser | null = null
  let dashboard: UserDashboardData | null = null
  let sessions: ChatSession[] = []
  let appointments: Appointment[] = []
  let calendarConfig: CalendarConfig | null = null

  try {
    user = await adminUserService.getById(userId)
  } catch {
    return { user: null, dashboard, sessions, appointments, calendarConfig }
  }

  if (!user) return { user: null, dashboard, sessions, appointments, calendarConfig }

  // Fetch user-specific data via admin endpoints in parallel
  const [dashResult, chatsResult, aptsResult, configResult] =
    await Promise.allSettled([
      adminUserDataService.getDashboard(userId),
      adminUserDataService.getChats(userId, { limit: 100 }),
      adminUserDataService.getAppointments(userId, { limit: 100 }),
      adminUserDataService.getCalendarConfig(userId),
    ])

  if (dashResult.status === 'fulfilled') dashboard = dashResult.value
  if (chatsResult.status === 'fulfilled') sessions = chatsResult.value.data
  if (aptsResult.status === 'fulfilled') appointments = aptsResult.value.data
  if (configResult.status === 'fulfilled') calendarConfig = configResult.value

  return { user, dashboard, sessions, appointments, calendarConfig }
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

  const { user, dashboard, sessions, appointments, calendarConfig } =
    await fetchUserData(id)

  if (!user) notFound()

  return (
    <div className="px-6 py-8 lg:py-10">
      <UserContextView
        user={user}
        dashboard={dashboard}
        sessions={sessions}
        appointments={appointments}
        calendarConfig={calendarConfig}
        activeTab={activeTab}
      />
    </div>
  )
}
