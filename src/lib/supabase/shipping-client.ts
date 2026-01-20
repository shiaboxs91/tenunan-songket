
import { createClient } from './client'
import type { Database, ShippingService } from './types'

export type { ShippingService }

export async function getActiveShippingServices(): Promise<ShippingService[]> {
  const supabase = createClient()
  
  const { data: providers, error } = await supabase
    .from('shipping_providers')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching shipping providers:', error)
    return []
  }

  // Extract and flatten services from active providers
  const allServices: ShippingService[] = []
  
  if (providers) {
    providers.forEach(provider => {
      if (provider.services && Array.isArray(provider.services)) {
        // cast JSON to specific type
        const services = provider.services as unknown as ShippingService[]
        allServices.push(...services)
      }
    })
  }

  return allServices
}
