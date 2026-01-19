'use client'

import { useState, useEffect, useCallback } from 'react'
import { checkForUpdate } from '@/lib/supabase/version-client'
import type { VersionCheckResult } from '@/lib/supabase/types'

const LOCAL_STORAGE_KEY = 'app_version'
const CHECK_INTERVAL = 1000 * 60 * 60 // Check every hour

interface VersionCheckerProps {
  /** Current client version - should match package.json version */
  clientVersion?: string
}

export function VersionChecker({ clientVersion = '1.0.0' }: VersionCheckerProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [updateInfo, setUpdateInfo] = useState<VersionCheckResult | null>(null)

  const checkVersion = useCallback(async () => {
    try {
      // Get stored version from localStorage
      const storedVersion = localStorage.getItem(LOCAL_STORAGE_KEY)
      const versionToCheck = storedVersion || clientVersion

      const result = await checkForUpdate(versionToCheck)
      
      if (result && result.requires_update) {
        setUpdateInfo(result)
        // setShowModal(true) // Disabled by preference: Hide popup
        
        // If mandatory, don't allow dismissal
        // if (result.is_mandatory) { setDismissed(false) } // Logic disabled while UI is hidden
      } else if (result) {
        // Update localStorage with current version
        localStorage.setItem(LOCAL_STORAGE_KEY, result.current_version)
      }
    } catch (error) {
      console.error('Error checking for updates:', error)
    }
  }, [clientVersion])

  useEffect(() => {
    // Initial check
    checkVersion()

    // Set up periodic checks
    const interval = setInterval(checkVersion, CHECK_INTERVAL)

    return () => clearInterval(interval)
  }, [checkVersion])

  // Always return null to hide UI as requested
  return null
}

export default VersionChecker
