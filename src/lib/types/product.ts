export type BillingCycle = 'monthly' | 'yearly' | 'one_time'

export interface Variant {
  id: string
  product_id: string
  name: string
  price_cents: number
  billing_cycle?: BillingCycle
  features?: string[]
  is_active: boolean
  created_at: string
}

export interface Product {
  id: string
  tenant_id: string
  name: string
  description?: string
  benefits?: string[]
  objection_busters?: string[]
  is_active: boolean
  variants: Variant[]
  created_at: string
  updated_at: string
}

export interface CreateVariantPayload {
  name: string
  price_cents: number
  billing_cycle?: BillingCycle
  features?: string[]
}

export interface CreateProductPayload {
  name: string
  description?: string
  benefits?: string[]
  objection_busters?: string[]
  variants: CreateVariantPayload[]
}
