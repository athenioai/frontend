import type {
  IFinanceService,
  PaginatedResponse,
  Service,
  Product,
  Invoice,
  Subscription,
  AdminInvoice,
  FinanceDashboard,
  AdminBillingDashboard,
  PrepaymentSetting,
  ListServicesParams,
  ListProductsParams,
  ListInvoicesParams,
  ListSubscriptionsParams,
  ListAdminInvoicesParams,
  CreateServiceParams,
  UpdateServiceParams,
  CreateProductParams,
  UpdateProductParams,
  CreateInvoiceParams,
  CreateSubscriptionParams,
  UpdateSubscriptionParams,
  CreateAdminInvoiceParams,
} from './interfaces/finance-service'
import { authFetch } from './auth-fetch'

function buildCatalogFormData(
  params: CreateServiceParams | UpdateServiceParams | CreateProductParams | UpdateProductParams,
): FormData {
  const formData = new FormData()
  const entries = Object.entries(params) as [string, unknown][]

  for (const [key, value] of entries) {
    if (key === 'image') {
      if (value instanceof File) {
        formData.append('image', value)
      }
      continue
    }

    if (value === undefined) continue

    if (value === null) {
      formData.append(key, '')
      continue
    }

    formData.append(key, String(value))
  }

  return formData
}

export class FinanceService implements IFinanceService {
  // ── Services ──

  async listServices(params?: ListServicesParams): Promise<PaginatedResponse<Service>> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.search) searchParams.set('search', params.search)

    const query = searchParams.toString()
    const res = await authFetch(`/services${query ? `?${query}` : ''}`)

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to fetch services')
    }

    return res.json()
  }

  async createService(params: CreateServiceParams): Promise<Service> {
    const formData = buildCatalogFormData(params)
    const res = await authFetch('/services', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to create service')
    }

    return res.json().catch(() => ({}) as Service)
  }

  async updateService(id: string, params: UpdateServiceParams): Promise<Service> {
    const formData = buildCatalogFormData(params)
    const res = await authFetch(`/services/${id}`, {
      method: 'PATCH',
      body: formData,
    })

    if (!res.ok) {
      if (res.status === 404) throw new Error('NOT_FOUND')
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to update service')
    }

    return res.json().catch(() => ({}) as Service)
  }

  async deleteService(id: string): Promise<void> {
    const res = await authFetch(`/services/${id}`, { method: 'DELETE' })

    if (!res.ok) {
      if (res.status === 404) throw new Error('NOT_FOUND')
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to delete service')
    }
  }

  // ── Products ──

  async listProducts(params?: ListProductsParams): Promise<PaginatedResponse<Product>> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.search) searchParams.set('search', params.search)

    const query = searchParams.toString()
    const res = await authFetch(`/products${query ? `?${query}` : ''}`)

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to fetch products')
    }

    return res.json()
  }

  async createProduct(params: CreateProductParams): Promise<Product> {
    const formData = buildCatalogFormData(params)
    const res = await authFetch('/products', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to create product')
    }

    return res.json().catch(() => ({}) as Product)
  }

  async updateProduct(id: string, params: UpdateProductParams): Promise<Product> {
    const formData = buildCatalogFormData(params)
    const res = await authFetch(`/products/${id}`, {
      method: 'PATCH',
      body: formData,
    })

    if (!res.ok) {
      if (res.status === 404) throw new Error('NOT_FOUND')
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to update product')
    }

    return res.json().catch(() => ({}) as Product)
  }

  async deleteProduct(id: string): Promise<void> {
    const res = await authFetch(`/products/${id}`, { method: 'DELETE' })

    if (!res.ok) {
      if (res.status === 404) throw new Error('NOT_FOUND')
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to delete product')
    }
  }

  // ── Invoices ──

  async listInvoices(params?: ListInvoicesParams): Promise<PaginatedResponse<Invoice>> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.status) searchParams.set('status', params.status)
    if (params?.type) searchParams.set('type', params.type)
    if (params?.leadId) searchParams.set('leadId', params.leadId)
    if (params?.dateFrom) searchParams.set('dateFrom', params.dateFrom)
    if (params?.dateTo) searchParams.set('dateTo', params.dateTo)

    const query = searchParams.toString()
    const res = await authFetch(`/invoices${query ? `?${query}` : ''}`)

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to fetch invoices')
    }

    return res.json()
  }

  async createInvoice(params: CreateInvoiceParams): Promise<Invoice> {
    const res = await authFetch('/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to create invoice')
    }

    return res.json().catch(() => ({}) as Invoice)
  }

  async markInvoicePaid(id: string): Promise<Invoice> {
    const res = await authFetch(`/invoices/${id}/mark-paid`, { method: 'PATCH' })

    if (!res.ok) {
      if (res.status === 404) throw new Error('NOT_FOUND')
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to mark invoice as paid')
    }

    return res.json().catch(() => ({}) as Invoice)
  }

  async cancelInvoice(id: string): Promise<Invoice> {
    const res = await authFetch(`/invoices/${id}/cancel`, { method: 'PATCH' })

    if (!res.ok) {
      if (res.status === 404) throw new Error('NOT_FOUND')
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to cancel invoice')
    }

    return res.json().catch(() => ({}) as Invoice)
  }

  async getFinanceDashboard(): Promise<FinanceDashboard> {
    const res = await authFetch('/invoices/dashboard')

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to fetch finance dashboard')
    }

    return res.json()
  }

  // ── Subscriptions (admin) ──

  async listSubscriptions(
    params?: ListSubscriptionsParams,
  ): Promise<PaginatedResponse<Subscription>> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.status) searchParams.set('status', params.status)

    const query = searchParams.toString()
    const res = await authFetch(`/admin/subscriptions${query ? `?${query}` : ''}`)

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to fetch subscriptions')
    }

    return res.json()
  }

  async createSubscription(params: CreateSubscriptionParams): Promise<Subscription> {
    const res = await authFetch('/admin/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to create subscription')
    }

    return res.json()
  }

  async updateSubscription(id: string, params: UpdateSubscriptionParams): Promise<Subscription> {
    const res = await authFetch(`/admin/subscriptions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })

    if (!res.ok) {
      if (res.status === 404) throw new Error('NOT_FOUND')
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to update subscription')
    }

    return res.json()
  }

  // ── Admin Invoices ──

  async listAdminInvoices(
    params?: ListAdminInvoicesParams,
  ): Promise<PaginatedResponse<AdminInvoice>> {
    const searchParams = new URLSearchParams()
    if (params?.page) searchParams.set('page', String(params.page))
    if (params?.limit) searchParams.set('limit', String(params.limit))
    if (params?.status) searchParams.set('status', params.status)
    if (params?.userId) searchParams.set('userId', params.userId)

    const query = searchParams.toString()
    const res = await authFetch(`/admin/invoices${query ? `?${query}` : ''}`)

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to fetch admin invoices')
    }

    return res.json()
  }

  async createAdminInvoice(params: CreateAdminInvoiceParams): Promise<AdminInvoice> {
    const res = await authFetch('/admin/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to create admin invoice')
    }

    return res.json()
  }

  async markAdminInvoicePaid(id: string): Promise<AdminInvoice> {
    const res = await authFetch(`/admin/invoices/${id}/mark-paid`, { method: 'PATCH' })

    if (!res.ok) {
      if (res.status === 404) throw new Error('NOT_FOUND')
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to mark admin invoice as paid')
    }

    return res.json()
  }

  async cancelAdminInvoice(id: string): Promise<AdminInvoice> {
    const res = await authFetch(`/admin/invoices/${id}/cancel`, { method: 'PATCH' })

    if (!res.ok) {
      if (res.status === 404) throw new Error('NOT_FOUND')
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to cancel admin invoice')
    }

    return res.json()
  }

  async getAdminBillingDashboard(): Promise<AdminBillingDashboard> {
    const res = await authFetch('/admin/invoices/dashboard')

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to fetch admin billing dashboard')
    }

    return res.json()
  }

  // ── Settings ──

  async getPrepaymentSetting(): Promise<PrepaymentSetting> {
    const res = await authFetch('/settings/prepayment')

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to fetch prepayment setting')
    }

    return res.json()
  }

  async updatePrepaymentSetting(enabled: boolean): Promise<PrepaymentSetting> {
    const res = await authFetch('/settings/prepayment', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw new Error(body.message ?? 'Failed to update prepayment setting')
    }

    return res.json()
  }
}
