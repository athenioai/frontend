import { redirect } from 'next/navigation'
import { authService, leadService } from '@/lib/services'
import { Users } from 'lucide-react'
import { LeadsTable } from './leads-table'

export default async function LeadsPage() {
  const user = await authService.getSession()
  if (!user) redirect('/login')

  const leads = await leadService.getAll(user.company_id)

  const kpis = {
    total: leads.length,
    hot: leads.filter((l) => l.temperature === 'hot').length,
    warm: leads.filter((l) => l.temperature === 'warm').length,
    cold: leads.filter((l) => l.temperature === 'cold').length,
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent/15 to-accent/5">
          <Users className="h-[18px] w-[18px] text-accent" />
        </div>
        <div>
          <h1 className="font-title text-[22px] font-bold text-text-primary">Leads</h1>
          <p className="text-[13px] text-text-muted">Gerencie e acompanhe todos os seus leads</p>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
        <div className="card-surface p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-subtle">Total</p>
          <p className="mt-1.5 font-title text-[24px] font-bold leading-none text-accent">{kpis.total}</p>
        </div>
        <div className="card-surface p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-subtle">Quentes</p>
          <p className="mt-1.5 font-title text-[24px] font-bold leading-none text-[#F07070]">{kpis.hot}</p>
        </div>
        <div className="card-surface p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-subtle">Mornos</p>
          <p className="mt-1.5 font-title text-[24px] font-bold leading-none text-[#E8C872]">{kpis.warm}</p>
        </div>
        <div className="card-surface p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-subtle">Frios</p>
          <p className="mt-1.5 font-title text-[24px] font-bold leading-none text-[#60A5FA]">{kpis.cold}</p>
        </div>
      </div>

      <LeadsTable leads={leads} />
    </div>
  )
}
