'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trophy, Package, Calendar } from 'lucide-react'
import type { TopProduct } from '@/lib/supabase/types'

interface TopProductsProps {
  products: TopProduct[]
  period?: '7d' | '30d' | '90d'
  onPeriodChange?: (period: '7d' | '30d' | '90d') => void
}

export function TopProducts({ products, period = '30d', onPeriodChange }: TopProductsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(period)

  const handlePeriodChange = (newPeriod: '7d' | '30d' | '90d') => {
    setSelectedPeriod(newPeriod)
    onPeriodChange?.(newPeriod)
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const getRankBadge = (index: number) => {
    const badges = [
      { bg: 'bg-amber-500', text: 'text-white', icon: '🥇' },
      { bg: 'bg-gray-400', text: 'text-white', icon: '🥈' },
      { bg: 'bg-amber-700', text: 'text-white', icon: '🥉' }
    ]
    
    if (index < 3) {
      return badges[index]
    }
    return { bg: 'bg-gray-200', text: 'text-gray-600', icon: `${index + 1}` }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-100 rounded-lg">
            <Trophy className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Produk Terlaris</h3>
            <p className="text-sm text-gray-500">Top 5 produk paling laku</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <select
            value={selectedPeriod}
            onChange={(e) => handlePeriodChange(e.target.value as '7d' | '30d' | '90d')}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="7d">7 Hari</option>
            <option value="30d">30 Hari</option>
            <option value="90d">90 Hari</option>
          </select>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          <Package className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Belum ada data penjualan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product, index) => {
            const badge = getRankBadge(index)
            
            return (
              <Link
                key={product.id}
                href={`/admin/products/${product.id}/edit`}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-amber-50 transition-colors group"
              >
                <div className={`w-8 h-8 rounded-full ${badge.bg} ${badge.text} flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                  {badge.icon}
                </div>
                
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
                  <h4 className="font-medium text-gray-900 truncate group-hover:text-amber-700">
                    {product.title}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {product.sold} terjual
                  </p>
                </div>
                
                <div className="text-right">
                  <p className="font-semibold text-amber-600">
                    {formatCurrency(product.revenue)}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
