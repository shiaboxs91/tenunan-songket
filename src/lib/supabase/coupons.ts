import { createClient } from './server'

export interface CouponValidationResult {
  isValid: boolean
  couponId?: string
  discountAmount?: number
  errorMessage?: string
}

export interface AppliedCoupon {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  discountAmount: number
}

/**
 * Validate a coupon code for a user's cart
 * Uses the database function validate_coupon for validation logic
 */
export async function validateCoupon(
  code: string,
  subtotal: number,
  userId: string,
  categoryId?: string
): Promise<CouponValidationResult> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.rpc('validate_coupon', {
      p_code: code.toUpperCase(),
      p_subtotal: subtotal,
      p_user_id: userId,
      p_category_id: categoryId || null
    })

    if (error) {
      console.error('Error validating coupon:', error)
      return {
        isValid: false,
        errorMessage: 'Terjadi kesalahan saat memvalidasi kupon'
      }
    }

    if (!data || data.length === 0) {
      return {
        isValid: false,
        errorMessage: 'Kupon tidak ditemukan'
      }
    }

    const result = data[0]

    if (!result.is_valid) {
      return {
        isValid: false,
        errorMessage: result.error_message || 'Kupon tidak valid'
      }
    }

    return {
      isValid: true,
      couponId: result.coupon_id,
      discountAmount: result.discount_amount
    }
  } catch (error) {
    console.error('Error validating coupon:', error)
    return {
      isValid: false,
      errorMessage: 'Terjadi kesalahan saat memvalidasi kupon'
    }
  }
}

/**
 * Get coupon details by code
 */
export async function getCouponByCode(code: string): Promise<AppliedCoupon | null> {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('id, code, type, value')
      .eq('code', code.toUpperCase())
      .eq('is_active', true)
      .single()

    if (error || !data) {
      return null
    }

    return {
      id: data.id,
      code: data.code,
      type: data.type as 'percentage' | 'fixed',
      value: data.value,
      discountAmount: 0 // Will be calculated when applied
    }
  } catch (error) {
    console.error('Error getting coupon:', error)
    return null
  }
}

/**
 * Calculate discount amount based on coupon type
 */
export function calculateDiscount(
  coupon: { type: 'percentage' | 'fixed'; value: number; max_discount?: number | null },
  subtotal: number
): number {
  if (coupon.type === 'fixed') {
    return Math.min(coupon.value, subtotal)
  }

  // Percentage discount
  let discount = (subtotal * coupon.value) / 100

  // Apply max discount limit if set
  if (coupon.max_discount && discount > coupon.max_discount) {
    discount = coupon.max_discount
  }

  return Math.min(discount, subtotal)
}

/**
 * Record coupon usage
 */
export async function recordCouponUsage(
  couponId: string,
  userId: string,
  orderId: string
): Promise<boolean> {
  const supabase = createClient()

  try {
    // Insert coupon usage record
    const { error: usageError } = await supabase
      .from('coupon_usages')
      .insert({
        coupon_id: couponId,
        user_id: userId,
        order_id: orderId
      })

    if (usageError) {
      console.error('Error recording coupon usage:', usageError)
      return false
    }

    // Get current used_count and increment
    const { data: couponData } = await supabase
      .from('coupons')
      .select('used_count')
      .eq('id', couponId)
      .single()

    const currentCount = couponData?.used_count || 0

    const { error: updateError } = await supabase
      .from('coupons')
      .update({ used_count: currentCount + 1 })
      .eq('id', couponId)

    if (updateError) {
      console.error('Error incrementing coupon usage:', updateError)
    }

    return true
  } catch (error) {
    console.error('Error recording coupon usage:', error)
    return false
  }
}

/**
 * Check if user has already used a coupon
 */
export async function hasUserUsedCoupon(
  couponId: string,
  userId: string
): Promise<boolean> {
  const supabase = createClient()

  try {
    const { count, error } = await supabase
      .from('coupon_usages')
      .select('*', { count: 'exact', head: true })
      .eq('coupon_id', couponId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error checking coupon usage:', error)
      return false
    }

    return (count || 0) > 0
  } catch (error) {
    console.error('Error checking coupon usage:', error)
    return false
  }
}
