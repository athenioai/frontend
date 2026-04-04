import type { IProductService } from './interfaces/product-service'
import type { Product, CreateProductPayload, Variant, CreateVariantPayload } from '@/lib/types'
import { apiClient } from '@/lib/api/client'

export class ProductService implements IProductService {
  async getAll(): Promise<Product[]> {
    return apiClient<Product[]>('/api/company/products')
  }

  async getById(id: string): Promise<Product> {
    return apiClient<Product>(`/api/company/products/${id}`)
  }

  async create(data: CreateProductPayload): Promise<Product> {
    return apiClient<Product>('/api/company/products', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async update(id: string, data: Partial<CreateProductPayload>): Promise<Product> {
    return apiClient<Product>(`/api/company/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete(id: string): Promise<void> {
    await apiClient<void>(`/api/company/products/${id}`, { method: 'DELETE' })
  }

  async addVariant(productId: string, data: CreateVariantPayload): Promise<Variant> {
    return apiClient<Variant>(`/api/company/products/${productId}/variants`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateVariant(id: string, data: Partial<CreateVariantPayload>): Promise<Variant> {
    return apiClient<Variant>(`/api/company/variants/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteVariant(id: string): Promise<void> {
    await apiClient<void>(`/api/company/variants/${id}`, { method: 'DELETE' })
  }
}
