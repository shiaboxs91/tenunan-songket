'use client'

import Link from 'next/link'
import Image from 'next/image'
import { AlertTriangle, Package, ExternalLink } from 'lucide-react'
import type { LowStockProduct } from '@/lib/supabase/types'

interface StockAlertsProps {
  products: LowStockProduct[]
  threshold?: number
}

export function StockAlerts({ products, threshold = 10 }: StockAlertsProps) {
  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: 'Habis', color: 'bg-red-100 text-red-700' }
    if (stock <= 5) return { label: 'Kritis', color: 'bg-orange-100 text-orange-700' }
    return { label: 'Rendah', color: 'bg-yellow-100 text-yellow-700' }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Peringatan Stok</h3>
            <p className="text-sm text-gray-500">
              {products.length} produk di bawah {threshold} unit
            </p>
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Semua produk memiliki stok yang cukup</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {products.map((product) => {
            const status = getStockStatus(product.stock)
            
            return (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {product.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                    <span className="text-sm text-gray-500">
                      Stok: {product.stock} | Tersedia: {product.available_stock}
                    </span>
                  </div>
                </div>
                
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="p-2 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors"
                  title="Edit produk"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
