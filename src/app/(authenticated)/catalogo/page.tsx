import { financeService } from '@/lib/services'
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

  let services: Service[] = []
  let servicesPagination: Pagination = { page: 1, limit: 20, total: 0 }
  let products: Product[] = []
  let productsPagination: Pagination = { page: 1, limit: 20, total: 0 }

  try {
    const [servicesResult, productsResult] = await Promise.all([
      financeService.listServices({ page, search }),
      financeService.listProducts({ page, search }),
    ])
    services = servicesResult.data
    servicesPagination = servicesResult.pagination
    products = productsResult.data
    productsPagination = productsResult.pagination
  } catch (error) {
    console.error('[catalogo] Failed to fetch catalog data', error) // TODO: replace with project logger
  }

  return (
    <div className="mx-auto max-w-screen-2xl px-6 py-8 lg:py-10">
      <CatalogHub
        services={services}
        servicesPagination={servicesPagination}
        products={products}
        productsPagination={productsPagination}
        currentSearch={search}
      />
    </div>
  )
}
