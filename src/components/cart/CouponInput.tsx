'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tag, X, Loader2 } from 'lucide-react'
import { validateCoupon, type CouponValidationResult } from '@/lib/supabase/coupons-client'

interface CouponInputProps {
  subtotal: number
  userId: string | null
  onCouponApplied: (couponId: string, discountAmount: number, code: string) => void
  onCouponRemoved: () => void
  appliedCoupon?: {
    code: string
    discountAmount: number
  }
}

export function CouponInput({
  subtotal,
  userId,
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon
}: CouponInputProps) {
  const [couponCode, setCouponCode] = useState('')
  const [isValidating, setIsValidating] = useState(false)
  const [error, setError] = useState('')

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError('Masukkan kode kupon')
      return
    }

    if (!userId) {
      setError('Silakan login terlebih dahulu')
      return
    }

    setIsValidating(true)
    setError('')

    try {
      const result = await validateCoupon(couponCode, subtotal, userId)

      if (result.isValid && result.couponId && result.discountAmount) {
        onCouponApplied(result.couponId, result.discountAmount, couponCode.toUpperCase())
        setCouponCode('')
      } else {
        setError(result.errorMessage || 'Kupon tidak valid')
      }
    } catch (err) {
      setError('Terjadi kesalahan saat memvalidasi kupon')
    } finally {
      setIsValidating(false)
    }
  }

  const handleRemoveCoupon = () => {
    onCouponRemoved()
    setCouponCode('')
    setError('')
  }

  if (appliedCoupon) {
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm font-medium text-green-900">
                Kupon diterapkan: {appliedCoupon.code}
              </p>
              <p className="text-xs text-green-700">
                Hemat {new Intl.NumberFormat('id-ID', {
                  style: 'currency',
                  currency: 'IDR'
                }).format(appliedCoupon.discountAmount)}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveCoupon}
            className="text-green-700 hover:text-green-900"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Masukkan kode kupon"
          value={couponCode}
          onChange={(e) => {
            setCouponCode(e.target.value.toUpperCase())
            setError('')
          }}
          onKeyPress={(e) => e.key === 'Enter' && handleApplyCoupon()}
          disabled={isValidating}
          className="flex-1"
        />
        <Button
          onClick={handleApplyCoupon}
          disabled={isValidating || !couponCode.trim()}
          variant="outline"
        >
          {isValidating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Terapkan'
          )}
        </Button>
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
