import { createClient } from './server'
import type { 
  SiteSettings, 
  SiteSettingsGeneral, 
  SiteSettingsContact, 
  SiteSettingsSocial, 
  SiteSettingsSEO,
  Json
} from './types'

// Get all site settings
export async function getSiteSettings(): Promise<SiteSettings | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value')
  
  if (error) {
    console.error('Error fetching site settings:', error)
    return null
  }
  
  if (!data || data.length === 0) {
    return null
  }
  
  const settings: Partial<SiteSettings> = {}
  
  for (const row of data) {
    switch (row.key) {
      case 'general':
        settings.general = row.value as unknown as SiteSettingsGeneral
        break
      case 'contact':
        settings.contact = row.value as unknown as SiteSettingsContact
        break
      case 'social':
        settings.social = row.value as unknown as SiteSettingsSocial
        break
      case 'seo':
        settings.seo = row.value as unknown as SiteSettingsSEO
        break
    }
  }
  
  return settings as SiteSettings
}

// Get a specific setting by key
export async function getSetting<T>(key: string): Promise<T | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .single()
  
  if (error) {
    console.error(`Error fetching setting ${key}:`, error)
    return null
  }
  
  return data?.value as T
}


// Update a specific setting
export async function updateSetting<T>(key: string, value: T): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key, value: value as unknown as Json }, { onConflict: 'key' })
  
  if (error) {
    console.error(`Error updating setting ${key}:`, error)
    return false
  }
  
  return true
}

// Update all site settings
export async function updateSiteSettings(settings: Partial<SiteSettings>): Promise<boolean> {
  const supabase = await createClient()
  
  const updates: { key: string; value: Json }[] = []
  
  if (settings.general) {
    updates.push({ key: 'general', value: settings.general as unknown as Json })
  }
  if (settings.contact) {
    updates.push({ key: 'contact', value: settings.contact as unknown as Json })
  }
  if (settings.social) {
    updates.push({ key: 'social', value: settings.social as unknown as Json })
  }
  if (settings.seo) {
    updates.push({ key: 'seo', value: settings.seo as unknown as Json })
  }
  
  if (updates.length === 0) {
    return true
  }
  
  const { error } = await supabase
    .from('site_settings')
    .upsert(updates, { onConflict: 'key' })
  
  if (error) {
    console.error('Error updating site settings:', error)
    return false
  }
  
  return true
}

// Upload logo to Supabase Storage
export async function uploadLogo(file: File): Promise<string | null> {
  const supabase = await createClient()
  
  const fileExt = file.name.split('.').pop()
  const fileName = `logo-${Date.now()}.${fileExt}`
  const filePath = `site/${fileName}`
  
  const { error: uploadError } = await supabase.storage
    .from('public')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    })
  
  if (uploadError) {
    console.error('Error uploading logo:', uploadError)
    return null
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('public')
    .getPublicUrl(filePath)
  
  return publicUrl
}

// Upload favicon to Supabase Storage
export async function uploadFavicon(file: File): Promise<string | null> {
  const supabase = await createClient()
  
  const fileExt = file.name.split('.').pop()
  const fileName = `favicon-${Date.now()}.${fileExt}`
  const filePath = `site/${fileName}`
  
  const { error: uploadError } = await supabase.storage
    .from('public')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    })
  
  if (uploadError) {
    console.error('Error uploading favicon:', uploadError)
    return null
  }
  
  const { data: { publicUrl } } = supabase.storage
    .from('public')
    .getPublicUrl(filePath)
  
  return publicUrl
}
