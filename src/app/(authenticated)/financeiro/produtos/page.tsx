import { financeService } from '@/lib/services'
import { ProductsTable } from './_components/products-table'
import type { Product, Pagination } from '@/lib/services/interfaces/finance-service'

async function fetchProducts(page: number, search?: string) {
  let products: Product[] = []
  let pagination: Pagination = { page: 1, limit: 20, total: 0 }

  try {
    const result = await financeService.listProducts({ page, search })
    products = result.data
    pagination = result.pagination
  } catch {
    // empty
  }

  return { products, pagination }
}

export default async function ProdutosPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; search?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const search = params.search || undefined

  const { products, pagination } = await fetchProducts(page, search)

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
