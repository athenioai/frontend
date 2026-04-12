import { financeService, authService } from '@/lib/services'
import { CatalogHub } from './_components/catalog-hub'
import type { Service, Product, Pagination } from '@/lib/services/interfaces/finance-service'

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const search = params.search || undefined

  let workType: 'services' | 'sales' | 'hybrid' = 'hybrid'
  let services: Service[] = []
  let servicesPagination: Pagination = { page: 1, limit: 20, total: 0 }
  let products: Product[] = []
  let productsPagination: Pagination = { page: 1, limit: 20, total: 0 }

  try {
    const user = await authService.getSession()
    if (user?.workType) {
      workType = user.workType
    }

    const fetches: Promise<void>[] = []

    if (workType === 'services' || workType === 'hybrid') {
      fetches.push(
        financeService.listServices({ page, search }).then((result) => {
          services = result.data
          servicesPagination = result.pagination
        }),
      )
    }

    if (workType === 'sales' || workType === 'hybrid') {
      fetches.push(
        financeService.listProducts({ page, search }).then((result) => {
          products = result.data
          productsPagination = result.pagination
        }),
      )
    }

    await Promise.all(fetches)
  } catch {
    // fallback to defaults
  }

  return (
    <div className="mx-auto max-w-screen-2xl px-6 py-8 lg:py-10">
      <CatalogHub
        workType={workType}
        services={services}
        servicesPagination={servicesPagination}
        products={products}
        productsPagination={productsPagination}
        currentSearch={search}
      />
    </div>
  )
}
