import { financeService, leadService } from '@/lib/services'
import { CreateInvoiceForm } from './_components/create-invoice-form'
import type { LeadPublic } from '@/lib/services/interfaces/lead-service'
import type { Service, Product } from '@/lib/services/interfaces/finance-service'

async function fetchFormData() {
  let leads: LeadPublic[] = []
  let services: Service[] = []
  let products: Product[] = []

  try {
    const [leadsResult, servicesResult, productsResult] = await Promise.all([
      leadService.listLeads({ limit: 200 }),
      financeService.listServices({ limit: 200 }),
      financeService.listProducts({ limit: 200 }),
    ])
    leads = leadsResult.data
    services = servicesResult.data
    products = productsResult.data
  } catch {
    // empty
  }

  return { leads, services, products }
}

export default async function NovaCobrancaPage() {
  const { leads, services, products } = await fetchFormData()

  return (
    <div className="mx-auto max-w-2xl px-6 py-8 lg:py-10">
      <div className="mb-8">
        <h1 className="font-title text-2xl font-bold text-text-primary">
          Nova Cobrança
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Crie uma nova cobrança para um cliente
        </p>
      </div>
      <CreateInvoiceForm leads={leads} services={services} products={products} />
    </div>
  )
}
