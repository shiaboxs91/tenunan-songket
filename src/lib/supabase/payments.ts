import Stripe from 'stripe'
import { createClient } from './client'
import type { Tables } from './types'

export type Payment = Tables<'payments'>
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'expired' | 'refunded'
export type PaymentMethod = 'stripe_card' | 'stripe_alipay' | 'paypal' | 'bank_transfer'
export type Currency = 'USD' | 'MYR' | 'SGD' | 'BND' | 'EUR' | 'GBP' | 'IDR'

// Server-side Stripe instance (only use in API routes)
export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(secretKey, {
    apiVersion: '2024-12-18.acacia',
  })
}

export interface CreateCheckoutInput {
  orderId: string
  orderNumber: string
  items: Array<{
    name: string
    price: number
    quantity: number
    image?: string
  }>
  currency: Currency
  customerEmail?: string
  successUrl: string
  cancelUrl: string
}

export interface CheckoutSession {
  sessionId: string
  url: string
}

export async function createStripeCheckout(input: CreateCheckoutInput): Promise<CheckoutSession | null> {
  try {
    const stripe = getStripe()
    
    // Convert items to Stripe line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = input.items.map(item => ({
      price_data: {
        currency: input.currency.toLowerCase(),
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : undefined,
        },
        unit_amount: Math.round(item.price * 100), // Stripe uses cents
      },
      quantity: item.quantity,
    }))

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${input.successUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: input.cancelUrl,
      customer_email: input.customerEmail,
      metadata: {
        order_id: input.orderId,
        order_number: input.orderNumber,
      },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
    })

    return {
      sessionId: session.id,
      url: session.url || '',
    }
  } catch (error) {
    console.error('Error creating Stripe checkout:', error)
    return null
  }
}

export async function getPaymentByOrderId(orderId: string): Promise<Payment | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('order_id', orderId)
    .single()

  if (error) {
    console.error('Error fetching payment:', error)
    return null
  }

  return data
}

export async function createPaymentRecord(
  orderId: string,
  method: PaymentMethod,
  amount: number,
  currency: Currency
): Promise<Payment | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('payments')
    .insert({
      order_id: orderId,
      method,
      gateway: 'stripe',
      amount,
      currency,
      status: 'pending',
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating payment record:', error)
    return null
  }

  return data
}

export async function updatePaymentStatus(
  orderId: string,
  status: PaymentStatus,
  transactionId?: string,
  gatewayResponse?: Record<string, unknown>
): Promise<boolean> {
  const supabase = createClient()
  
  const updateData: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (transactionId) {
    updateData.gateway_transaction_id = transactionId
  }

  if (gatewayResponse) {
    updateData.gateway_response = gatewayResponse
  }

  if (status === 'paid') {
    updateData.paid_at = new Date().toISOString()
  }

  const { error } = await supabase
    .from('payments')
    .update(updateData)
    .eq('order_id', orderId)

  if (error) {
    console.error('Error updating payment status:', error)
    return false
  }

  return true
}

export async function verifyStripeSession(sessionId: string): Promise<{
  success: boolean
  orderId?: string
  paymentIntentId?: string
}> {
  try {
    const stripe = getStripe()
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status === 'paid') {
      return {
        success: true,
        orderId: session.metadata?.order_id,
        paymentIntentId: session.payment_intent as string,
      }
    }

    return { success: false }
  } catch (error) {
    console.error('Error verifying Stripe session:', error)
    return { success: false }
  }
}

export async function processRefund(
  paymentId: string,
  amount?: number,
  reason?: string
): Promise<boolean> {
  const supabase = createClient()
  
  // Get payment record
  const { data: payment } = await supabase
    .from('payments')
    .select('*')
    .eq('id', paymentId)
    .single()

  if (!payment || !payment.gateway_transaction_id) {
    console.error('Payment not found or no transaction ID')
    return false
  }

  try {
    const stripe = getStripe()
    
    const refundParams: Stripe.RefundCreateParams = {
      payment_intent: payment.gateway_payment_intent_id || undefined,
    }

    if (amount) {
      refundParams.amount = Math.round(amount * 100)
    }

    if (reason) {
      refundParams.reason = 'requested_by_customer'
    }

    const refund = await stripe.refunds.create(refundParams)

    // Update payment record
    const refundAmount = amount || Number(payment.amount)
    const newStatus = refundAmount >= Number(payment.amount) ? 'refunded' : 'partially_refunded'

    await supabase
      .from('payments')
      .update({
        status: newStatus,
        refund_amount: refundAmount,
        refund_reason: reason,
        refunded_at: new Date().toISOString(),
        gateway_response: { ...payment.gateway_response, refund },
      })
      .eq('id', paymentId)

    return true
  } catch (error) {
    console.error('Error processing refund:', error)
    return false
  }
}

// Client-side Stripe loader
export function getStripePublishableKey(): string {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
}
