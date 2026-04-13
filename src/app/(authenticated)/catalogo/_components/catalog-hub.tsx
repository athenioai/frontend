'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Wrench, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ServicesTable } from './services-table'
import { ProductsTable } from './products-table'
import type { Service, Product, Pagination } from '@/lib/services/interfaces/finance-service'

interface CatalogHubProps {
  services: Service[]
  servicesPagination: Pagination
  products: Product[]
  productsPagination: Pagination
  currentSearch?: string
}

const TABS = [
  { id: 'services' as const, label: 'Serviços', icon: Wrench },
  { id: 'products' as const, label: 'Produtos', icon: Package },
]

export function CatalogHub({
  services,
  servicesPagination,
  products,
  productsPagination,
  currentSearch,
}: CatalogHubProps) {
  const [activeTab, setActiveTab] = useState<'services' | 'products'>('services')

  return (
    <div>
      <h1 className="font-title text-2xl font-bold text-text-primary">
        Catálogo
      </h1>
      <p className="mt-1 text-sm text-text-muted">
        Gerencie seus serviços e produtos
      </p>

      <div className="mt-6 flex gap-1 rounded-xl bg-surface-2 p-1">
        {TABS.map((tab) => {
          const active = activeTab === tab.id
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                active
                  ? 'text-text-primary'
                  : 'text-text-subtle hover:text-text-muted',
              )}
            >
              {active && (
                <motion.div
                  layoutId="catalog-tab-bg"
                  className="absolute inset-0 rounded-lg bg-surface-1 shadow-sm"
                  transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                />
              )}
              <Icon className="relative h-4 w-4" />
              <span className="relative">{tab.label}</span>
            </button>
          )
        })}
      </div>

      <div className="mt-6">
        <AnimatePresence mode="wait">
          {activeTab === 'services' && (
            <motion.div
              key="services"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <ServicesTable
                services={services}
                pagination={servicesPagination}
                currentSearch={currentSearch}
              />
            </motion.div>
          )}
          {activeTab === 'products' && (
            <motion.div
              key="products"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              <ProductsTable
                products={products}
                pagination={productsPagination}
                currentSearch={currentSearch}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
