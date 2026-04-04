import { redirect } from 'next/navigation'
import { authService, alertService } from '@/lib/services'
import { AuthShell } from '@/components/layout/auth-shell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await authService.getSession()
  if (!user) redirect('/login')
  if (user.role !== 'admin') redirect('/dashboard')

  const alerts = await alertService.getRecent(user.company_id)

  return (
    <AuthShell
      isAdmin
      userName={user.name}
      alertCount={alerts.length}
    >
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </AuthShell>
  )
}
