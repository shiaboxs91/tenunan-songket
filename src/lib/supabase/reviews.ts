import { createClient } from './client'
import type { Tables, PaginatedResponse } from './types'

export type Review = Tables<'reviews'> & {
  profile?: Tables<'profiles'>
}

export interface CreateReviewInput {
  productId: string
  orderId?: string
  rating: number
  reviewText?: string
  images?: string[]
}

export async function getProductReviews(
  productId: string,
  page = 1,
  limit = 10
): Promise<PaginatedResponse<Review>> {
  const supabase = createClient()

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await supabase
    .from('reviews')
    .select(`
      *,
      profile:profiles(full_name, avatar_url)
    `, { count: 'exact' })
    .eq('product_id', productId)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching reviews:', error)
    return { data: [], total: 0, page, limit, totalPages: 0 }
  }

  return {
    data: (data || []) as unknown as Review[],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

export async function createReview(input: CreateReviewInput): Promise<Review | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Check if user has already reviewed this product
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('product_id', input.productId)
    .eq('user_id', user.id)
    .single()

  if (existingReview) {
    console.error('User has already reviewed this product')
    return null
  }

  // If orderId provided, verify user has purchased this product
  if (input.orderId) {
    const { data: orderItem } = await supabase
      .from('order_items')
      .select('id, order:orders!inner(user_id, status)')
      .eq('order_id', input.orderId)
      .eq('product_id', input.productId)
      .single()

    if (!orderItem) {
      console.error('Order item not found')
      return null
    }
  }

  const { data, error } = await supabase
    .from('reviews')
    .insert({
      product_id: input.productId,
      user_id: user.id,
      order_id: input.orderId,
      rating: input.rating,
      review_text: input.reviewText,
      images: input.images || [],
      is_published: true,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating review:', error)
    return null
  }

  return data
}

export async function getUserReviews(
  page = 1,
  limit = 10
): Promise<PaginatedResponse<Review & { product?: Tables<'products'> }>> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { data: [], total: 0, page, limit, totalPages: 0 }
  }

  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error, count } = await supabase
    .from('reviews')
    .select(`
      *,
      product:products(id, title, slug)
    `, { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching user reviews:', error)
    return { data: [], total: 0, page, limit, totalPages: 0 }
  }

  return {
    data: (data || []) as unknown as (Review & { product?: Tables<'products'> })[],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

export async function canReviewProduct(productId: string): Promise<boolean> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false

  // Check if already reviewed
  const { data: existingReview } = await supabase
    .from('reviews')
    .select('id')
    .eq('product_id', productId)
    .eq('user_id', user.id)
    .single()

  if (existingReview) return false

  // Check if user has a delivered/completed order containing this product
  const { data: orderItems } = await (supabase as any)
    .from('order_items')
    .select('id, order_id')
    .eq('product_id', productId)

  if (!orderItems || orderItems.length === 0) return false

  // Check if any of those orders belong to user and are delivered/completed
  const orderIds = orderItems.map((oi: any) => oi.order_id)
  const { data: qualifyingOrders } = await supabase
    .from('orders')
    .select('id')
    .eq('user_id', user.id)
    .in('status', ['delivered', 'completed'])
    .in('id', orderIds)
    .limit(1)

  return !!qualifyingOrders && qualifyingOrders.length > 0
}

export async function toggleReviewHelpful(reviewId: string): Promise<{ voted: boolean; count: number } | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Check if user already voted
  const { data: existingVote } = await (supabase as any)
    .from('review_helpful_votes')
    .select('id')
    .eq('review_id', reviewId)
    .eq('user_id', user.id)
    .single()

  if (existingVote) {
    // Remove vote
    await (supabase as any)
      .from('review_helpful_votes')
      .delete()
      .eq('review_id', reviewId)
      .eq('user_id', user.id)

    // Get updated count (trigger handles sync, but fetch fresh)
    const { data: review } = await supabase
      .from('reviews')
      .select('helpful_count')
      .eq('id', reviewId)
      .single()

    return { voted: false, count: review?.helpful_count || 0 }
  } else {
    // Add vote
    await (supabase as any)
      .from('review_helpful_votes')
      .insert({ review_id: reviewId, user_id: user.id })

    const { data: review } = await supabase
      .from('reviews')
      .select('helpful_count')
      .eq('id', reviewId)
      .single()

    return { voted: true, count: review?.helpful_count || 0 }
  }
}

export async function hasUserVotedHelpful(reviewId: string): Promise<boolean> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false

  const { data } = await (supabase as any)
    .from('review_helpful_votes')
    .select('id')
    .eq('review_id', reviewId)
    .eq('user_id', user.id)
    .single()

  return !!data
}

export async function getReviewableOrders(): Promise<Array<{
  orderId: string
  orderNumber: string
  items: Array<{
    productId: string
    productTitle: string
    productImage: string | null
    hasReview: boolean
  }>
}>> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  // Get delivered/completed orders for this user
  const { data: orders } = await supabase
    .from('orders')
    .select('id, order_number')
    .eq('user_id', user.id)
    .in('status', ['delivered', 'completed'])
    .order('created_at', { ascending: false })

  if (!orders || orders.length === 0) return []

  const orderIds = orders.map(o => o.id)

  // Get order items
  const { data: items } = await supabase
    .from('order_items')
    .select('order_id, product_id, product_title, product_image')
    .in('order_id', orderIds)

  if (!items || items.length === 0) return []

  // Get existing reviews for these products by this user
  const productIds = Array.from(new Set<string>(items.map(i => i.product_id)))
  const { data: existingReviews } = await supabase
    .from('reviews')
    .select('product_id')
    .eq('user_id', user.id)
    .in('product_id', productIds)

  const reviewedProductIds = new Set((existingReviews || []).map(r => r.product_id))

  // Build result
  const result = orders
    .map(order => {
      const orderItems = items.filter(i => i.order_id === order.id)
      return {
        orderId: order.id,
        orderNumber: order.order_number || order.id,
        items: orderItems.map(item => ({
          productId: item.product_id,
          productTitle: item.product_title,
          productImage: item.product_image,
          hasReview: reviewedProductIds.has(item.product_id),
        })),
      }
    })
    .filter(order => order.items.some(item => !item.hasReview))

  return result
}

export async function uploadReviewImage(file: File): Promise<string | null> {
  const { uploadFile } = await import('./storage')
  
  const timestamp = Date.now()
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${timestamp}-${Math.random().toString(36).slice(2, 8)}.${ext}`

  const result = await uploadFile({
    bucket: 'reviews',
    path,
    file,
  })

  return result.success ? (result.url || null) : null
}

export function getRatingDistribution(reviews: Review[]): Record<number, number> {
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  
  reviews.forEach(review => {
    if (review.rating >= 1 && review.rating <= 5) {
      distribution[review.rating]++
    }
  })

  return distribution
}

// Admin functions
export async function getAllReviews(
  page = 1,
  limit = 20,
  filter: 'all' | 'published' | 'pending' = 'all'
): Promise<PaginatedResponse<Review & { product?: any }>> {
  const supabase = createClient()

  const from = (page - 1) * limit
  const to = from + limit - 1

  let query = supabase
    .from('reviews')
    .select(`
      *,
      profile:profiles(full_name, avatar_url),
      product:products(id, title, slug)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (filter === 'published') {
    query = query.eq('is_published', true)
  } else if (filter === 'pending') {
    query = query.eq('is_published', false)
  }

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching all reviews:', error)
    return { data: [], total: 0, page, limit, totalPages: 0 }
  }

  return {
    data: (data || []) as unknown as (Review & { product?: any })[],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  }
}

export async function updateReviewStatus(reviewId: string, isPublished: boolean): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('reviews')
    .update({ is_published: isPublished, updated_at: new Date().toISOString() })
    .eq('id', reviewId)

  if (error) {
    console.error('Error updating review status:', error)
    return false
  }

  return true
}

export async function deleteReview(reviewId: string): Promise<boolean> {
  const supabase = createClient()

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId)

  if (error) {
    console.error('Error deleting review:', error)
    return false
  }

  return true
}
