'use client'

import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'

export default function AdminTestPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header - Only render after mount */}
      {isMounted && (
        <div className="lg:hidden bg-amber-800 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 hover:bg-amber-700 rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TS</span>
            </div>
            <span className="font-semibold">Admin Panel Test</span>
          </div>
          
          <div className="w-10" aria-hidden="true" />
        </div>
      )}

      {/* Mobile Sidebar - Only render after mount */}
      {isMounted && isMobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Sidebar Drawer */}
          <div className="fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-amber-900 via-amber-800 to-amber-900 z-50 lg:hidden transform transition-transform duration-300 ease-in-out">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-amber-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">TS</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Tenunan Songket</h1>
                  <p className="text-xs text-amber-300">Panel Admin Test</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-amber-300 hover:text-white hover:bg-amber-700/50 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <p className="text-white">Sidebar is working!</p>
              <p className="text-amber-300 mt-2">Click backdrop or X to close</p>
            </div>
          </div>
        </>
      )}

      {/* Main Content */}
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Admin Mobile Sidebar Test</h1>
        <p className="mb-4">Resize browser to mobile view (375px width) and click hamburger menu.</p>
        <p className="text-sm text-gray-600">Current state: {isMobileMenuOpen ? 'Open' : 'Closed'}</p>
        <p className="text-sm text-gray-600">Mounted: {isMounted ? 'Yes' : 'No'}</p>
      </div>
    </div>
  )
}
