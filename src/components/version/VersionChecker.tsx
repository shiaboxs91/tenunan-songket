'use client'

import { useState, useEffect, useCallback } from 'react'
import { RefreshCw, X, AlertTriangle, Download } from 'lucide-react'
import { checkForUpdate } from '@/lib/supabase/version-client'
import type { VersionCheckResult } from '@/lib/supabase/types'

const LOCAL_STORAGE_KEY = 'app_version'
const CHECK_INTERVAL = 1000 * 60 * 60 // Check every hour

interface VersionCheckerProps {
  /** Current client version - should match package.json version */
  clientVersion?: string
}

export function VersionChecker({ clientVersion = '1.0.0' }: VersionCheckerProps) {
  const [updateInfo, setUpdateInfo] = useState<VersionCheckResult | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const checkVersion = useCallback(async () => {
    try {
      // Get stored version from localStorage
      const storedVersion = localStorage.getItem(LOCAL_STORAGE_KEY)
      const versionToCheck = storedVersion || clientVersion

      const result = await checkForUpdate(versionToCheck)
      
      if (result && result.requires_update) {
        setUpdateInfo(result)
        setShowModal(true)
        
        // If mandatory, don't allow dismissal
        if (result.is_mandatory) {
          setDismissed(false)
        }
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

  const handleDismiss = () => {
    if (updateInfo?.is_mandatory) {
      // Can't dismiss mandatory updates
      return
    }
    setDismissed(true)
    setShowModal(false)
  }

  const handleUpdate = () => {
    // Update localStorage to current version
    if (updateInfo) {
      localStorage.setItem(LOCAL_STORAGE_KEY, updateInfo.current_version)
    }
    // Reload the page to get the latest version
    window.location.reload()
  }

  // Don't show anything if no update or dismissed (and not mandatory)
  if (!updateInfo || !showModal || (dismissed && !updateInfo.is_mandatory)) {
    return null
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className={`p-6 ${updateInfo.is_mandatory ? 'bg-red-500' : 'bg-amber-500'} text-white`}>
          <div className="flex items-center gap-3">
            {updateInfo.is_mandatory ? (
              <AlertTriangle className="h-8 w-8" />
            ) : (
              <Download className="h-8 w-8" />
            )}
            <div>
              <h2 className="text-xl font-bold">
                {updateInfo.is_mandatory ? 'Update Wajib' : 'Update Tersedia'}
              </h2>
              <p className="text-sm opacity-90">
                Versi {updateInfo.current_version} tersedia
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>Versi Anda</span>
              <span className="font-mono">{updateInfo.client_version}</span>
            </div>
            <div className="flex items-center justify-between text-sm text-gray-900">
              <span>Versi Terbaru</span>
              <span className="font-mono font-semibold">{updateInfo.current_version}</span>
            </div>
          </div>

          {updateInfo.release_notes && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-1">Catatan Rilis:</h4>
              <p className="text-sm text-gray-600">{updateInfo.release_notes}</p>
            </div>
          )}

          {updateInfo.is_mandatory && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                <strong>Perhatian:</strong> Update ini wajib dilakukan untuk melanjutkan menggunakan aplikasi.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            {!updateInfo.is_mandatory && (
              <button
                onClick={handleDismiss}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Nanti
              </button>
            )}
            <button
              onClick={handleUpdate}
              className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors flex items-center justify-center gap-2 ${
                updateInfo.is_mandatory 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : 'bg-amber-500 hover:bg-amber-600'
              }`}
            >
              <RefreshCw className="h-4 w-4" />
              Update Sekarang
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VersionChecker
