import { authService } from '@/lib/services'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const user = await authService.getSession()
  if (!user) redirect('/login')

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="font-title text-2xl font-bold text-text-primary">
          Dashboard
        </h1>
        <p className="mt-2 text-text-muted">
          Bem-vindo, {user.name}
        </p>
      </div>
    </div>
  )
}
