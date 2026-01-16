import { createClient } from './client'
import type { VersionCheckResult } from './types'

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
