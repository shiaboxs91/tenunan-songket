import { getDashboardStats } from '@/lib/supabase/admin'
import { DashboardStats } from '@/components/admin/DashboardStats'
import { RecentOrders } from '@/components/admin/RecentOrders'

export default async function AdminDashboard() {
  const stats = await getDashboardStats()

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Gagal memuat data dashboard</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang di panel admin Tenunan Songket
        </p>
      </div>

      <DashboardStats
        totalOrders={stats.totalOrders}
        totalRevenue={stats.totalRevenue}
        totalCustomers={stats.totalCustomers}
        totalProducts={stats.totalProducts}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RecentOrders orders={stats.recentOrders} />
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Ringkasan Penjualan</h2>
          <div className="bg-white p-6 rounded-lg border">
            <p className="text-sm text-muted-foreground mb-2">30 Hari Terakhir</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Penjualan:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(stats.salesData.reduce((sum, day) => sum + day.revenue, 0))}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Total Pesanan:</span>
                <span className="font-medium">
                  {stats.salesData.reduce((sum, day) => sum + day.orders, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Rata-rata per Hari:</span>
                <span className="font-medium">
                  {Math.round(stats.salesData.reduce((sum, day) => sum + day.orders, 0) / 30)} pesanan
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}