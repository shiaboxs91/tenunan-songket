'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  Tag, 
  FolderTree,
  Truck,
  CreditCard,
  Settings,
  GitBranch,
  Shield,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const menuItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Produk', href: '/admin/products', icon: Package },
  { name: 'Kategori', href: '/admin/categories', icon: FolderTree },
  { name: 'Pesanan', href: '/admin/orders', icon: ShoppingCart },
  { name: 'Kupon', href: '/admin/coupons', icon: Tag },
  { name: 'Admin', href: '/admin/users/admins', icon: Shield },
  { name: 'Pelanggan', href: '/admin/users', icon: Users },
  { name: 'Ekspedisi', href: '/admin/settings/shipping', icon: Truck },
  { name: 'Pembayaran', href: '/admin/settings/payments', icon: CreditCard },
  { name: 'Situs', href: '/admin/settings', icon: Settings },
  { name: 'Versi', href: '/admin/settings/version', icon: GitBranch }
]

export default function MobileSidebarWrapper() {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close sidebar when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  const handleMenuClick = () => {
    console.log('Menu button clicked!')
    setIsOpen(true)
  }

  const handleClose = () => {
    console.log('Close button clicked!')
    setIsOpen(false)
  }

  if (!mounted) {
    return (
      <div className="fixed top-0 left-0 right-0 z-40 lg:hidden">
        <div className="bg-amber-800 text-white px-4 py-3 flex items-center justify-between">
          <div className="p-2"><Menu className="h-6 w-6" /></div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TS</span>
            </div>
            <span className="font-semibold">Admin Panel</span>
          </div>
          <div className="w-10" />
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="fixed top-0 left-0 right-0 z-40 lg:hidden">
        <div className="bg-amber-800 text-white px-4 py-3 flex items-center justify-between">
          <button
            ref={buttonRef}
            type="button"
            onClick={handleMenuClick}
            className="p-2 hover:bg-amber-700 rounded-lg transition-colors cursor-pointer"
            style={{ WebkitTapHighlightColor: 'transparent' }}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6 pointer-events-none" />
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TS</span>
            </div>
            <span className="font-semibold">Admin Panel</span>
          </div>
          
          <div className="w-10" />
        </div>
      </div>

      {/* Spacer */}
      <div className="h-[52px] lg:hidden" />

      {/* Sidebar Portal */}
      {mounted && isOpen && createPortal(
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-[9998] lg:hidden"
            onClick={handleClose}
          />
          
          {/* Sidebar Drawer */}
          <div className="fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-amber-900 via-amber-800 to-amber-900 z-[9999] lg:hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-amber-700/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">TS</span>
                </div>
                <div>
                  <h1 className="text-lg font-bold text-white">Tenunan Songket</h1>
                  <p className="text-xs text-amber-300">Panel Admin</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="p-2 text-amber-300 hover:text-white hover:bg-amber-700/50 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 overflow-y-auto">
              <div className="space-y-1 px-3">
                {menuItems.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium
                        transition-all duration-200
                        ${active 
                          ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' 
                          : 'text-amber-100 hover:bg-amber-700/50 hover:text-white'
                        }
                      `}
                    >
                      <item.icon className={`h-5 w-5 ${active ? 'text-white' : 'text-amber-400'}`} />
                      <span>{item.name}</span>
                    </Link>
                  )
                })}
              </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-amber-700/50">
              <div className="mb-3 px-3">
                <p className="text-xs text-amber-400">Versi Aplikasi</p>
                <p className="text-sm text-amber-200 font-medium">v1.0.0</p>
              </div>
              
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-amber-100 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
              >
                <LogOut className="h-5 w-5" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  )
}
