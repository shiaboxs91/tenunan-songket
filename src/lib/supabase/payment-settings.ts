import { createClient } from './server'
import type { 
  PaymentMethod, 
  PaymentMethodCreate, 
  PaymentMethodUpdate,
  PaymentMethodPublic,
  StripeConfig,
  Json
} from './types'

// Get all payment methods (admin - includes secret keys)
export async function getPaymentMethods(): Promise<PaymentMethod[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .order('display_order', { ascending: true })
  
  if (error) {
    console.error('Error fetching payment methods:', error)
    return []
  }
  
  return data as PaymentMethod[]
}

// Get active payment methods for checkout (without secret keys)
export async function getActivePaymentMethods(): Promise<PaymentMethodPublic[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
  
  if (error) {
    console.error('Error fetching active payment methods:', error)
    return []
  }
  
  // Remove secret keys from Stripe config
  return (data as PaymentMethod[]).map(method => {
    if (method.type === 'stripe' && method.config) {
      const stripeConfig = method.config as StripeConfig
      return {
        ...method,
        config: {
          publishable_key: stripeConfig.publishable_key
        }
      } as PaymentMethodPublic
    }
    return method as PaymentMethodPublic
  })
}

// Get a single payment method by ID
export async function getPaymentMethod(id: string): Promise<PaymentMethod | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching payment method:', error)
    return null
  }
  
  return data as PaymentMethod
}


// Create a new payment method
export async function createPaymentMethod(
  method: PaymentMethodCreate
): Promise<PaymentMethod | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('payment_methods')
    .insert({
      name: method.name,
      code: method.code,
      type: method.type,
      config: method.config as unknown as Json || {},
      instructions: method.instructions || null,
      is_active: method.is_active ?? true,
      display_order: method.display_order ?? 0
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating payment method:', error)
    return null
  }
  
  return data as PaymentMethod
}

// Update a payment method
export async function updatePaymentMethod(
  id: string,
  updates: PaymentMethodUpdate
): Promise<PaymentMethod | null> {
  const supabase = await createClient()
  
  // Convert config to Json type for database compatibility
  const dbUpdates = {
    ...updates,
    config: updates.config ? (updates.config as unknown as Json) : undefined
  }
  
  const { data, error } = await supabase
    .from('payment_methods')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating payment method:', error)
    return null
  }
  
  return data as PaymentMethod
}

// Delete a payment method
export async function deletePaymentMethod(id: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('payment_methods')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting payment method:', error)
    return false
  }
  
  return true
}

// Toggle payment method active status
export async function togglePaymentMethodStatus(
  id: string,
  isActive: boolean
): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('payment_methods')
    .update({ is_active: isActive })
    .eq('id', id)
  
  if (error) {
    console.error('Error toggling payment method status:', error)
    return false
  }
  
  return true
}

// Validate Stripe API key (basic check)
export async function validateStripeKey(secretKey: string): Promise<boolean> {
  // Basic format validation
  if (!secretKey.startsWith('sk_')) {
    return false
  }
  
  // In production, you would make a test API call to Stripe
  // For now, just check the format
  return secretKey.length > 20
}
