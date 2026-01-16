import { createClient } from './client'

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
 * Validate a coupon code for a user's cart (Client-side version)
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
      p_category_id: categoryId || undefined
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
    console.error('Unexpected error validating coupon:', error)
    return {
      isValid: false,
      errorMessage: 'Terjadi kesalahan yang tidak terduga'
    }
  }
}
