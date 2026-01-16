import { createClient } from './client'
import { createOrderStatusNotification } from './notifications'

export interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  totalProducts: number
  recentOrders: Array<{
    id: string
    order_number: string
    total: number
    status: string | null
    created_at: string | null
    user: {
      full_name: string | null
      email: string
    }
  }>
  salesData: Array<{
    date: string
    revenue: number
    orders: number
  }>
}

export async function getDashboardStats(): Promise<DashboardStats | null> {
  const supabase = createClient()

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

    // Get recent orders with user info
    const { data: recentOrdersData } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        total,
        status,
        created_at,
        user_id
      `)
      .order('created_at', { ascending: false })
      .limit(10)

    // Get user details for recent orders
    const recentOrders = []
    if (recentOrdersData) {
      for (const order of recentOrdersData) {
        const { data: userData } = await supabase.auth.admin.getUserById(order.user_id)
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', order.user_id)
          .single()

        recentOrders.push({
          ...order,
          user: {
            full_name: profileData?.full_name || null,
            email: userData.user?.email || 'Unknown'
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

export async function getOrderStatusCounts(): Promise<Record<string, number>> {
  const supabase = createClient()

  try {
    const { data } = await supabase
      .from('orders')
      .select('status')

    const statusCounts: Record<string, number> = {}
    
    if (data) {
      data.forEach(order => {
        if (order.status) {
          statusCounts[order.status] = (statusCounts[order.status] || 0) + 1
        }
      })
    }

    return statusCounts
  } catch (error) {
    console.error('Error fetching order status counts:', error)
    return {}
  }
}

export interface AdminOrder {
  id: string
  order_number: string
  total: number
  status: string | null
  created_at: string | null
  updated_at: string | null
  tracking_number?: string
  user: {
    id: string
    full_name: string | null
    email: string
  }
  shipping_address: any
  items_count: number
}

export async function getAdminOrders(
  page: number = 1,
  limit: number = 20,
  status?: string,
  search?: string
): Promise<{ orders: AdminOrder[]; total: number }> {
  const supabase = createClient()
  const offset = (page - 1) * limit

  try {
    let query = supabase
      .from('orders')
      .select(`
        id,
        order_number,
        total,
        status,
        created_at,
        updated_at,
        user_id,
        shipping_address
      `, { count: 'exact' })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (search) {
      query = query.or(`order_number.ilike.%${search}%`)
    }

    const { data: ordersData, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (!ordersData) {
      return { orders: [], total: 0 }
    }

    // Get user and address details for each order
    const orders: AdminOrder[] = []
    
    for (const order of ordersData) {
      // Get user details
      const { data: userData } = await supabase.auth.admin.getUserById(order.user_id)
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', order.user_id)
        .single()

      // Get items count
      const { count: itemsCount } = await supabase
        .from('order_items')
        .select('*', { count: 'exact', head: true })
        .eq('order_id', order.id)

      orders.push({
        ...order,
        tracking_number: undefined,
        user: {
          id: order.user_id,
          full_name: profileData?.full_name || null,
          email: userData.user?.email || 'Unknown'
        },
        shipping_address: order.shipping_address || {},
        items_count: itemsCount || 0
      })
    }

    return {
      orders,
      total: count || 0
    }
  } catch (error) {
    console.error('Error fetching admin orders:', error)
    return { orders: [], total: 0 }
  }
}

export async function getAdminOrderDetail(orderId: string): Promise<AdminOrder & {
  items: Array<{
    id: string
    quantity: number
    price: number
    product: {
      name: string
      slug: string
      image_url: string
    }
  }>
} | null> {
  const supabase = createClient()

  try {
    // Get order details
    const { data: orderData } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        total,
        status,
        created_at,
        updated_at,
        user_id,
        shipping_address,
        notes
      `)
      .eq('id', orderId)
      .single()

    if (!orderData) {
      return null
    }

    // Get user details
    const { data: userData } = await supabase.auth.admin.getUserById(orderData.user_id)
    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', orderData.user_id)
      .single()

    // Get order items with product details
    const { data: itemsData } = await supabase
      .from('order_items')
      .select(`
        id,
        quantity,
        price,
        product_id
      `)
      .eq('order_id', orderId)

    // Get product details for each item
    const items = []
    if (itemsData) {
      for (const item of itemsData) {
        const { data: productData } = await supabase
          .from('products')
          .select('title, slug, id')
          .eq('id', item.product_id)
          .single()

        const { data: imageData } = await supabase
          .from('product_images')
          .select('url')
          .eq('product_id', item.product_id)
          .eq('is_primary', true)
          .single()

        items.push({
          id: item.id,
          quantity: item.quantity,
          price: item.price,
          product: {
            name: productData?.title || 'Unknown',
            slug: productData?.slug || '',
            image_url: imageData?.url || ''
          }
        })
      }
    }

    return {
      ...orderData,
      tracking_number: undefined,
      user: {
        id: orderData.user_id,
        full_name: profileData?.full_name || null,
        email: userData.user?.email || 'Unknown'
      },
      shipping_address: orderData.shipping_address || {},
      items_count: items.length,
      items
    }
  } catch (error) {
    console.error('Error fetching admin order detail:', error)
    return null
  }
}

export async function updateOrderStatus(
  orderId: string,
  status: string
): Promise<boolean> {
  const supabase = createClient()

  try {
    // Get order details first
    const { data: orderData } = await supabase
      .from('orders')
      .select('user_id, order_number')
      .eq('id', orderId)
      .single()

    if (!orderData) {
      return false
    }

    const updateData: any = { status }
    // Note: tracking_number column doesn't exist yet in database
    // Will be added in future migration

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)

    if (error) {
      return false
    }

    // Create notification for order status change
    await createOrderStatusNotification(
      orderData.user_id,
      orderId,
      orderData.order_number,
      status
    )

    return true
  } catch (error) {
    console.error('Error updating order status:', error)
    return false
  }
}

export interface AdminUser {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
  last_sign_in_at: string | null | undefined
  orders_count: number
  total_spent: number
}

export async function getAdminUsers(
  page: number = 1,
  limit: number = 20,
  search?: string
): Promise<{ users: AdminUser[]; total: number }> {
  const supabase = createClient()

  try {
    // Get users from auth.users via admin API
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers({
      page,
      perPage: limit
    })

    if (authError) {
      console.error('Error fetching auth users:', authError)
      return { users: [], total: 0 }
    }

    const users: AdminUser[] = []

    for (const authUser of authUsers.users) {
      // Get profile data
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, role')
        .eq('user_id', authUser.id)
        .single()

      // Get orders count and total spent
      const { count: ordersCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', authUser.id)

      const { data: ordersData } = await supabase
        .from('orders')
        .select('total')
        .eq('user_id', authUser.id)
        .in('status', ['paid', 'processing', 'shipped', 'delivered', 'completed'])

      const totalSpent = ordersData?.reduce((sum, order) => sum + Number(order.total), 0) || 0

      users.push({
        id: authUser.id,
        email: authUser.email || 'Unknown',
        full_name: profileData?.full_name || null,
        role: profileData?.role || 'customer',
        created_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at,
        orders_count: ordersCount || 0,
        total_spent: totalSpent
      })
    }

    // Filter by search if provided
    let filteredUsers = users
    if (search) {
      const searchLower = search.toLowerCase()
      filteredUsers = users.filter(user => 
        user.email.toLowerCase().includes(searchLower) ||
        (user.full_name && user.full_name.toLowerCase().includes(searchLower))
      )
    }

    return {
      users: filteredUsers,
      total: authUsers.total || 0
    }
  } catch (error) {
    console.error('Error fetching admin users:', error)
    return { users: [], total: 0 }
  }
}

export interface AdminCoupon {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  min_purchase: number | null
  max_discount: number | null
  category_id: string | null
  usage_limit: number | null
  used_count: number | null
  start_date: string
  end_date: string
  is_active: boolean | null
  created_at: string | null
  category?: {
    name: string
  }
}

export async function getAdminCoupons(
  page: number = 1,
  limit: number = 20,
  search?: string
): Promise<{ coupons: AdminCoupon[]; total: number }> {
  const supabase = createClient()
  const offset = (page - 1) * limit

  try {
    let query = supabase
      .from('coupons')
      .select('*', { count: 'exact' })

    if (search) {
      query = query.ilike('code', `%${search}%`)
    }

    const { data: couponsData, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    // Get category names for coupons with category_id
    const coupons: AdminCoupon[] = []
    if (couponsData) {
      for (const coupon of couponsData) {
        let categoryName = undefined
        if (coupon.category_id) {
          const { data: categoryData } = await supabase
            .from('categories')
            .select('name')
            .eq('id', coupon.category_id)
            .single()
          
          if (categoryData) {
            categoryName = { name: categoryData.name }
          }
        }

        coupons.push({
          ...coupon,
          type: coupon.type as 'percentage' | 'fixed',
          category: categoryName
        })
      }
    }

    return {
      coupons,
      total: count || 0
    }
  } catch (error) {
    console.error('Error fetching admin coupons:', error)
    return { coupons: [], total: 0 }
  }
}

export async function createCoupon(couponData: {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  min_purchase?: number
  max_discount?: number
  category_id?: string
  usage_limit?: number
  start_date: string
  end_date: string
  is_active?: boolean
}): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('coupons')
      .insert([couponData])

    return !error
  } catch (error) {
    console.error('Error creating coupon:', error)
    return false
  }
}

export async function updateCoupon(
  couponId: string,
  couponData: Partial<AdminCoupon>
): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('coupons')
      .update(couponData)
      .eq('id', couponId)

    return !error
  } catch (error) {
    console.error('Error updating coupon:', error)
    return false
  }
}

export async function deleteCoupon(couponId: string): Promise<boolean> {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('id', couponId)

    return !error
  } catch (error) {
    console.error('Error deleting coupon:', error)
    return false
  }
}


// ============================================
// Enhanced Dashboard Functions
// ============================================

import type { 
  LowStockProduct, 
  TopProduct, 
  RevenueComparison,
  OrderStatusCounts,
  EnhancedDashboardStats,
  AdminUser as AdminUserType,
  AdminUserCreate,
  CustomerWithStats
} from './types'

// Get products with low stock
export async function getLowStockProducts(threshold: number = 10): Promise<LowStockProduct[]> {
  const supabase = createClient()
  
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
    const productsWithImages: LowStockProduct[] = []
    
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
    console.error('Error in getLowStockProducts:', error)
    return []
  }
}

// Get top selling products
export async function getTopProducts(
  limit: number = 5, 
  period: '7d' | '30d' | '90d' = '30d'
): Promise<TopProduct[]> {
  const supabase = createClient()
  
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
    const topProducts: TopProduct[] = []
    
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
    console.error('Error in getTopProducts:', error)
    return []
  }
}

// Get revenue comparison for different periods
export async function getRevenueComparison(): Promise<RevenueComparison> {
  const supabase = createClient()
  
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
    console.error('Error in getRevenueComparison:', error)
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

// Get order status counts
export async function getOrderStatusCountsEnhanced(): Promise<OrderStatusCounts> {
  const supabase = createClient()
  
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
    console.error('Error in getOrderStatusCountsEnhanced:', error)
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

// Get enhanced dashboard stats
export async function getEnhancedDashboardStats(): Promise<EnhancedDashboardStats | null> {
  try {
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
      return null
    }
    
    return {
      totalOrders: basicStats.totalOrders,
      totalRevenue: basicStats.totalRevenue,
      totalCustomers: basicStats.totalCustomers,
      totalProducts: basicStats.totalProducts,
      revenueComparison,
      orderStatusCounts,
      lowStockProducts,
      topProducts
    }
  } catch (error) {
    console.error('Error in getEnhancedDashboardStats:', error)
    return null
  }
}


// ============================================
// Admin User Management Functions
// ============================================

// Get all admin users
export async function getAdminUsersList(): Promise<AdminUserType[]> {
  const supabase = createClient()
  
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, user_id, full_name, role, created_at')
      .eq('role', 'admin')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching admin profiles:', error)
      return []
    }
    
    const admins: AdminUserType[] = []
    
    for (const profile of profiles || []) {
      const { data: userData } = await supabase.auth.admin.getUserById(profile.user_id)
      
      admins.push({
        id: profile.id,
        user_id: profile.user_id,
        email: userData.user?.email || 'Unknown',
        full_name: profile.full_name,
        role: profile.role || 'admin',
        created_at: profile.created_at,
        is_active: true // Could be enhanced with actual status tracking
      })
    }
    
    return admins
  } catch (error) {
    console.error('Error in getAdminUsersList:', error)
    return []
  }
}

// Create a new admin user
export async function createAdminUser(data: AdminUserCreate): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  
  try {
    // Create user in auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true
    })
    
    if (authError) {
      return { success: false, error: authError.message }
    }
    
    if (!authData.user) {
      return { success: false, error: 'Failed to create user' }
    }
    
    // Create profile with admin role
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        full_name: data.full_name,
        role: 'admin'
      })
    
    if (profileError) {
      // Rollback: delete the auth user
      await supabase.auth.admin.deleteUser(authData.user.id)
      return { success: false, error: profileError.message }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error in createAdminUser:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Delete an admin user
export async function deleteAdminUser(userId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient()
  
  try {
    // Check if this is the last admin
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'admin')
    
    if (count && count <= 1) {
      return { success: false, error: 'Tidak dapat menghapus admin terakhir' }
    }
    
    // Delete profile first
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', userId)
    
    if (profileError) {
      return { success: false, error: profileError.message }
    }
    
    // Delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)
    
    if (authError) {
      return { success: false, error: authError.message }
    }
    
    return { success: true }
  } catch (error) {
    console.error('Error in deleteAdminUser:', error)
    return { success: false, error: 'An unexpected error occurred' }
  }
}

// Update user role
export async function updateUserRole(userId: string, role: string): Promise<boolean> {
  const supabase = createClient()
  
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('user_id', userId)
    
    return !error
  } catch (error) {
    console.error('Error in updateUserRole:', error)
    return false
  }
}

// Get customers with stats
export async function getCustomersWithStats(
  page: number = 1,
  limit: number = 20,
  search?: string
): Promise<{ customers: CustomerWithStats[]; total: number }> {
  const supabase = createClient()
  const offset = (page - 1) * limit
  
  try {
    let query = supabase
      .from('profiles')
      .select('id, user_id, full_name, phone, created_at', { count: 'exact' })
      .eq('role', 'customer')
    
    if (search) {
      query = query.or(`full_name.ilike.%${search}%`)
    }
    
    const { data: profiles, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    if (error) {
      console.error('Error fetching customer profiles:', error)
      return { customers: [], total: 0 }
    }
    
    const customers: CustomerWithStats[] = []
    
    for (const profile of profiles || []) {
      // Get user email
      const { data: userData } = await supabase.auth.admin.getUserById(profile.user_id)
      
      // Get order stats
      const { count: orderCount } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.user_id)
      
      const { data: ordersData } = await supabase
        .from('orders')
        .select('total')
        .eq('user_id', profile.user_id)
        .in('status', ['paid', 'processing', 'shipped', 'delivered', 'completed'])
      
      const totalSpent = ordersData?.reduce((sum, order) => sum + Number(order.total), 0) || 0
      
      customers.push({
        id: profile.id,
        user_id: profile.user_id,
        email: userData.user?.email || 'Unknown',
        full_name: profile.full_name,
        phone: profile.phone,
        created_at: profile.created_at,
        total_orders: orderCount || 0,
        total_spent: totalSpent
      })
    }
    
    // If search includes email, filter again
    let filteredCustomers = customers
    if (search && search.includes('@')) {
      filteredCustomers = customers.filter(c => 
        c.email.toLowerCase().includes(search.toLowerCase())
      )
    }
    
    return {
      customers: filteredCustomers,
      total: count || 0
    }
  } catch (error) {
    console.error('Error in getCustomersWithStats:', error)
    return { customers: [], total: 0 }
  }
}

// Search users by name or email
export async function searchUsers(query: string, role?: string): Promise<AdminUserType[]> {
  const supabase = createClient()
  
  try {
    let profileQuery = supabase
      .from('profiles')
      .select('id, user_id, full_name, role, created_at')
      .ilike('full_name', `%${query}%`)
    
    if (role) {
      profileQuery = profileQuery.eq('role', role)
    }
    
    const { data: profiles, error } = await profileQuery.limit(20)
    
    if (error) {
      console.error('Error searching users:', error)
      return []
    }
    
    const users: AdminUserType[] = []
    
    for (const profile of profiles || []) {
      const { data: userData } = await supabase.auth.admin.getUserById(profile.user_id)
      
      // Also check if email matches
      const email = userData.user?.email || ''
      if (email.toLowerCase().includes(query.toLowerCase()) || 
          (profile.full_name && profile.full_name.toLowerCase().includes(query.toLowerCase()))) {
        users.push({
          id: profile.id,
          user_id: profile.user_id,
          email,
          full_name: profile.full_name,
          role: profile.role || 'customer',
          created_at: profile.created_at,
          is_active: true
        })
      }
    }
    
    return users
  } catch (error) {
    console.error('Error in searchUsers:', error)
    return []
  }
}
