'use client'

import dynamic from 'next/dynamic'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

// Dynamically import MobileSidebar with no SSR to avoid hydration issues
const MobileSidebarWrapper = dynamic(
  () => import('@/app/admin/MobileSidebarWrapper').then(mod => mod.default),
  { ssr: false, loading: () => <div className="h-[52px] lg:hidden bg-amber-800" /> }
)

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>

      {/* Mobile Components (Client-Side Only) */}
      <MobileSidebarWrapper />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
