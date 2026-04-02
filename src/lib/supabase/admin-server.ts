import { createClient } from './server'
import type { OrderStatusCounts } from './types'

// Server-only admin functions for use in Server Components
// These functions use the server client which has access to cookies

export async function getServerDashboardStats() {
  const supabase = await createClient()
  
  try {
    // Get total orders
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })

    // Get total revenue (only paid orders)
    const { data: revenueData } = await supabase
      .from('orders')
      .select('total')
      .in('status', ['paid', 'processing', 'shipped', 'delivered', 'completed'])

    const totalRevenue = revenueData?.reduce((sum, order) => sum + Number(order.total), 0) || 0

    // Get total customers
    const { count: totalCustomers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'customer')

    // Get total products
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('is_deleted', false)

    // Get recent orders with profile data (no auth.admin needed)
    const { data: recentOrdersData } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        total,
        status,
        created_at,
        user_id,
        guest_email
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    const recentOrders = []
    if (recentOrdersData) {
      for (const order of recentOrdersData) {
        let fullName: string | null = null
        let email = order.guest_email || 'Guest'
        
        if (order.user_id) {
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('user_id', order.user_id)
            .single()
          
          fullName = profileData?.full_name || null
          
          // Use RPC to get email if available
          const { data: adminData } = await supabase.rpc('get_admins_with_email')
          const userMatch = adminData?.find((u: { user_id: string }) => u.user_id === order.user_id)
          if (userMatch) {
            email = userMatch.email
          }
        }

        recentOrders.push({
          ...order,
          user: {
            full_name: fullName,
            email
          }
        })
      }
    }

    // Get sales data for the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: salesRawData } = await supabase
      .from('orders')
      .select('created_at, total')
      .in('status', ['paid', 'processing', 'shipped', 'delivered', 'completed'])
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: true })

    // Group sales data by date
    const salesMap = new Map<string, { revenue: number; orders: number }>()
    
    if (salesRawData) {
      salesRawData.forEach(order => {
        if (order.created_at) {
          const date = new Date(order.created_at).toISOString().split('T')[0]
          const existing = salesMap.get(date) || { revenue: 0, orders: 0 }
          salesMap.set(date, {
            revenue: existing.revenue + Number(order.total),
            orders: existing.orders + 1
          })
        }
      })
    }

    const salesData = Array.from(salesMap.entries()).map(([date, data]) => ({
      date,
      ...data
    }))

    return {
      totalOrders: totalOrders || 0,
      totalRevenue,
      totalCustomers: totalCustomers || 0,
      totalProducts: totalProducts || 0,
      recentOrders,
      salesData
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return null
  }
}

// Get order status counts for dashboard
export async function getServerOrderStatusCounts(): Promise<OrderStatusCounts> {
  const supabase = await createClient()
  
  try {
    const { data } = await supabase
      .from('orders')
      .select('status')
    
    const counts: OrderStatusCounts = {
      pending_payment: 0,
      paid: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      completed: 0,
      cancelled: 0,
      refunded: 0
    }
    
    if (data) {
      for (const order of data) {
        const status = order.status as keyof OrderStatusCounts
        if (status in counts) {
          counts[status]++
        }
      }
    }
    
    return counts
  } catch (error) {
    console.error('Error fetching order status counts:', error)
    return {
      pending_payment: 0,
      paid: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      completed: 0,
      cancelled: 0,
      refunded: 0
    }
  }
}

// Get products with low stock
export async function getServerLowStockProducts(threshold: number = 10) {
  const supabase = await createClient()
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        title,
        slug,
        stock,
        reserved_stock
      `)
      .eq('is_active', true)
      .eq('is_deleted', false)
      .lt('stock', threshold)
      .order('stock', { ascending: true })
      .limit(20)
    
    if (error) {
      console.error('Error fetching low stock products:', error)
      return []
    }
    
    // Get primary images for products
    const productsWithImages = []
    
    for (const product of data || []) {
      const { data: imageData } = await supabase
        .from('product_images')
        .select('url')
        .eq('product_id', product.id)
        .eq('is_primary', true)
        .single()
      
      productsWithImages.push({
        id: product.id,
        title: product.title,
        slug: product.slug,
        stock: product.stock || 0,
        reserved_stock: product.reserved_stock || 0,
        available_stock: (product.stock || 0) - (product.reserved_stock || 0),
        image_url: imageData?.url || null
      })
    }
    
    return productsWithImages
  } catch (error) {
    console.error('Error in getServerLowStockProducts:', error)
    return []
  }
}

// Get top selling products
export async function getServerTopProducts(limit: number = 5, period: '7d' | '30d' | '90d' = '30d') {
  const supabase = await createClient()
  
  try {
    // Calculate date range
    const now = new Date()
    const daysMap = { '7d': 7, '30d': 30, '90d': 90 }
    const startDate = new Date(now.getTime() - daysMap[period] * 24 * 60 * 60 * 1000)
    
    // Get order items from completed orders in the period
    const { data: orderItems, error } = await supabase
      .from('order_items')
      .select(`
        product_id,
        quantity,
        subtotal,
        orders!inner(status, created_at)
      `)
      .in('orders.status', ['paid', 'processing', 'shipped', 'delivered', 'completed'])
      .gte('orders.created_at', startDate.toISOString())
    
    if (error) {
      console.error('Error fetching order items:', error)
      return []
    }
    
    // Aggregate by product
    const productStats = new Map<string, { sold: number; revenue: number }>()
    
    for (const item of orderItems || []) {
      const existing = productStats.get(item.product_id) || { sold: 0, revenue: 0 }
      productStats.set(item.product_id, {
        sold: existing.sold + item.quantity,
        revenue: existing.revenue + Number(item.subtotal)
      })
    }
    
    // Sort by sold and get top products
    const sortedProducts = Array.from(productStats.entries())
      .sort((a, b) => b[1].sold - a[1].sold)
      .slice(0, limit)
    
    // Get product details
    const topProducts = []
    
    for (const [productId, stats] of sortedProducts) {
      const { data: productData } = await supabase
        .from('products')
        .select('id, title, slug')
        .eq('id', productId)
        .single()
      
      const { data: imageData } = await supabase
        .from('product_images')
        .select('url')
        .eq('product_id', productId)
        .eq('is_primary', true)
        .single()
      
      if (productData) {
        topProducts.push({
          id: productData.id,
          title: productData.title,
          slug: productData.slug,
          sold: stats.sold,
          revenue: stats.revenue,
          image_url: imageData?.url || null
        })
      }
    }
    
    return topProducts
  } catch (error) {
    console.error('Error in getServerTopProducts:', error)
    return []
  }
}

// Get revenue comparison for different periods
export async function getServerRevenueComparison() {
  const supabase = await createClient()
  
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)
  
  // Calculate week boundaries (Monday as start)
  const dayOfWeek = today.getDay()
  const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1
  const thisWeekStart = new Date(today.getTime() - mondayOffset * 24 * 60 * 60 * 1000)
  const lastWeekStart = new Date(thisWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000)
  const lastWeekEnd = new Date(thisWeekStart.getTime() - 1)
  
  // Calculate month boundaries
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const lastMonthEnd = new Date(thisMonthStart.getTime() - 1)
  
  const paidStatuses = ['paid', 'processing', 'shipped', 'delivered', 'completed']
  
  async function getRevenueForPeriod(start: Date, end: Date): Promise<number> {
    const { data } = await supabase
      .from('orders')
      .select('total')
      .in('status', paidStatuses)
      .gte('created_at', start.toISOString())
      .lt('created_at', end.toISOString())
    
    return data?.reduce((sum, order) => sum + Number(order.total), 0) || 0
  }
  
  try {
    const [todayRev, yesterdayRev, thisWeekRev, lastWeekRev, thisMonthRev, lastMonthRev] = 
      await Promise.all([
        getRevenueForPeriod(today, new Date(today.getTime() + 24 * 60 * 60 * 1000)),
        getRevenueForPeriod(yesterday, today),
        getRevenueForPeriod(thisWeekStart, new Date(today.getTime() + 24 * 60 * 60 * 1000)),
        getRevenueForPeriod(lastWeekStart, new Date(lastWeekEnd.getTime() + 24 * 60 * 60 * 1000)),
        getRevenueForPeriod(thisMonthStart, new Date(today.getTime() + 24 * 60 * 60 * 1000)),
        getRevenueForPeriod(lastMonthStart, new Date(lastMonthEnd.getTime() + 24 * 60 * 60 * 1000))
      ])
    
    return {
      today: todayRev,
      yesterday: yesterdayRev,
      thisWeek: thisWeekRev,
      lastWeek: lastWeekRev,
      thisMonth: thisMonthRev,
      lastMonth: lastMonthRev
    }
  } catch (error) {
    console.error('Error in getServerRevenueComparison:', error)
    return {
      today: 0,
      yesterday: 0,
      thisWeek: 0,
      lastWeek: 0,
      thisMonth: 0,
      lastMonth: 0
    }
  }
}
