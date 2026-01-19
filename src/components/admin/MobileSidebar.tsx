"use client"

import { useEffect } from 'react'
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
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface MenuItem {
  name: string
  href: string
  icon: React.ElementType
}

const menuItems: MenuItem[] = [
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

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  // Close sidebar when route changes
  useEffect(() => {
    if (isOpen) {
      onClose()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="w-72 p-0 border-r-0 bg-transparent shadow-none border-none">
        
        {/* Sidebar Container with Gradient */}
        <div className="flex flex-col h-full w-full bg-gradient-to-b from-amber-900 via-amber-800 to-amber-900">
          
          {/* Header */}
          <SheetHeader className="p-4 border-b border-amber-700/50 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">TS</span>
              </div>
              <div>
                <SheetTitle className="text-lg font-bold text-white">Tenunan Songket</SheetTitle>
                <p className="text-xs text-amber-300">Panel Admin</p>
              </div>
            </div>
          </SheetHeader>

          {/* Navigation */}
          <nav className="flex-1 py-4 overflow-y-auto">
            <div className="space-y-1 px-3">
              {menuItems.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={onClose}
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

      </SheetContent>
    </Sheet>
  )
}

// Mobile Header with Menu Button
export function MobileHeader({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <div className="lg:hidden bg-amber-800 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-md">
      <button
        type="button"
        onClick={onMenuClick}
        className="p-2 hover:bg-amber-700 rounded-lg transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>
      
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">TS</span>
        </div>
        <span className="font-semibold">Admin Panel</span>
      </div>
      
      <div className="w-10" aria-hidden="true" />
    </div>
  )
}
