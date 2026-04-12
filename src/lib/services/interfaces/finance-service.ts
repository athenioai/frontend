// Service catalog
export interface Service {
  id: string
  name: string
  description: string | null
  price: number
  pixDiscountPercent: number
  cardDiscountPercent: number
  specialDiscountName: string | null
  specialDiscountPercent: number
  specialDiscountStartsAt: string | null
  specialDiscountEndsAt: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

// Product catalog
export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  pixDiscountPercent: number
  cardDiscountPercent: number
  specialDiscountName: string | null
  specialDiscountPercent: number
  specialDiscountStartsAt: string | null
  specialDiscountEndsAt: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

// Invoice
export interface Invoice {
  id: string
  leadId: string
  type: 'service' | 'product' | 'manual'
  referenceId: string | null
  description: string
  amount: number
  paymentMethod: 'pix' | 'card' | null
  discountPercent: number
  finalAmount: number
  status: 'pending' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  dueDate: string
  paidAt: string | null
  lateFeePercent: number
  lateInterestType: 'simple' | 'compound'
  lateInterestPercent: number
  appointmentId: string | null
  createdAt: string
  updatedAt: string
}

// Subscription (admin)
export interface Subscription {
  id: string
  userId: string
  userName: string | null
  userEmail: string | null
  planId: string
  planName: string | null
  planCost: number | null
  status: 'active' | 'suspended' | 'cancelled'
  billingDay: number
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelledAt: string | null
  createdAt: string
  updatedAt: string
}

// Admin Invoice
export interface AdminInvoice {
  id: string
  subscriptionId: string
  userId: string
  userName: string | null
  amount: number
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'
  dueDate: string
  paidAt: string | null
  lateFeePercent: number
  lateInterestType: 'simple' | 'compound'
  lateInterestPercent: number
  paymentLink: string | null
  createdAt: string
  updatedAt: string
}

// Dashboard
export interface FinanceDashboard {
  revenueThisMonth: number
  pendingAmount: number
  overdueAmount: number
  averageTicket: number
  byType: { service: number; product: number; manual: number }
  conversationsThisMonth: number
  appointmentsThisMonth: number
  appointmentsCancelledThisMonth: number
  leadsThisMonth: number
  conversionRate: number
  dailyRevenue: { date: string; amount: number }[]
  planCost: number
  roi: number | null
}

export interface AdminBillingDashboard {
  mrr: number
  totalCollectedThisMonth: number
  overdueCount: number
  activeSubscriptions: number
}

// Pagination
export interface Pagination {
  page: number
  limit: number
  total: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: Pagination
}

// Params
export interface ListServicesParams {
  page?: number
  limit?: number
  search?: string
}

export interface ListProductsParams {
  page?: number
  limit?: number
  search?: string
}

export interface ListInvoicesParams {
  page?: number
  limit?: number
  status?: string
  type?: string
  leadId?: string
  dateFrom?: string
  dateTo?: string
}

export interface ListSubscriptionsParams {
  page?: number
  limit?: number
  status?: string
}

export interface ListAdminInvoicesParams {
  page?: number
  limit?: number
  status?: string
  userId?: string
}

export interface CreateServiceParams {
  name: string
  description?: string
  price: number
  pixDiscountPercent?: number
  cardDiscountPercent?: number
  specialDiscountName?: string | null
  specialDiscountPercent?: number
  specialDiscountStartsAt?: string | null
  specialDiscountEndsAt?: string | null
}

export interface UpdateServiceParams {
  name?: string
  description?: string
  price?: number
  pixDiscountPercent?: number
  cardDiscountPercent?: number
  specialDiscountName?: string | null
  specialDiscountPercent?: number | null
  specialDiscountStartsAt?: string | null
  specialDiscountEndsAt?: string | null
  active?: boolean
}

export interface CreateProductParams {
  name: string
  description?: string
  price: number
  pixDiscountPercent?: number
  cardDiscountPercent?: number
  specialDiscountName?: string | null
  specialDiscountPercent?: number
  specialDiscountStartsAt?: string | null
  specialDiscountEndsAt?: string | null
}

export interface UpdateProductParams {
  name?: string
  description?: string
  price?: number
  pixDiscountPercent?: number
  cardDiscountPercent?: number
  specialDiscountName?: string | null
  specialDiscountPercent?: number | null
  specialDiscountStartsAt?: string | null
  specialDiscountEndsAt?: string | null
  active?: boolean
}

export interface CreateInvoiceParams {
  leadId: string
  type: string
  referenceId?: string
  description: string
  amount: number
  paymentMethod?: string
  dueDate: string
  appointmentId?: string
  lateFeePercent?: number
  lateInterestType?: string
  lateInterestPercent?: number
}

export interface CreateSubscriptionParams {
  userId: string
  planId: string
  billingDay: number
}

export interface UpdateSubscriptionParams {
  planId?: string
  billingDay?: number
  status?: string
}

export interface CreateAdminInvoiceParams {
  subscriptionId: string
  amount: number
  dueDate: string
}

// Prepayment setting
export interface PrepaymentSetting {
  enabled: boolean
}

export interface IFinanceService {
  // Services
  listServices(params?: ListServicesParams): Promise<PaginatedResponse<Service>>
  createService(params: CreateServiceParams): Promise<Service>
  updateService(id: string, params: UpdateServiceParams): Promise<Service>
  deleteService(id: string): Promise<void>

  // Products
  listProducts(params?: ListProductsParams): Promise<PaginatedResponse<Product>>
  createProduct(params: CreateProductParams): Promise<Product>
  updateProduct(id: string, params: UpdateProductParams): Promise<Product>
  deleteProduct(id: string): Promise<void>

  // Invoices
  listInvoices(params?: ListInvoicesParams): Promise<PaginatedResponse<Invoice>>
  createInvoice(params: CreateInvoiceParams): Promise<Invoice>
  markInvoicePaid(id: string): Promise<Invoice>
  cancelInvoice(id: string): Promise<Invoice>
  getFinanceDashboard(): Promise<FinanceDashboard>

  // Subscriptions (admin)
  listSubscriptions(params?: ListSubscriptionsParams): Promise<PaginatedResponse<Subscription>>
  createSubscription(params: CreateSubscriptionParams): Promise<Subscription>
  updateSubscription(id: string, params: UpdateSubscriptionParams): Promise<Subscription>

  // Admin Invoices
  listAdminInvoices(params?: ListAdminInvoicesParams): Promise<PaginatedResponse<AdminInvoice>>
  createAdminInvoice(params: CreateAdminInvoiceParams): Promise<AdminInvoice>
  markAdminInvoicePaid(id: string): Promise<AdminInvoice>
  cancelAdminInvoice(id: string): Promise<AdminInvoice>
  getAdminBillingDashboard(): Promise<AdminBillingDashboard>

  // Settings
  getPrepaymentSetting(): Promise<PrepaymentSetting>
  updatePrepaymentSetting(enabled: boolean): Promise<PrepaymentSetting>
}
