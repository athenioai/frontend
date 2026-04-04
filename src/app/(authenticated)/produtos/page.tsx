'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Package, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/onboarding/product-card'
import { ProductForm } from '@/components/onboarding/product-form'
import { clientApi } from '@/lib/api/client-api'
import type { Product, CreateProductPayload } from '@/lib/types'

export default function ProdutosPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  useEffect(() => {
    clientApi<Product[]>('/api/company/products')
      .then(setProducts)
      .catch(() => toast.error('Erro ao carregar produtos'))
      .finally(() => setLoading(false))
  }, [])

  async function handleCreate(data: CreateProductPayload) {
    const created = await clientApi<Product>('/api/company/products', { method: 'POST', body: JSON.stringify(data) })
    setProducts((prev) => [...prev, created])
    setShowForm(false)
    toast.success('Produto criado! Knowledge base sendo atualizado...')
  }

  async function handleDelete(id: string) {
    await clientApi<void>(`/api/company/products/${id}`, { method: 'DELETE' })
    setProducts((prev) => prev.filter((p) => p.id !== id))
    toast.success('Produto removido')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-accent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent/15 to-accent/5">
            <Package className="h-[18px] w-[18px] text-accent" />
          </div>
          <div>
            <h1 className="font-title text-[22px] font-bold text-text-primary">Produtos</h1>
            <p className="text-[13px] text-text-muted">{products.length} produto{products.length !== 1 && 's'} cadastrado{products.length !== 1 && 's'}</p>
          </div>
        </div>
        <Button
          onClick={() => { setEditingProduct(null); setShowForm(true) }}
          className="h-10 rounded-xl bg-accent px-5 text-[13px] font-semibold text-primary-foreground hover:brightness-110"
        >
          <Plus className="h-4 w-4 mr-1.5" /> Novo Produto
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="card-surface p-6">
            <ProductForm
              initialData={editingProduct ?? undefined}
              onSubmit={handleCreate}
              onCancel={() => setShowForm(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {products.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 mb-4">
            <Package className="h-6 w-6 text-accent" />
          </div>
          <p className="text-[14px] font-medium text-text-primary">Nenhum produto cadastrado</p>
          <p className="mt-1 text-[12px] text-text-subtle">Adicione seu primeiro produto para começar</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {products.map((product, i) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={() => { setEditingProduct(product); setShowForm(true) }}
              onDelete={() => handleDelete(product.id)}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  )
}
