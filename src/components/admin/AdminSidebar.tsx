"use client"

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
  ChevronRight,
  Images,
  Store,
  BarChart3,
  Sparkles
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'
import { cn } from '@/lib/utils'

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
      { name: 'Kategori', href: '/admin/categories', icon: FolderTree }
    ]
  },
  {
    title: 'Penjualan',
    icon: ShoppingCart,
    defaultOpen: true,
    items: [
      { name: 'Pesanan', href: '/admin/orders', icon: ShoppingCart },
      { name: 'Kupon & Promo', href: '/admin/coupons', icon: Tag }
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

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    menuGroups.filter(g => g.defaultOpen).map(g => g.title)
  )

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
    <div className="w-72 bg-slate-900 min-h-screen flex flex-col border-r border-slate-800">
      {/* Logo Header */}
      <div className="p-6 border-b border-slate-800">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Tenunan</h1>
            <p className="text-xs text-slate-400 font-medium">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        <div className="space-y-2">
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
                      : "text-slate-400 hover:text-slate-200"
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
                  <div className="mt-1 ml-4 pl-4 border-l border-slate-800 space-y-1">
                    {group.items.map((item) => {
                      const active = isActive(item)
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                            active 
                              ? "bg-gradient-to-r from-amber-500/20 to-amber-600/10 text-amber-400 border-l-2 border-amber-400 -ml-[1px]" 
                              : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                          )}
                        >
                          <item.icon className={cn(
                            "h-4 w-4 transition-colors",
                            active ? "text-amber-400" : "text-slate-500 group-hover:text-slate-300"
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
      <div className="p-4 border-t border-slate-800">
        {/* Version Info */}
        <div className="mb-4 px-3 py-3 rounded-lg bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Versi</p>
              <p className="text-sm text-slate-300 font-semibold">v1.4.0</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" title="System Online" />
          </div>
        </div>
        
        {/* Logout Button */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
        >
          <LogOut className="h-4 w-4 group-hover:text-red-400 transition-colors" />
          <span>Keluar dari Sistem</span>
        </button>
      </div>
    </div>
  )
}
