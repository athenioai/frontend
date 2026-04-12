import { financeService } from '@/lib/services'
import { InvoicesTable } from './_components/invoices-table'
import type { Invoice, Pagination } from '@/lib/services/interfaces/finance-service'

async function fetchInvoices(page: number, status?: string, type?: string) {
  let invoices: Invoice[] = []
  let pagination: Pagination = { page: 1, limit: 20, total: 0 }

  try {
    const result = await financeService.listInvoices({ page, status, type })
    invoices = result.data
    pagination = result.pagination
  } catch {
    // empty
  }

  return { invoices, pagination }
}

export default async function CobrancasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string; type?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const status = params.status || undefined
  const type = params.type || undefined

  const { invoices, pagination } = await fetchInvoices(page, status, type)

  return (
    <div className="mx-auto max-w-screen-2xl px-6 py-8 lg:py-10">
      <InvoicesTable
        invoices={invoices}
        pagination={pagination}
        currentStatus={status}
        currentType={type}
      />
    </div>
  )
}
