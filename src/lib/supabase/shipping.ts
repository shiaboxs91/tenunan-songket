import { createClient } from './client'
import type { ShippingProvider, ShippingService } from './types'
import { ShippingCalculator, stateToRegion, type RegionalPricing } from '@/lib/shipping'

export type Currency = 'USD' | 'MYR' | 'SGD' | 'BND' | 'EUR' | 'GBP' | 'IDR'

export interface ShippingZone {
  id: string
  name: string
  base_rate: number
  per_kg_rate: number
  currency: string
  estimated_days: string | null
  is_active: boolean
  countries?: string[]
}

export interface Country {
  code: string
  name: string
  currency: string
  phone_code: string | null
  is_shipping_enabled: boolean
}

export interface ShippingOption {
  courier: string
  service: string
  cost: number
  currency: Currency
  estimatedDays: string
  includesInsurance: boolean
  trackingAvailable: boolean
}

export interface Dimensions {
  length: number
  width: number
  height: number
}

export interface ShippingAddress {
  recipientName: string
  phone: string
  addressLine1: string
  addressLine2?: string
  city: string
  state: string
  postalCode: string
  country: string
}

// Default shipping zones for when database is empty
const DEFAULT_ZONES: ShippingZone[] = [
  {
    id: 'zone-domestic',
    name: 'Indonesia (Domestic)',
    base_rate: 15000,
    per_kg_rate: 8000,
    currency: 'IDR',
    estimated_days: '2-5 hari',
    is_active: true,
    countries: ['ID']
  },
  {
    id: 'zone-asean',
    name: 'ASEAN',
    base_rate: 150000,
    per_kg_rate: 75000,
    currency: 'IDR',
    estimated_days: '5-10 hari',
    is_active: true,
    countries: ['MY', 'SG', 'BN', 'TH', 'PH', 'VN']
  },
  {
    id: 'zone-asia',
    name: 'Asia Pacific',
    base_rate: 250000,
    per_kg_rate: 100000,
    currency: 'IDR',
    estimated_days: '7-14 hari',
    is_active: true,
    countries: ['JP', 'KR', 'CN', 'HK', 'TW', 'AU', 'NZ']
  },
  {
    id: 'zone-international',
    name: 'International',
    base_rate: 350000,
    per_kg_rate: 150000,
    currency: 'IDR',
    estimated_days: '10-21 hari',
    is_active: true,
    countries: ['US', 'GB', 'DE', 'FR', 'NL', 'IT', 'ES', 'CA']
  }
]

// Default countries
const DEFAULT_COUNTRIES: Country[] = [
  { code: 'ID', name: 'Indonesia', currency: 'IDR', phone_code: '+62', is_shipping_enabled: true },
  { code: 'MY', name: 'Malaysia', currency: 'MYR', phone_code: '+60', is_shipping_enabled: true },
  { code: 'SG', name: 'Singapore', currency: 'SGD', phone_code: '+65', is_shipping_enabled: true },
  { code: 'BN', name: 'Brunei', currency: 'BND', phone_code: '+673', is_shipping_enabled: true },
  { code: 'US', name: 'United States', currency: 'USD', phone_code: '+1', is_shipping_enabled: true },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP', phone_code: '+44', is_shipping_enabled: true },
  { code: 'AU', name: 'Australia', currency: 'AUD', phone_code: '+61', is_shipping_enabled: true },
  { code: 'JP', name: 'Japan', currency: 'JPY', phone_code: '+81', is_shipping_enabled: true },
]

export async function getShippingZones(): Promise<ShippingZone[]> {
  // Use default zones since shipping_zones table may not exist
  // This avoids TypeScript errors while still allowing future database integration
  return DEFAULT_ZONES
}

export async function getCountries(): Promise<Country[]> {
  // Use default countries since countries table may not exist
  // This avoids TypeScript errors while still allowing future database integration
  return DEFAULT_COUNTRIES
}

export async function getShippingZoneByCountry(countryCode: string): Promise<ShippingZone | null> {
  const zones = await getShippingZones()
  
  // Find zone that includes this country
  const zone = zones.find(z => z.countries?.includes(countryCode))
  
  if (zone) return zone
  
  // Return international zone as fallback
  return zones.find(z => z.name === 'International') || zones[zones.length - 1] || null
}

export function calculateVolumetricWeight(dimensions: Dimensions): number {
  // Volumetric weight formula: (L x W x H) / 5000 for international shipping
  const volumetricWeight = (dimensions.length * dimensions.width * dimensions.height) / 5000
  return Math.ceil(volumetricWeight * 10) / 10 // Round up to 1 decimal
}

/**
 * Calculate shipping options with regional pricing support
 * Task 5: Updated to use ShippingCalculator for regional pricing
 * 
 * Requirements: 4.1, 4.2, 4.3, 10.1, 10.2, 10.3
 */
export async function calculateShipping(
  destination: ShippingAddress,
  weight: number,
  dimensions?: Dimensions
): Promise<ShippingOption[]> {
  // Use static import (imported at top of file)
  const calculator = new ShippingCalculator()

  // Try to get active shipping providers from database
  const supabase = createClient()
  const { data: providers } = await supabase
    .from('shipping_providers')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  // Calculate actual weight vs volumetric weight
  let chargeableWeight = weight
  if (dimensions) {
    const volumetricWeight = calculateVolumetricWeight(dimensions)
    chargeableWeight = Math.max(weight, volumetricWeight)
  }

  // Minimum weight 0.5 kg
  chargeableWeight = Math.max(chargeableWeight, 0.5)

  const options: ShippingOption[] = []

  // If we have providers from database, use them with regional pricing
  if (providers && providers.length > 0) {
    // Detect region from destination
    const region = stateToRegion(destination.state || '')
    
    // Convert database providers to ShippingProvider format
    
    const formattedProviders = providers.map(p => {
      const dbServices = (p.services as unknown as Array<{
        id?: string;
        name?: string;
        base_cost?: number;
        estimated_days?: string;
        tracking_available?: boolean;
        includes_insurance?: boolean;
        regional_pricing?: unknown[];
        display_order?: number;
      }>) || []
      
      return {
        id: p.id,
        code: p.code,
        name: p.name,
        logo_url: p.logo_url || undefined,
        is_active: p.is_active ?? true,
        services: dbServices.map((s, idx) => ({
          id: String(s.id || `${p.code}-${idx}`),
          name: String(s.name || 'Standard'),
          base_cost: Number(s.base_cost || 0),
          estimated_days: String(s.estimated_days || '3-5 hari'),
          tracking_available: Boolean(s.tracking_available ?? true),
          includes_insurance: Boolean(s.includes_insurance ?? false),
          regional_pricing: s.regional_pricing as import('@/lib/shipping').RegionalPricing[] | undefined,
          display_order: Number(s.display_order ?? idx),
        })),
        display_order: p.display_order ?? 0,
      }
    })

    // Calculate shipping with regional pricing
    const results = calculator.calculateShipping(
      {
        destination: {
          state: destination.state,
          country: destination.country,
          postalCode: destination.postalCode,
          city: destination.city,
        },
        weight: chargeableWeight,
        dimensions,
        region: region !== 'unknown' ? region : undefined,
      },
      formattedProviders as import('@/lib/shipping').ShippingProvider[]
    )

    // Convert to ShippingOption format
    for (const result of results) {
      options.push({
        courier: result.providerCode,
        service: `${result.providerName} - ${result.serviceName}`,
        cost: result.cost,
        currency: result.currency as Currency,
        estimatedDays: result.estimatedDays,
        includesInsurance: result.includesInsurance,
        trackingAvailable: result.trackingAvailable,
      })
    }
    
    return options
  }

  // Fallback to zone-based calculation if no providers in database
  const zone = await getShippingZoneByCountry(destination.country)
  
  if (!zone) {
    return []
  }

  const baseCost = zone.base_rate + (zone.per_kg_rate * chargeableWeight)

  // Standard shipping
  options.push({
    courier: 'standard',
    service: 'Standard Shipping',
    cost: Math.round(baseCost),
    currency: (zone.currency || 'IDR') as Currency,
    estimatedDays: zone.estimated_days || '7-14 hari',
    includesInsurance: false,
    trackingAvailable: true
  })

  // Express shipping (1.5x cost, faster delivery)
  if (destination.country === 'ID') {
    options.push({
      courier: 'express',
      service: 'Express Shipping',
      cost: Math.round(baseCost * 1.5),
      currency: (zone.currency || 'IDR') as Currency,
      estimatedDays: '1-3 hari',
      includesInsurance: false,
      trackingAvailable: true
    })
  } else {
    options.push({
      courier: 'express',
      service: 'Express International',
      cost: Math.round(baseCost * 2),
      currency: (zone.currency || 'IDR') as Currency,
      estimatedDays: '3-7 hari',
      includesInsurance: true,
      trackingAvailable: true
    })
  }

  return options
}

export function calculateInsurance(itemValue: number): number {
  // Insurance is 1% of item value, minimum 10,000 IDR
  return Math.max(Math.round(itemValue * 0.01), 10000)
}

export function formatShippingCost(cost: number, currency: Currency = 'IDR'): string {
  if (currency === 'IDR') {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(cost)
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(cost)
}

// Get tracking info (placeholder - would integrate with actual courier APIs)
export async function getTrackingInfo(trackingNumber: string, courier: string): Promise<{
  status: string
  lastUpdate: string
  history: Array<{ date: string; status: string; location: string }>
} | null> {
  // This would integrate with actual courier APIs (DHL, FedEx, etc.)
  // For now, return mock data
  return {
    status: 'In Transit',
    lastUpdate: new Date().toISOString(),
    history: [
      {
        date: new Date().toISOString(),
        status: 'Package picked up',
        location: 'Jakarta, Indonesia'
      }
    ]
  }
}
