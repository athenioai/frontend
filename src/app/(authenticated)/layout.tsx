import { redirect } from 'next/navigation'
import { authService, analyticsService, alertService } from '@/lib/services'
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
    analyticsService.getHealthScore(user.company_id),
    alertService.getRecent(user.company_id),
  ])

  return (
    <AuthShell
      isAdmin={user.role === 'admin'}
      userName={user.name}
      alertCount={alerts.length}
    >
      <HealthBanner
        score={health.score}
        motivo={health.motivo_alerta}
        acao={health.acao_recomendada}
      />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </AuthShell>
  )
}
