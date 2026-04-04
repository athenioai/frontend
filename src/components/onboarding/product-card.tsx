'use client'

import { motion } from 'motion/react'
import { Package, Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/lib/types'

const BILLING_LABELS: Record<string, string> = {
  monthly: 'Mensal',
  yearly: 'Anual',
  one_time: 'Único',
}

function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

interface ProductCardProps {
  product: Product
  onEdit: () => void
  onDelete: () => void
  index?: number
}

export function ProductCard({ product, onEdit, onDelete, index = 0 }: ProductCardProps) {
  const prices = product.variants.map((v) => v.price_cents).sort((a, b) => a - b)
  const priceRange = prices.length === 1
    ? formatPrice(prices[0])
    : `${formatPrice(prices[0])} – ${formatPrice(prices[prices.length - 1])}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="card-surface card-surface-interactive overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
              <Package className="h-[18px] w-[18px] text-accent" />
            </div>
            <div>
              <h3 className="font-title text-[15px] font-bold text-text-primary">{product.name}</h3>
              <p className="text-[12px] text-text-subtle">
                {product.variants.length} variante{product.variants.length !== 1 && 's'}
              </p>
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={onEdit} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-subtle hover:bg-accent/10 hover:text-accent transition-all">
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button onClick={onDelete} className="flex h-8 w-8 items-center justify-center rounded-lg text-text-subtle hover:bg-danger-bg hover:text-danger transition-all">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {product.description && (
          <p className="mt-3 text-[13px] text-text-muted line-clamp-2">{product.description}</p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span className="font-title text-[16px] font-bold text-accent">{priceRange}</span>
          <div className="flex gap-1.5">
            {[...new Set(product.variants.map((v) => v.billing_cycle ?? 'one_time'))].map((cycle) => (
              <Badge key={cycle} variant="secondary" className="text-[10px]">
                {BILLING_LABELS[cycle] ?? cycle}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
