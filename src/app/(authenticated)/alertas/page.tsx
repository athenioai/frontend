import { authService, alertService } from '@/lib/services'
import { redirect } from 'next/navigation'
import { AlertTimeline } from '@/components/alerts/alert-timeline'
import { Bell } from 'lucide-react'

export default async function AlertasPage() {
  const user = await authService.getSession()
  if (!user) redirect('/login')

  const alerts = await alertService.getRecent(user.company_id, 50)

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent/15 to-accent/5">
          <Bell className="h-[18px] w-[18px] text-accent" />
        </div>
        <div>
          <h1 className="font-title text-[22px] font-bold text-text-primary">Alertas</h1>
          <p className="text-[13px] text-text-muted">Acompanhe eventos importantes em tempo real</p>
        </div>
      </div>

      <AlertTimeline alerts={alerts} />
    </div>
  )
}
