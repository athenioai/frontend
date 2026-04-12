import { financeService } from '@/lib/services'
import { DashboardView } from './_components/dashboard-view'
import type { FinanceDashboard } from '@/lib/services/interfaces/finance-service'

export default async function DashboardPage() {
  let data: FinanceDashboard | null = null

  try {
    data = await financeService.getFinanceDashboard()
  } catch {
    // fallback to null
  }

  return <DashboardView data={data} />
}
