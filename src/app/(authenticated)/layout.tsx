import { redirect } from 'next/navigation'
import { authService, analyticsService, alertService } from '@/lib/services'
import type { HealthScoreData } from '@/lib/types'
import { AuthShell } from '@/components/layout/auth-shell'
import { HealthBanner } from '@/components/layout/health-banner'

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await authService.getSession()
  if (!user) redirect('/login')

  const [health, alerts] = await Promise.all([
    analyticsService.getHealthScore(user.company_id).catch((): HealthScoreData => ({ score: 0, message_volume: { current: 0, previous: 0, change_percent: 0 }, conversion_rate: 0, avg_latency_ms: 0 })),
    alertService.getRecent(user.company_id).catch(() => []),
  ])

  return (
    <AuthShell
      isAdmin={user.role === 'admin'}
      userName={user.name}
      alertCount={alerts.length}
    >
      <HealthBanner
        score={health.score}
        alertReason={health.alert_reason}
        recommendedAction={health.recommended_action}
      />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </AuthShell>
  )
}
