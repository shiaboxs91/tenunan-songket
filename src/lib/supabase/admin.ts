import { createClient } from './client'

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
    const updateData: any = { status }
    // Note: tracking_number column doesn't exist yet in database
    // Will be added in future migration

    const { error } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)

    return !error
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