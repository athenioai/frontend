import { financeService, authService } from '@/lib/services'
import { DashboardView } from './_components/dashboard-view'
import type { FinanceDashboard } from '@/lib/services/interfaces/finance-service'

export default async function DashboardPage() {
  let data: FinanceDashboard | null = null
  let userName: string | null = null

  try {
    const [dashboard, user] = await Promise.all([
      financeService.getFinanceDashboard(),
      authService.getSession(),
    ])
    data = dashboard
    userName = user?.name ?? null
  } catch {
    // fallback to null
  }

  return <DashboardView data={data} userName={userName} />
}
