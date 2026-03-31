import { redirect } from 'next/navigation'
import { authService, leadService } from '@/lib/services'
import { LeadsTable } from './leads-table'

export default async function LeadsPage() {
  const user = await authService.getSession()
  if (!user) redirect('/login')

  const leads = await leadService.getAll(user.empresa_id)

  return (
    <div className="space-y-6">
      <h1 className="font-title text-2xl font-bold">Leads</h1>
      <LeadsTable leads={leads} />
    </div>
  )
}
