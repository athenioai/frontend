import { financeService } from '@/lib/services'
import { FinanceDashboard } from './_components/finance-dashboard'
import type { FinanceDashboard as FinanceDashboardData } from '@/lib/services/interfaces/finance-service'

async function fetchDashboard(): Promise<FinanceDashboardData | null> {
  try {
    return await financeService.getFinanceDashboard()
  } catch {
    return null
  }
}

export default async function FinanceiroPage() {
  const data = await fetchDashboard()

  return (
    <div className="mx-auto max-w-screen-2xl px-6 py-8 lg:py-10">
      <FinanceDashboard data={data} />
    </div>
  )
}
