import { financeService } from '@/lib/services'
import { BillingDashboard } from './_components/billing-dashboard'
import type { AdminBillingDashboard } from '@/lib/services/interfaces/finance-service'

async function fetchBillingDashboard(): Promise<AdminBillingDashboard | null> {
  try {
    return await financeService.getAdminBillingDashboard()
  } catch {
    return null
  }
}

export default async function BillingPage() {
  const data = await fetchBillingDashboard()

  return (
    <div className="mx-auto max-w-screen-2xl px-6 py-8 lg:py-10">
      <BillingDashboard data={data} />
    </div>
  )
}
