import { financeService } from '@/lib/services'
import { ServicesTable } from './_components/services-table'
import type { Service, Pagination } from '@/lib/services/interfaces/finance-service'

async function fetchServices(page: number, search?: string) {
  let services: Service[] = []
  let pagination: Pagination = { page: 1, limit: 20, total: 0 }

  try {
    const result = await financeService.listServices({ page, search })
    services = result.data
    pagination = result.pagination
  } catch {
    // empty
  }

  return { services, pagination }
}

export default async function ServicosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const search = params.search || undefined

  const { services, pagination } = await fetchServices(page, search)

  return (
    <div className="mx-auto max-w-screen-2xl px-6 py-8 lg:py-10">
      <ServicesTable
        services={services}
        pagination={pagination}
        currentSearch={search}
      />
    </div>
  )
}
