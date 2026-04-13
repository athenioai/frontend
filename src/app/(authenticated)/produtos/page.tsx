import { financeService } from '@/lib/services'
import { ProductsTable } from '../catalogo/_components/products-table'
import type { Product, Pagination } from '@/lib/services/interfaces/finance-service'

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const search = params.search || undefined

  let products: Product[] = []
  let pagination: Pagination = { page: 1, limit: 20, total: 0 }

  try {
    const result = await financeService.listProducts({ page, search })
    products = result.data
    pagination = result.pagination
  } catch (error) {
    console.error('[produtos] Failed to fetch products', error)
  }

  return (
    <div className="mx-auto max-w-screen-2xl px-6 py-8 lg:py-10">
      <ProductsTable
        products={products}
        pagination={pagination}
        currentSearch={search}
      />
    </div>
  )
}
