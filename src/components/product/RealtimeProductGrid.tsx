'use client'

import { useEffect, useState } from 'react'
import { Product } from '@/lib/types'
import { ProductCard } from './ProductCard'
import { useRealtimeStock } from '@/hooks/useRealtimeStock'
import { GridDensity } from './GridDensityToggle'

interface RealtimeProductGridProps {
  initialProducts: Product[]
  density?: GridDensity
  onQuickView?: (product: Product) => void
}

/**
 * Product grid with realtime stock updates
 * Automatically updates product stock when changes occur in database
 */
export function RealtimeProductGrid({ 
  initialProducts, 
  density = 'comfortable',
  onQuickView 
}: RealtimeProductGridProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  
  // Get all product IDs to watch
  const productIds = products.map(p => p.id)
  
  // Subscribe to stock updates
  const { stockUpdates } = useRealtimeStock(productIds)

  // Update products when stock changes
  useEffect(() => {
    if (stockUpdates.size > 0) {
      setProducts(prevProducts => 
        prevProducts.map(product => {
          const update = stockUpdates.get(product.id)
          if (update) {
            return {
              ...product,
              stock_quantity: update.stock_quantity,
              is_available: update.is_available
            }
          }
          return product
        })
      )
    }
  }, [stockUpdates])

  // Update when initial products change
  useEffect(() => {
    setProducts(initialProducts)
  }, [initialProducts])

  return (
    <div className={`grid gap-6 ${
      density === 'compact' 
        ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5' 
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
    }`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          density={density}
          onQuickView={onQuickView}
        />
      ))}
    </div>
  )
}
