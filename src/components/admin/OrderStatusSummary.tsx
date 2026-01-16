'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { ClipboardList } from 'lucide-react'
import type { OrderStatusCounts } from '@/lib/supabase/types'

interface OrderStatusSummaryProps {
  counts: OrderStatusCounts
}

const STATUS_CONFIG = {
  pending_payment: { label: 'Menunggu Bayar', color: '#fbbf24' },
  paid: { label: 'Dibayar', color: '#22c55e' },
  processing: { label: 'Diproses', color: '#3b82f6' },
  shipped: { label: 'Dikirim', color: '#8b5cf6' },
  delivered: { label: 'Terkirim', color: '#06b6d4' },
  completed: { label: 'Selesai', color: '#10b981' },
  cancelled: { label: 'Dibatalkan', color: '#ef4444' },
  refunded: { label: 'Dikembalikan', color: '#f97316' }
}

export function OrderStatusSummary({ counts }: OrderStatusSummaryProps) {
  const data = Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([status, count]) => ({
      name: STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.label || status,
      value: count,
      color: STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]?.color || '#9ca3af'
    }))

  const totalOrders = Object.values(counts).reduce((sum, c) => sum + c, 0)

  // Calculate active orders (not completed, cancelled, or refunded)
  const activeOrders = counts.pending_payment + counts.paid + counts.processing + counts.shipped

  return (
    <div className="bg-white rounded-xl shadow-sm border border-amber-100 p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <ClipboardList className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Status Pesanan</h3>
          <p className="text-sm text-gray-500">
            {totalOrders} total | {activeOrders} aktif
          </p>
        </div>
      </div>

      {totalOrders === 0 ? (
        <div className="py-8 text-center text-gray-500">
          <ClipboardList className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Belum ada pesanan</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row items-center gap-4">
          <div className="w-full lg:w-1/2 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value} pesanan`, '']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="w-full lg:w-1/2 grid grid-cols-2 gap-2">
            {Object.entries(STATUS_CONFIG).map(([status, config]) => {
              const count = counts[status as keyof OrderStatusCounts]
              if (count === 0) return null
              
              return (
                <div
                  key={status}
                  className="flex items-center gap-2 p-2 rounded-lg bg-gray-50"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: config.color }}
                  />
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500 truncate">{config.label}</p>
                    <p className="font-semibold text-gray-900">{count}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
