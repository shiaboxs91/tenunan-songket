import { NextRequest, NextResponse } from 'next/server'
import { verifyStripeSession, updatePaymentStatus } from '@/lib/supabase/payments'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ success: false, error: 'No session ID' }, { status: 400 })
  }

  try {
    const result = await verifyStripeSession(sessionId)

    if (result.success && result.orderId) {
      // Update payment status if not already updated by webhook
      const cookieStore = await cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options)
              })
            },
          },
        }
      )

      // Check current payment status
      const { data: payment } = await supabase
        .from('payments')
        .select('status')
        .eq('order_id', result.orderId)
        .single()

      // Only update if not already paid (webhook might have already processed)
      if (payment && payment.status !== 'paid') {
        await updatePaymentStatus(result.orderId, 'paid', result.paymentIntentId)
        
        await supabase
          .from('orders')
          .update({ status: 'paid', paid_at: new Date().toISOString() })
          .eq('id', result.orderId)
      }

      return NextResponse.json({ success: true, orderId: result.orderId })
    }

    return NextResponse.json({ success: false })
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 500 })
  }
}
