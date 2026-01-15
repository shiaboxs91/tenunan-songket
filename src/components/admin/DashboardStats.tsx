"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ShoppingCart, 
  DollarSign, 
  Users, 
  Package 
} from 'lucide-react'

interface DashboardStatsProps {
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  totalProducts: number
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function DashboardStats({
  totalOrders,
  totalRevenue,
  totalCustomers,
  totalProducts
}: DashboardStatsProps) {
  const stats = [
    {
      title: 'Total Pesanan',
      value: totalOrders.toLocaleString(),
      icon: ShoppingCart,
      color: 'text-blue-600'
    },
    {
      title: 'Total Pendapatan',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Total Pelanggan',
      value: totalCustomers.toLocaleString(),
      icon: Users,
      color: 'text-purple-600'
    },
    {
      title: 'Total Produk',
      value: totalProducts.toLocaleString(),
      icon: Package,
      color: 'text-orange-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}