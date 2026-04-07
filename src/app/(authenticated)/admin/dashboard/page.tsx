import { adminDashboardService } from '@/lib/services'
import { DashboardView } from './_components/dashboard-view'
import type { AdminDashboardData } from '@/lib/services/interfaces/admin-dashboard-service'

async function fetchDashboard() {
  let data: AdminDashboardData | null = null
  try {
    data = await adminDashboardService.get()
  } catch {
    // empty
  }
  return data
}

export default async function AdminDashboardPage() {
  const data = await fetchDashboard()

  return (
    <div className="px-6 py-8 lg:py-10">
      <DashboardView data={data} />
    </div>
  )
}
