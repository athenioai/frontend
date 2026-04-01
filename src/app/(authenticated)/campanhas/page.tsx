import { redirect } from 'next/navigation'
import { authService, campaignService } from '@/lib/services'
import { Megaphone } from 'lucide-react'
import { formatCurrency } from '@/lib/utils/format'
import { CampaignGrid } from './campaign-grid'

export default async function CampanhasPage() {
  const user = await authService.getSession()
  if (!user) redirect('/login')

  const campaigns = await campaignService.getAll(user.empresa_id)

  const ativas = campaigns.filter((c) => c.status === 'ativa').length
  const totalGasto = campaigns.reduce((sum, c) => sum + c.gasto_total, 0)
  const avgRoas = campaigns.length > 0 ? campaigns.reduce((sum, c) => sum + c.roas, 0) / campaigns.length : 0
  const totalLeads = campaigns.reduce((sum, c) => sum + c.leads_gerados, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-gold/15 to-gold/5">
          <Megaphone className="h-[18px] w-[18px] text-gold" />
        </div>
        <div>
          <h1 className="font-title text-[22px] font-bold text-text-primary">Campanhas</h1>
          <p className="text-[13px] text-text-muted">Gerencie suas campanhas de marketing</p>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
        <div className="card-surface p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-subtle">Ativas</p>
          <p className="mt-1.5 font-title text-[24px] font-bold leading-none text-emerald">{ativas}</p>
        </div>
        <div className="card-surface p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-subtle">Gasto Total</p>
          <p className="mt-1.5 font-title text-[24px] font-bold leading-none text-gold">
            {formatCurrency(totalGasto)}
          </p>
        </div>
        <div className="card-surface p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-subtle">ROAS Médio</p>
          <p className="mt-1.5 font-title text-[24px] font-bold leading-none text-accent">{avgRoas.toFixed(1)}×</p>
        </div>
        <div className="card-surface p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-text-subtle">Leads Gerados</p>
          <p className="mt-1.5 font-title text-[24px] font-bold leading-none text-violet">{totalLeads}</p>
        </div>
      </div>

      <CampaignGrid campaigns={campaigns} />
    </div>
  )
}
