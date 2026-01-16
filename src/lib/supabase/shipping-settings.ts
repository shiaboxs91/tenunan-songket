import { createClient } from './server'
import type { 
  ShippingProvider, 
  ShippingProviderCreate, 
  ShippingProviderUpdate,
  ShippingService,
  Json
} from './types'

// Helper function to transform database data to ShippingProvider type
function transformShippingProvider(data: any): ShippingProvider {
  return {
    ...data,
    services: (data.services as unknown as ShippingService[]) || [],
    is_active: data.is_active ?? true,
    display_order: data.display_order ?? 0
  }
}

// Get all shipping providers (admin)
export async function getShippingProviders(): Promise<ShippingProvider[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('shipping_providers')
    .select('*')
    .order('display_order', { ascending: true })
  
  if (error) {
    console.error('Error fetching shipping providers:', error)
    return []
  }
  
  return (data || []).map(transformShippingProvider)
}

// Get active shipping providers (for checkout)
export async function getActiveShippingProviders(): Promise<ShippingProvider[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('shipping_providers')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
  
  if (error) {
    console.error('Error fetching active shipping providers:', error)
    return []
  }
  
  return (data || []).map(transformShippingProvider)
}

// Get a single shipping provider by ID
export async function getShippingProvider(id: string): Promise<ShippingProvider | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('shipping_providers')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching shipping provider:', error)
    return null
  }
  
  return data ? transformShippingProvider(data) : null
}


// Create a new shipping provider
export async function createShippingProvider(
  provider: ShippingProviderCreate
): Promise<ShippingProvider | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('shipping_providers')
    .insert({
      name: provider.name,
      code: provider.code,
      logo_url: provider.logo_url || null,
      services: (provider.services || []) as unknown as Json,
      is_active: provider.is_active ?? true,
      display_order: provider.display_order ?? 0
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating shipping provider:', error)
    return null
  }
  
  return data ? transformShippingProvider(data) : null
}

// Update a shipping provider
export async function updateShippingProvider(
  id: string,
  updates: ShippingProviderUpdate
): Promise<ShippingProvider | null> {
  const supabase = await createClient()
  
  // Convert services to Json type for database compatibility
  const dbUpdates = {
    ...updates,
    services: updates.services ? (updates.services as unknown as Json) : undefined
  }
  
  const { data, error } = await supabase
    .from('shipping_providers')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating shipping provider:', error)
    return null
  }
  
  return data ? transformShippingProvider(data) : null
}

// Delete a shipping provider
export async function deleteShippingProvider(id: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('shipping_providers')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting shipping provider:', error)
    return false
  }
  
  return true
}

// Toggle shipping provider active status
export async function toggleShippingProviderStatus(
  id: string,
  isActive: boolean
): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('shipping_providers')
    .update({ is_active: isActive })
    .eq('id', id)
  
  if (error) {
    console.error('Error toggling shipping provider status:', error)
    return false
  }
  
  return true
}
