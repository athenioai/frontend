import { adminService, healthService } from '@/lib/services'
import { KpiCard } from '@/components/widgets/kpi-card'
import { SystemHealthCard } from '@/components/admin/system-health-card'
import { formatDate } from '@/lib/utils/format'
import Link from 'next/link'

export default async function AdminDashboardPage() {
  const [dashboard, tenants, health] = await Promise.all([
    adminService.getDashboard(),
    adminService.getTenants(),
    healthService.check(),
  ])

  return (
    <div className="space-y-8">
      <h1 className="font-title text-[22px] font-bold text-text-primary">
        Painel Admin
      </h1>

      {/* KPIs */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-3">
        <KpiCard
          label="Total de Clientes"
          value={dashboard.total_tenants}
          icon="BarChart3"
          accentColor="#4FD1C5"
          delay={0}
        />
        <KpiCard
          label="Total de Leads"
          value={dashboard.total_leads}
          icon="TrendingUp"
          accentColor="#34D399"
          delay={0.06}
        />
        <KpiCard
          label="Total de Whales"
          value={dashboard.total_whales}
          icon="DollarSign"
          accentColor="#E8C872"
          delay={0.12}
        />
      </div>

      {/* System Health */}
      <SystemHealthCard health={health} />

      {/* Tenant list */}
      <div className="card-surface overflow-hidden">
        <div className="border-b border-border-default px-6 py-4">
          <p className="font-title text-[15px] font-bold text-text-primary">
            Clientes
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-default bg-surface-2/50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">
                  Nome
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">
                  Slug
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-text-subtle">
                  Criado em
                </th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-border-default/50 transition-colors hover:bg-accent/5"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/tenants/${t.id}`}
                      className="font-medium text-accent hover:underline"
                    >
                      {t.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px] text-text-muted">
                    {t.slug}
                  </td>
                  <td className="px-4 py-3 text-text-muted">
                    {formatDate(t.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
