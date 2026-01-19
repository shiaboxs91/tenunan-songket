import { createClient } from './client'
import type { Tables } from './types'
import {
  sanitizeText,
  sanitizePhone,
  sanitizePostalCode,
  sanitizeAddress,
  trimWhitespace,
} from '@/lib/validation/sanitization'

export type Address = Tables<'addresses'>

export interface AddressInput {
  label?: string
  recipient_name: string
  phone: string
  address_line1: string
  address_line2?: string
  city: string
  state: string
  postal_code: string
  country?: string
  is_default?: boolean
}

export async function getAddresses(): Promise<Address[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching addresses:', error)
    return []
  }

  return data || []
}

export async function getAddressById(id: string): Promise<Address | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching address:', error)
    return null
  }

  return data
}

export async function getDefaultAddress(): Promise<Address | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data, error } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_default', true)
    .eq('is_deleted', false)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching default address:', error)
    return null
  }

  return data
}

/**
 * Sanitize address input before database operations
 * Requirement 3.4: Sanitize all inputs before database storage
 */
function sanitizeAddressInput(input: Partial<AddressInput>): Partial<AddressInput> {
  const sanitized: Partial<AddressInput> = {}
  
  if (input.label !== undefined) {
    sanitized.label = sanitizeText(input.label)
  }
  if (input.recipient_name !== undefined) {
    sanitized.recipient_name = sanitizeText(input.recipient_name)
  }
  if (input.phone !== undefined) {
    sanitized.phone = sanitizePhone(input.phone)
  }
  if (input.address_line1 !== undefined) {
    sanitized.address_line1 = sanitizeAddress(input.address_line1)
  }
  if (input.address_line2 !== undefined) {
    sanitized.address_line2 = input.address_line2 ? sanitizeAddress(input.address_line2) : undefined
  }
  if (input.city !== undefined) {
    sanitized.city = sanitizeText(input.city)
  }
  if (input.state !== undefined) {
    sanitized.state = sanitizeText(input.state)
  }
  if (input.postal_code !== undefined) {
    sanitized.postal_code = sanitizePostalCode(input.postal_code)
  }
  if (input.country !== undefined) {
    sanitized.country = trimWhitespace(input.country)
  }
  if (input.is_default !== undefined) {
    sanitized.is_default = input.is_default
  }
  
  return sanitized
}

export async function createAddress(input: AddressInput): Promise<Address | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Sanitize input before saving - Requirement 3.4
  const sanitizedInput = sanitizeAddressInput(input) as AddressInput

  // If this is the first address or marked as default, handle default logic
  if (sanitizedInput.is_default) {
    await clearDefaultAddress()
  }

  // Check if this is the first address
  const existingAddresses = await getAddresses()
  const isFirstAddress = existingAddresses.length === 0

  const { data, error } = await supabase
    .from('addresses')
    .insert({
      user_id: user.id,
      label: sanitizedInput.label,
      recipient_name: sanitizedInput.recipient_name,
      phone: sanitizedInput.phone,
      address_line1: sanitizedInput.address_line1,
      address_line2: sanitizedInput.address_line2,
      city: sanitizedInput.city,
      state: sanitizedInput.state,
      postal_code: sanitizedInput.postal_code,
      country: sanitizedInput.country || 'Indonesia',
      is_default: sanitizedInput.is_default || isFirstAddress,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating address:', error)
    return null
  }

  return data
}

export async function updateAddress(id: string, input: Partial<AddressInput>): Promise<Address | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // Sanitize input before saving - Requirement 3.4
  const sanitizedInput = sanitizeAddressInput(input)

  // If setting as default, clear other defaults first
  if (sanitizedInput.is_default) {
    await clearDefaultAddress()
  }

  const { data, error } = await supabase
    .from('addresses')
    .update({
      label: sanitizedInput.label,
      recipient_name: sanitizedInput.recipient_name,
      phone: sanitizedInput.phone,
      address_line1: sanitizedInput.address_line1,
      address_line2: sanitizedInput.address_line2,
      city: sanitizedInput.city,
      state: sanitizedInput.state,
      postal_code: sanitizedInput.postal_code,
      country: sanitizedInput.country,
      is_default: sanitizedInput.is_default,
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating address:', error)
    return null
  }

  return data
}

export async function deleteAddress(id: string): Promise<boolean> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false

  // Check if this is the default address
  const address = await getAddressById(id)
  const wasDefault = address?.is_default

  // Soft delete
  const { error } = await supabase
    .from('addresses')
    .update({ is_deleted: true })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error deleting address:', error)
    return false
  }

  // If deleted address was default, set another as default
  if (wasDefault) {
    const remaining = await getAddresses()
    if (remaining.length > 0) {
      await setDefaultAddress(remaining[0].id)
    }
  }

  return true
}

export async function setDefaultAddress(id: string): Promise<boolean> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false

  // Clear existing default
  await clearDefaultAddress()

  // Set new default
  const { error } = await supabase
    .from('addresses')
    .update({ is_default: true })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('Error setting default address:', error)
    return false
  }

  return true
}

async function clearDefaultAddress(): Promise<void> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return

  await supabase
    .from('addresses')
    .update({ is_default: false })
    .eq('user_id', user.id)
    .eq('is_default', true)
}
