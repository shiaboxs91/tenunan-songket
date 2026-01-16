import { createClient } from './client'
import { createClient as createServerClient } from './server'
import type { AppVersion, AppVersionCreate, AppVersionUpdate, VersionCheckResult } from './types'

/**
 * Compare two semantic version strings
 * Returns: -1 if v1 < v2, 0 if v1 === v2, 1 if v1 > v2
 */
export function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number)
  const parts2 = v2.split('.').map(Number)
  
  // Pad arrays to same length
  const maxLength = Math.max(parts1.length, parts2.length)
  while (parts1.length < maxLength) parts1.push(0)
  while (parts2.length < maxLength) parts2.push(0)
  
  for (let i = 0; i < maxLength; i++) {
    if (parts1[i] < parts2[i]) return -1
    if (parts1[i] > parts2[i]) return 1
  }
  
  return 0
}

/**
 * Validate semantic version format (x.y.z)
 */
export function isValidVersion(version: string): boolean {
  const semverRegex = /^\d+\.\d+\.\d+$/
  return semverRegex.test(version)
}

// ============================================
// Server-side functions (for admin pages)
// ============================================

/**
 * Get all app versions sorted by release date (newest first)
 */
export async function getAppVersions(): Promise<AppVersion[]> {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('app_versions')
    .select('*')
    .order('released_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching app versions:', error)
    return []
  }
  
  return (data || []).map((item: any) => ({
    ...item,
    is_mandatory: item.is_mandatory ?? false,
    is_current: item.is_current ?? false
  })) as AppVersion[]
}

/**
 * Get the current active version
 */
export async function getCurrentVersion(): Promise<AppVersion | null> {
  const supabase = await createServerClient()
  
  const { data, error } = await supabase
    .from('app_versions')
    .select('*')
    .eq('is_current', true)
    .single()
  
  if (error) {
    console.error('Error fetching current version:', error)
    return null
  }
  
  return data ? {
    ...data,
    is_mandatory: data.is_mandatory ?? false,
    is_current: data.is_current ?? false
  } as AppVersion : null
}

/**
 * Create a new app version
 */
export async function createVersion(versionData: AppVersionCreate): Promise<{ success: boolean; error?: string; data?: AppVersion }> {
  const supabase = await createServerClient()
  
  // Validate version format
  if (!isValidVersion(versionData.version)) {
    return { success: false, error: 'Format versi tidak valid (gunakan x.y.z)' }
  }
  
  // Check if version already exists
  const { data: existing } = await supabase
    .from('app_versions')
    .select('id')
    .eq('version', versionData.version)
    .single()
  
  if (existing) {
    return { success: false, error: 'Versi sudah ada' }
  }
  
  // If this version should be current, unset other current versions
  if (versionData.is_current) {
    await supabase
      .from('app_versions')
      .update({ is_current: false })
      .eq('is_current', true)
  }
  
  const { data, error } = await supabase
    .from('app_versions')
    .insert({
      version: versionData.version,
      release_notes: versionData.release_notes || null,
      is_mandatory: versionData.is_mandatory ?? false,
      is_current: versionData.is_current ?? false,
      released_at: versionData.released_at || new Date().toISOString()
    })
    .select()
    .single()
  
  if (error) {
    console.error('Error creating version:', error)
    return { success: false, error: error.message }
  }
  
  return { 
    success: true, 
    data: {
      ...data,
      is_mandatory: data.is_mandatory ?? false,
      is_current: data.is_current ?? false
    } as AppVersion 
  }
}

/**
 * Update an existing app version
 */
export async function updateVersion(id: string, updates: AppVersionUpdate): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient()
  
  // Validate version format if updating version
  if (updates.version && !isValidVersion(updates.version)) {
    return { success: false, error: 'Format versi tidak valid (gunakan x.y.z)' }
  }
  
  // If setting this version as current, unset other current versions
  if (updates.is_current) {
    await supabase
      .from('app_versions')
      .update({ is_current: false })
      .eq('is_current', true)
  }
  
  const { error } = await supabase
    .from('app_versions')
    .update(updates)
    .eq('id', id)
  
  if (error) {
    console.error('Error updating version:', error)
    return { success: false, error: error.message }
  }
  
  return { success: true }
}

/**
 * Set a version as the current version
 */
export async function setCurrentVersion(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient()
  
  // Unset all current versions
  await supabase
    .from('app_versions')
    .update({ is_current: false })
    .eq('is_current', true)
  
  // Set the new current version
  const { error } = await supabase
    .from('app_versions')
    .update({ is_current: true })
    .eq('id', id)
  
  if (error) {
    console.error('Error setting current version:', error)
    return { success: false, error: error.message }
  }
  
  return { success: true }
}

/**
 * Delete an app version
 */
export async function deleteVersion(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createServerClient()
  
  // Check if this is the current version
  const { data: version } = await supabase
    .from('app_versions')
    .select('is_current')
    .eq('id', id)
    .single()
  
  if (version?.is_current) {
    return { success: false, error: 'Tidak dapat menghapus versi yang sedang aktif' }
  }
  
  const { error } = await supabase
    .from('app_versions')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting version:', error)
    return { success: false, error: error.message }
  }
  
  return { success: true }
}

// ============================================
// Client-side functions (for version checking)
// ============================================

/**
 * Check if client needs to update (client-side)
 */
export async function checkForUpdate(clientVersion: string): Promise<VersionCheckResult | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('app_versions')
    .select('*')
    .eq('is_current', true)
    .single()
  
  if (error || !data) {
    console.error('Error checking for update:', error)
    return null
  }
  
  const currentVersion = data.version
  const comparison = compareVersions(clientVersion, currentVersion)
  const requiresUpdate = comparison < 0
  
  return {
    current_version: currentVersion,
    client_version: clientVersion,
    requires_update: requiresUpdate,
    is_mandatory: requiresUpdate && (data.is_mandatory ?? false),
    release_notes: data.release_notes
  }
}

/**
 * Get current version for client (client-side)
 */
export async function getClientCurrentVersion(): Promise<string | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('app_versions')
    .select('version')
    .eq('is_current', true)
    .single()
  
  if (error || !data) {
    return null
  }
  
  return data.version
}
