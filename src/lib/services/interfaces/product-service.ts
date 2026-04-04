import type { Product, CreateProductPayload, Variant, CreateVariantPayload } from '@/lib/types'

export interface IProductService {
  getAll(): Promise<Product[]>
  getById(id: string): Promise<Product>
  create(data: CreateProductPayload): Promise<Product>
  update(id: string, data: Partial<CreateProductPayload>): Promise<Product>
  delete(id: string): Promise<void>
  addVariant(productId: string, data: CreateVariantPayload): Promise<Variant>
  updateVariant(id: string, data: Partial<CreateVariantPayload>): Promise<Variant>
  deleteVariant(id: string): Promise<void>
}
