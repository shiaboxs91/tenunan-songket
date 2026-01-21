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
  ChevronDown
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useState } from 'react'

interface MenuItem {
  name: string
  href: string
  icon: React.ElementType
  badge?: number
}

interface MenuGroup {
  title: string
  items: MenuItem[]
}

const menuGroups: MenuGroup[] = [
  {
    title: 'Utama',
    items: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard }
    ]
  },
  {
    title: 'Katalog',
    items: [
      { name: 'Produk', href: '/admin/products', icon: Package },
      { name: 'Kategori', href: '/admin/categories', icon: FolderTree }
    ]
  },
  {
    title: 'Penjualan',
    items: [
      { name: 'Pesanan', href: '/admin/orders', icon: ShoppingCart },
      { name: 'Kupon', href: '/admin/coupons', icon: Tag }
    ]
  },
  {
    title: 'Pengguna',
    items: [
      { name: 'Admin', href: '/admin/users/admins', icon: Shield },
      { name: 'Pelanggan', href: '/admin/users', icon: Users }
    ]
  },
  {
    title: 'Pengaturan',
    items: [
      { name: 'Ekspedisi', href: '/admin/settings/shipping', icon: Truck },
      { name: 'Pembayaran', href: '/admin/settings/payments', icon: CreditCard },
      { name: 'Situs', href: '/admin/settings', icon: Settings },
      { name: 'Versi', href: '/admin/settings/version', icon: GitBranch }
    ]
  }
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [expandedGroups, setExpandedGroups] = useState<string[]>(
    menuGroups.map(g => g.title) // All expanded by default
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

  const isActive = (href: string) => {
    // Exact match
    if (pathname === href) return true
    
    // Sub-route match (ensure it starts with href + /)
    // This prevents /admin/settings/shipping from matching /admin/settings
    if (pathname.startsWith(`${href}/`)) return true
    
    return false
  }

  return (
    <div className="w-64 bg-gradient-to-b from-amber-900 via-amber-800 to-amber-900 min-h-screen flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-amber-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">TS</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Tenunan Songket</h1>
            <p className="text-xs text-amber-300">Panel Admin</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {menuGroups.map((group) => (
          <div key={group.title} className="mb-2">
            <button
              onClick={() => toggleGroup(group.title)}
              className="w-full flex items-center justify-between px-4 py-2 text-xs font-semibold text-amber-400 uppercase tracking-wider hover:text-amber-300 transition-colors"
            >
              {group.title}
              <ChevronDown 
                className={`h-4 w-4 transition-transform ${
                  expandedGroups.includes(group.title) ? 'rotate-180' : ''
                }`} 
              />
            </button>
            
            {expandedGroups.includes(group.title) && (
              <div className="mt-1 space-y-1 px-3">
                {group.items.map((item) => {
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                        transition-all duration-200
                        ${active 
                          ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' 
                          : 'text-amber-100 hover:bg-amber-700/50 hover:text-white'
                        }
                      `}
                    >
                      <item.icon className={`h-5 w-5 ${active ? 'text-white' : 'text-amber-400'}`} />
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-amber-700/50">
        <div className="mb-3 px-3">
          <p className="text-xs text-amber-400">Versi Aplikasi</p>
          <p className="text-sm text-amber-200 font-medium">v1.2.0</p>
        </div>
        
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-amber-100 hover:bg-red-500/20 hover:text-red-300 transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  )
}
