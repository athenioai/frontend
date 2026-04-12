import { financeService } from '@/lib/services'
import { SubscriptionsTable } from './_components/subscriptions-table'
import type { Subscription, Pagination } from '@/lib/services/interfaces/finance-service'

async function fetchSubscriptions(page: number, status?: string) {
  let subscriptions: Subscription[] = []
  let pagination: Pagination = { page: 1, limit: 20, total: 0 }

  try {
    const result = await financeService.listSubscriptions({ page, status })
    subscriptions = result.data
    pagination = result.pagination
  } catch {
    // empty
  }

  return { subscriptions, pagination }
}

export default async function AssinaturasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const status = params.status || undefined

  const { subscriptions, pagination } = await fetchSubscriptions(page, status)

  return (
    <div className="mx-auto max-w-screen-2xl px-6 py-8 lg:py-10">
      <SubscriptionsTable
        subscriptions={subscriptions}
        pagination={pagination}
        currentStatus={status}
      />
    </div>
  )
}
