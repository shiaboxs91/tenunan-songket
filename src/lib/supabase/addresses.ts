import { createClient } from './client'
import type { Tables } from './types'

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

export async function createAddress(input: AddressInput): Promise<Address | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // If this is the first address or marked as default, handle default logic
  if (input.is_default) {
    await clearDefaultAddress()
  }

  // Check if this is the first address
  const existingAddresses = await getAddresses()
  const isFirstAddress = existingAddresses.length === 0

  const { data, error } = await supabase
    .from('addresses')
    .insert({
      user_id: user.id,
      label: input.label,
      recipient_name: input.recipient_name,
      phone: input.phone,
      address_line1: input.address_line1,
      address_line2: input.address_line2,
      city: input.city,
      state: input.state,
      postal_code: input.postal_code,
      country: input.country || 'Indonesia',
      is_default: input.is_default || isFirstAddress,
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

  // If setting as default, clear other defaults first
  if (input.is_default) {
    await clearDefaultAddress()
  }

  const { data, error } = await supabase
    .from('addresses')
    .update({
      label: input.label,
      recipient_name: input.recipient_name,
      phone: input.phone,
      address_line1: input.address_line1,
      address_line2: input.address_line2,
      city: input.city,
      state: input.state,
      postal_code: input.postal_code,
      country: input.country,
      is_default: input.is_default,
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
