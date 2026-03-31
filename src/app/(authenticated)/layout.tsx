import { redirect } from 'next/navigation'
import { authService, analyticsService } from '@/lib/services'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
import { HealthBanner } from '@/components/layout/health-banner'

export default async function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await authService.getSession()
  if (!user) redirect('/login')

  const health = await analyticsService.getHealthScore(user.empresa_id)

  return (
    <div className="min-h-screen">
      <Sidebar isAdmin={user.role === 'admin'} />
      <div className="lg:pl-60">
        <Topbar userName={user.nome} isAdmin={user.role === 'admin'} />
        <HealthBanner
          score={health.score}
          motivo={health.motivo_alerta}
          acao={health.acao_recomendada}
        />
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  )
}
