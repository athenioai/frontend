import { planService } from '@/lib/services'
import { PlansTable } from './_components/plans-table'
import type { Plan, PlanPagination } from '@/lib/services/interfaces/plan-service'

async function fetchPlans(page: number, search?: string) {
  let plans: Plan[] = []
  let pagination: PlanPagination = { page: 1, limit: 20, total: 0 }

  try {
    const result = await planService.list({ page, search })
    plans = result.data
    pagination = result.pagination
  } catch {
    // empty
  }

  return { plans, pagination }
}

export default async function PlanosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const search = params.search || undefined

  const { plans, pagination } = await fetchPlans(page, search)

  return (
    <div className="mx-auto max-w-screen-2xl px-6 py-8 lg:py-10">
      <PlansTable
        plans={plans}
        pagination={pagination}
        currentSearch={search}
      />
    </div>
  )
}
