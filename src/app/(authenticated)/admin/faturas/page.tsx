import { financeService } from '@/lib/services'
import { AdminInvoicesTable } from './_components/admin-invoices-table'
import type { AdminInvoice, Pagination } from '@/lib/services/interfaces/finance-service'

async function fetchAdminInvoices(page: number, status?: string) {
  let invoices: AdminInvoice[] = []
  let pagination: Pagination = { page: 1, limit: 20, total: 0 }

  try {
    const result = await financeService.listAdminInvoices({ page, status })
    invoices = result.data
    pagination = result.pagination
  } catch {
    // empty
  }

  return { invoices, pagination }
}

export default async function FaturasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; status?: string }>
}) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const status = params.status || undefined

  const { invoices, pagination } = await fetchAdminInvoices(page, status)

  return (
    <div className="mx-auto max-w-screen-2xl px-6 py-8 lg:py-10">
      <AdminInvoicesTable
        invoices={invoices}
        pagination={pagination}
        currentStatus={status}
      />
    </div>
  )
}
