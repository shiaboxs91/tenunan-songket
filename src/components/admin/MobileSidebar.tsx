"use client"

import { useState, useEffect } from 'react'
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
  Palette,
  MessageSquare,
  FileText,
  Store,
  Images,
  BarChart3,
  Sparkles,
  ChevronRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet"

interface MenuItem {
  name: string
  href: string
  icon: React.ElementType
  badge?: number
  exactMatch?: boolean
}

interface MenuGroup {
  title: string
  icon: React.ElementType
  items: MenuItem[]
  defaultOpen?: boolean
}

const menuGroups: MenuGroup[] = [
  {
    title: 'Overview',
    icon: BarChart3,
    defaultOpen: true,
    items: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard, exactMatch: true }
    ]
  },
  {
    title: 'Katalog',
    icon: Package,
    defaultOpen: true,
    items: [
      { name: 'Semua Produk', href: '/admin/products', icon: Package },
      { name: 'Kategori', href: '/admin/categories', icon: FolderTree },
      { name: 'Warna', href: '/admin/colors', icon: Palette }
    ]
  },
  {
    title: 'Blog',
    icon: FileText,
    defaultOpen: false,
    items: [
      { name: 'Semua Artikel', href: '/admin/blog', icon: FileText },
      { name: 'Kategori Blog', href: '/admin/blog/categories', icon: FolderTree }
    ]
  },
  {
    title: 'Penjualan',
    icon: ShoppingCart,
    defaultOpen: true,
    items: [
      { name: 'Pesanan', href: '/admin/orders', icon: ShoppingCart },
      { name: 'Kupon & Promo', href: '/admin/coupons', icon: Tag },
      { name: 'Ulasan', href: '/admin/reviews', icon: MessageSquare }
    ]
  },
  {
    title: 'Pengguna',
    icon: Users,
    defaultOpen: false,
    items: [
      { name: 'Pelanggan', href: '/admin/users', icon: Users },
      { name: 'Administrator', href: '/admin/users/admins', icon: Shield }
    ]
  },
  {
    title: 'Integrasi',
    icon: Store,
    defaultOpen: false,
    items: [
      { name: 'Facebook Shop', href: '/admin/facebook-shop', icon: Store }
    ]
  },
  {
    title: 'Pengaturan',
    icon: Settings,
    defaultOpen: false,
    items: [
      { name: 'Umum', href: '/admin/settings', icon: Settings, exactMatch: true },
      { name: 'Pengiriman', href: '/admin/settings/shipping', icon: Truck },
      { name: 'Pembayaran', href: '/admin/settings/payments', icon: CreditCard },
      { name: 'Hero Slider', href: '/admin/settings/hero', icon: Images },
      { name: 'Versi & Info', href: '/admin/settings/version', icon: GitBranch }
    ]
  }
]

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    menuGroups.filter(g => g.defaultOpen).map(g => g.title)
  )

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

  const toggleGroup = (title: string) => {
    setExpandedGroups(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title)
        : [...prev, title]
    )
  }

  const isActive = (item: MenuItem) => {
    if (item.exactMatch) {
      return pathname === item.href
    }
    if (pathname === item.href) return true
    if (pathname.startsWith(`${item.href}/`)) return true
    return false
  }

  const isGroupActive = (group: MenuGroup) => {
    return group.items.some(item => isActive(item))
  }

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="left" className="w-72 p-0 border-r-0 bg-transparent shadow-none border-none">

        {/* Sidebar Container with Gradient */}
        <div className="flex flex-col h-full w-full bg-gradient-to-b from-amber-900 via-amber-800 to-amber-900">

          {/* Header */}
          <SheetHeader className="p-4 border-b border-amber-700/50">
            <div className="flex items-center justify-center py-2">
              <div className="relative w-40 h-10">
                <Image
                  src="https://tenunansongket.com/wp-content/uploads/2020/08/ts-4.png"
                  alt="TenunanSongket Admin Logo"
                  fill
                  className="object-contain filter brightness-0 invert"
                  sizes="160px"
                />
              </div>
            </div>
          </SheetHeader>

          {/* Navigation */}
          <nav className="flex-1 py-4 overflow-y-auto">
            <div className="space-y-2 px-3">
              {menuGroups.map((group) => {
                const isExpanded = expandedGroups.includes(group.title)
                const groupActive = isGroupActive(group)
                
                return (
                  <div key={group.title}>
                    {/* Group Header */}
                    <button
                      onClick={() => toggleGroup(group.title)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                        groupActive 
                          ? "text-amber-400" 
                          : "text-amber-100 hover:text-white"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <group.icon className="w-4 h-4" />
                        <span>{group.title}</span>
                      </div>
                      <ChevronRight 
                        className={cn(
                          "w-4 h-4 transition-transform duration-200",
                          isExpanded && "rotate-90"
                        )} 
                      />
                    </button>
                    
                    {/* Group Items */}
                    <div className={cn(
                      "overflow-hidden transition-all duration-200",
                      isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                    )}>
                      <div className="mt-1 ml-4 pl-4 border-l border-amber-700/50 space-y-1">
                        {group.items.map((item) => {
                          const active = isActive(item)
                          return (
                            <Link
                              key={item.name}
                              href={item.href}
                              onClick={onClose}
                              className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                                active 
                                  ? "bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-400 border-l-2 border-amber-400 -ml-[1px]" 
                                  : "text-amber-200 hover:text-white hover:bg-amber-800/50"
                              )}
                            >
                              <item.icon className={cn(
                                "h-4 w-4 transition-colors",
                                active ? "text-amber-400" : "text-amber-300 group-hover:text-amber-100"
                              )} />
                              <span>{item.name}</span>
                              {item.badge && item.badge > 0 && (
                                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-amber-700/50">
            <div className="mb-3 px-3">
              <p className="text-xs text-amber-400">Versi Aplikasi</p>
              <p className="text-sm text-amber-200 font-medium">v{process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0"}</p>
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

      <div className="flex flex-1 justify-center items-center">
        <div className="relative w-32 h-8">
          <Image
            src="https://tenunansongket.com/wp-content/uploads/2020/08/ts-4.png"
            alt="TenunanSongket Admin Logo"
            fill
            className="object-contain filter brightness-0 invert"
            sizes="128px"
          />
        </div>
      </div>

      <div className="w-10" aria-hidden="true" />
    </div>
  )
}
