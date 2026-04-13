import { financeService } from '@/lib/services'
import { ServicesTable } from '../catalogo/_components/services-table'
import type { Service, Pagination } from '@/lib/services/interfaces/finance-service'

export default async function ServicosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const search = params.search || undefined

  let services: Service[] = []
  let pagination: Pagination = { page: 1, limit: 20, total: 0 }

  try {
    const result = await financeService.listServices({ page, search })
    services = result.data
    pagination = result.pagination
  } catch (error) {
    console.error('[servicos] Failed to fetch services', error)
  }

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
