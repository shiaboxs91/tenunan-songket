import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createStripeCheckout, createPaymentRecord } from '@/lib/supabase/payments'
import type { Currency } from '@/lib/supabase/payments'

export async function POST(request: NextRequest) {
  try {
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

    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId } = body

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 })
    }

    // Get order details
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, items:order_items(*)')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Check if order is already paid
    if (order.status !== 'pending') {
      return NextResponse.json({ error: 'Order is not pending payment' }, { status: 400 })
    }

    // Get base URL
    const baseUrl = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Create Stripe checkout session
    const checkoutItems = order.items.map((item: { product_title: string; price: number; quantity: number; product_image?: string }) => ({
      name: item.product_title,
      price: Number(item.price),
      quantity: item.quantity,
      image: item.product_image || undefined,
    }))

    // Add shipping as a line item if applicable
    if (order.shipping_cost > 0) {
      checkoutItems.push({
        name: 'Shipping',
        price: Number(order.shipping_cost),
        quantity: 1,
      })
    }

    const session = await createStripeCheckout({
      orderId: order.id,
      orderNumber: order.order_number,
      items: checkoutItems,
      currency: (order.currency || 'USD') as Currency,
      customerEmail: user.email,
      successUrl: `${baseUrl}/checkout/success`,
      cancelUrl: `${baseUrl}/checkout/cancel?order=${order.order_number}`,
    })

    if (!session) {
      return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
    }

    // Create or update payment record
    await createPaymentRecord(
      order.id,
      'stripe_card',
      Number(order.total),
      (order.currency || 'USD') as Currency
    )

    // Update payment with checkout session ID
    await supabase
      .from('payments')
      .update({ gateway_checkout_id: session.sessionId })
      .eq('order_id', order.id)

    return NextResponse.json({
      sessionId: session.sessionId,
      url: session.url,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
