"use client"

import { 
  ShoppingCart, 
  DollarSign, 
  Users, 
  Package,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import type { RevenueComparison } from '@/lib/supabase/types'

interface DashboardStatsProps {
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  totalProducts: number
  revenueComparison?: RevenueComparison
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

function calculateChange(current: number, previous: number): { percent: number; trend: 'up' | 'down' | 'neutral' } {
  if (previous === 0) {
    return { percent: current > 0 ? 100 : 0, trend: current > 0 ? 'up' : 'neutral' }
  }
  const percent = ((current - previous) / previous) * 100
  return {
    percent: Math.abs(percent),
    trend: percent > 0 ? 'up' : percent < 0 ? 'down' : 'neutral'
  }
}

export function DashboardStats({
  totalOrders,
  totalRevenue,
  totalCustomers,
  totalProducts,
  revenueComparison
}: DashboardStatsProps) {
  const todayChange = revenueComparison 
    ? calculateChange(revenueComparison.today, revenueComparison.yesterday)
    : null

  const weekChange = revenueComparison
    ? calculateChange(revenueComparison.thisWeek, revenueComparison.lastWeek)
    : null

  const monthChange = revenueComparison
    ? calculateChange(revenueComparison.thisMonth, revenueComparison.lastMonth)
    : null

  const stats = [
    {
      title: 'Total Pesanan',
      value: totalOrders.toLocaleString(),
      icon: ShoppingCart,
      bgColor: 'bg-blue-50',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Total Pendapatan',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      bgColor: 'bg-amber-50',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      borderColor: 'border-amber-200',
      change: monthChange
    },
    {
      title: 'Total Pelanggan',
      value: totalCustomers.toLocaleString(),
      icon: Users,
      bgColor: 'bg-purple-50',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Total Produk',
      value: totalProducts.toLocaleString(),
      icon: Package,
      bgColor: 'bg-green-50',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      borderColor: 'border-green-200'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div 
            key={stat.title}
            className={`${stat.bgColor} rounded-xl border ${stat.borderColor} p-5 transition-all hover:shadow-md`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                
                {stat.change && (
                  <div className="flex items-center gap-1 mt-2">
                    {stat.change.trend === 'up' && (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600">
                          +{stat.change.percent.toFixed(1)}%
                        </span>
                      </>
                    )}
                    {stat.change.trend === 'down' && (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-600">
                          -{stat.change.percent.toFixed(1)}%
                        </span>
                      </>
                    )}
                    {stat.change.trend === 'neutral' && (
                      <>
                        <Minus className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-500">0%</span>
                      </>
                    )}
                    <span className="text-xs text-gray-500">vs bulan lalu</span>
                  </div>
                )}
              </div>
              
              <div className={`${stat.iconBg} p-3 rounded-xl`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Comparison Cards */}
      {revenueComparison && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white">
            <p className="text-amber-100 text-sm font-medium">Pendapatan Hari Ini</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(revenueComparison.today)}</p>
            {todayChange && (
              <div className="flex items-center gap-1 mt-2">
                {todayChange.trend === 'up' && (
                  <>
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">+{todayChange.percent.toFixed(1)}%</span>
                  </>
                )}
                {todayChange.trend === 'down' && (
                  <>
                    <TrendingDown className="h-4 w-4" />
                    <span className="text-sm">-{todayChange.percent.toFixed(1)}%</span>
                  </>
                )}
                {todayChange.trend === 'neutral' && (
                  <span className="text-sm">Sama dengan kemarin</span>
                )}
                <span className="text-xs text-amber-200">vs kemarin</span>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
            <p className="text-blue-100 text-sm font-medium">Pendapatan Minggu Ini</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(revenueComparison.thisWeek)}</p>
            {weekChange && (
              <div className="flex items-center gap-1 mt-2">
                {weekChange.trend === 'up' && (
                  <>
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">+{weekChange.percent.toFixed(1)}%</span>
                  </>
                )}
                {weekChange.trend === 'down' && (
                  <>
                    <TrendingDown className="h-4 w-4" />
                    <span className="text-sm">-{weekChange.percent.toFixed(1)}%</span>
                  </>
                )}
                {weekChange.trend === 'neutral' && (
                  <span className="text-sm">Sama dengan minggu lalu</span>
                )}
                <span className="text-xs text-blue-200">vs minggu lalu</span>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
            <p className="text-purple-100 text-sm font-medium">Pendapatan Bulan Ini</p>
            <p className="text-2xl font-bold mt-1">{formatCurrency(revenueComparison.thisMonth)}</p>
            {monthChange && (
              <div className="flex items-center gap-1 mt-2">
                {monthChange.trend === 'up' && (
                  <>
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">+{monthChange.percent.toFixed(1)}%</span>
                  </>
                )}
                {monthChange.trend === 'down' && (
                  <>
                    <TrendingDown className="h-4 w-4" />
                    <span className="text-sm">-{monthChange.percent.toFixed(1)}%</span>
                  </>
                )}
                {monthChange.trend === 'neutral' && (
                  <span className="text-sm">Sama dengan bulan lalu</span>
                )}
                <span className="text-xs text-purple-200">vs bulan lalu</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
