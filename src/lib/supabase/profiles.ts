import { createClient } from './client'
import type { Tables } from './types'

export type Profile = Tables<'profiles'>

export interface ProfileUpdate {
  full_name?: string
  phone?: string
  avatar_url?: string
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data
}

export async function updateProfile(updates: ProfileUpdate): Promise<Profile | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: updates.full_name,
      phone: updates.phone,
      avatar_url: updates.avatar_url,
    })
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    return null
  }

  return data
}

export async function uploadAvatar(file: File): Promise<string | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const fileExt = file.name.split('.').pop()
  const fileName = `${user.id}-${Date.now()}.${fileExt}`
  const filePath = `avatars/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true,
    })

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError)
    return null
  }

  const { data: { publicUrl } } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  // Update profile with new avatar URL
  await updateProfile({ avatar_url: publicUrl })

  return publicUrl
}

export async function deleteAvatar(): Promise<boolean> {
  const supabase = createClient()
  const profile = await getProfile()
  
  if (!profile?.avatar_url) return true

  // Extract file path from URL
  const urlParts = profile.avatar_url.split('/avatars/')
  if (urlParts.length < 2) return false

  const filePath = `avatars/${urlParts[1]}`

  const { error } = await supabase.storage
    .from('avatars')
    .remove([filePath])

  if (error) {
    console.error('Error deleting avatar:', error)
    return false
  }

  // Clear avatar URL in profile
  await updateProfile({ avatar_url: '' })

  return true
}
