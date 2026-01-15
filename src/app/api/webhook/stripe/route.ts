import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

// Use service role for webhook (no user context)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutCompleted(session)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentFailed(paymentIntent)
        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge
        await handleRefund(charge)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const orderId = session.metadata?.order_id
  if (!orderId) {
    console.error('No order_id in session metadata')
    return
  }

  // Update payment status
  await supabase
    .from('payments')
    .update({
      status: 'paid',
      gateway_transaction_id: session.payment_intent as string,
      gateway_payment_intent_id: session.payment_intent as string,
      paid_at: new Date().toISOString(),
      gateway_response: session,
    })
    .eq('order_id', orderId)

  // Update order status
  await supabase
    .from('orders')
    .update({
      status: 'paid',
      paid_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  // Get order details for notification
  const { data: order } = await supabase
    .from('orders')
    .select('user_id, order_number')
    .eq('id', orderId)
    .single()

  if (order) {
    // Create notification for user
    await supabase
      .from('notifications')
      .insert({
        user_id: order.user_id,
        type: 'order_paid',
        title: 'Pembayaran Berhasil',
        message: `Pembayaran untuk pesanan ${order.order_number} telah berhasil. Pesanan Anda sedang diproses.`,
        data: { order_id: orderId, order_number: order.order_number },
      })
  }

  console.log(`Order ${orderId} marked as paid`)
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const orderId = paymentIntent.metadata?.order_id
  if (!orderId) {
    console.error('No order_id in payment intent metadata')
    return
  }

  // Update payment status
  await supabase
    .from('payments')
    .update({
      status: 'failed',
      gateway_response: paymentIntent,
    })
    .eq('order_id', orderId)

  // Get order details for notification
  const { data: order } = await supabase
    .from('orders')
    .select('user_id, order_number')
    .eq('id', orderId)
    .single()

  if (order) {
    // Create notification for user
    await supabase
      .from('notifications')
      .insert({
        user_id: order.user_id,
        type: 'payment_failed',
        title: 'Pembayaran Gagal',
        message: `Pembayaran untuk pesanan ${order.order_number} gagal. Silakan coba lagi.`,
        data: { order_id: orderId, order_number: order.order_number },
      })
  }

  console.log(`Payment failed for order ${orderId}`)
}

async function handleRefund(charge: Stripe.Charge) {
  // Find payment by transaction ID
  const { data: payment } = await supabase
    .from('payments')
    .select('order_id')
    .eq('gateway_transaction_id', charge.payment_intent)
    .single()

  if (!payment) {
    console.error('Payment not found for refund')
    return
  }

  const refundAmount = charge.amount_refunded / 100
  const isFullRefund = charge.refunded

  await supabase
    .from('payments')
    .update({
      status: isFullRefund ? 'refunded' : 'partially_refunded',
      refund_amount: refundAmount,
      refunded_at: new Date().toISOString(),
    })
    .eq('order_id', payment.order_id)

  if (isFullRefund) {
    await supabase
      .from('orders')
      .update({ status: 'refunded' })
      .eq('id', payment.order_id)
  }

  console.log(`Refund processed for order ${payment.order_id}`)
}
