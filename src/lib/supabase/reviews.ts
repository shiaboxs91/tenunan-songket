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
      is_published: true, // Auto-publish for now
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

  // Check if user has purchased this product
  const { data: orderItem } = await supabase
    .from('order_items')
    .select('id, order:orders!inner(user_id, status)')
    .eq('product_id', productId)
    .eq('orders.user_id', user.id)
    .in('orders.status', ['delivered', 'completed'])
    .limit(1)

  return !!orderItem
}

export async function markReviewHelpful(reviewId: string): Promise<boolean> {
  const supabase = createClient()

  // Direct update since RPC function doesn't exist
  const { data: review } = await supabase
    .from('reviews')
    .select('helpful_count')
    .eq('id', reviewId)
    .single()

  if (review) {
    const { error } = await supabase
      .from('reviews')
      .update({ helpful_count: (review.helpful_count || 0) + 1 })
      .eq('id', reviewId)
    
    if (error) {
      console.error('Error marking review helpful:', error)
      return false
    }
  }

  return true
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
