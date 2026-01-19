import { 
  getEnhancedDashboardStats, 
  getDashboardStats,
  getLowStockProducts,
  getTopProducts,
  getRevenueComparison,
  getOrderStatusCountsEnhanced
} from '@/lib/supabase/admin'
import { DashboardStats } from '@/components/admin/DashboardStats'
import { RecentOrders } from '@/components/admin/RecentOrders'
import { SalesChart } from '@/components/admin/SalesChart'
import { StockAlerts } from '@/components/admin/StockAlerts'
import { TopProducts } from '@/components/admin/TopProducts'
import { OrderStatusSummary } from '@/components/admin/OrderStatusSummary'
import { RefreshCw } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminDashboard() {
  // Fetch all dashboard data in parallel
  const [
    basicStats,
    revenueComparison,
    orderStatusCounts,
    lowStockProducts,
    topProducts
  ] = await Promise.all([
    getDashboardStats(),
    getRevenueComparison(),
    getOrderStatusCountsEnhanced(),
    getLowStockProducts(10),
    getTopProducts(5, '30d')
  ])

  if (!basicStats) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <RefreshCw className="h-8 w-8 text-gray-400 animate-spin" />
        <p className="text-gray-500">Gagal memuat data dashboard</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          Coba Lagi
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">
            Selamat datang di panel admin Tenunan Songket
          </p>
        </div>
        {/* Time stamp removed to prevent hydration mismatch */}
      </div>

      {/* Stats Cards with Revenue Comparison */}
      <DashboardStats
        totalOrders={basicStats.totalOrders}
        totalRevenue={basicStats.totalRevenue}
        totalCustomers={basicStats.totalCustomers}
        totalProducts={basicStats.totalProducts}
        revenueComparison={revenueComparison}
      />

      {/* Sales Chart - Full Width */}
      <SalesChart data={basicStats.salesData} period="30d" />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <OrderStatusSummary counts={orderStatusCounts} />
          <TopProducts products={topProducts} period="30d" />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <StockAlerts products={lowStockProducts} threshold={10} />
          <RecentOrders orders={basicStats.recentOrders} />
        </div>
      </div>
    </div>
  )
}
