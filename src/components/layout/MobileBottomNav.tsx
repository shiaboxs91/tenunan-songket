"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Grid3X3, ShoppingCart, User, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/cart/CartProvider";
import { CategorySheet } from "./CategorySheet";

type NavItem = {
  name: string;
  href?: string;
  icon: typeof Home;
  showBadge?: boolean;
  isCategory?: boolean;
  isFab?: boolean;
};

const navItems: NavItem[] = [
  { name: "Beranda", href: "/", icon: Home },
  { name: "Kategori", icon: LayoutGrid, isCategory: true },
  { name: "Produk", href: "/products", icon: Grid3X3, isFab: true },
  { name: "Keranjang", href: "/cart", icon: ShoppingCart, showBadge: true },
  { name: "Akun", href: "/account", icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);

  return (
    <>
      <nav 
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        aria-label="Navigasi mobile"
      >
        {/* Curved background with notch for FAB */}
        <div className="relative">
          {/* SVG curved background */}
          <svg 
            className="absolute bottom-0 left-0 right-0 w-full h-20"
            viewBox="0 0 400 80" 
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="navGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.98)" />
                <stop offset="100%" stopColor="rgba(255,255,255,1)" />
              </linearGradient>
              <filter id="navShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="-2" stdDeviation="4" floodOpacity="0.1"/>
              </filter>
            </defs>
            <path 
              d="M0,20 L150,20 Q170,20 180,35 Q200,60 220,35 Q230,20 250,20 L400,20 L400,80 L0,80 Z"
              fill="url(#navGradient)"
              filter="url(#navShadow)"
            />
          </svg>

          {/* Nav items container */}
          <div className="relative flex items-end justify-around h-20 px-2 pb-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href 
                ? pathname === item.href || 
                  (item.href === "/products" && pathname.startsWith("/products"))
                : false;

              // FAB center button
              if (item.isFab) {
                return (
                  <Link
                    key={item.name}
                    href={item.href!}
                    className="relative -mt-6 z-10"
                    aria-label={item.name}
                  >
                    {/* Outer glow ring */}
                    <div className={cn(
                      "absolute inset-0 rounded-full transition-all duration-300",
                      isActive 
                        ? "bg-amber-400/30 scale-125 animate-pulse" 
                        : "bg-amber-200/20 scale-110"
                    )} />
                    
                    {/* FAB button */}
                    <div className={cn(
                      "relative w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300",
                      "bg-gradient-to-br from-amber-500 via-amber-500 to-amber-600",
                      "hover:from-amber-600 hover:via-amber-500 hover:to-amber-500",
                      "active:scale-95",
                      isActive && "ring-4 ring-amber-200"
                    )}>
                      <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                    </div>
                    
                    {/* Label */}
                    <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-amber-700 whitespace-nowrap">
                      {item.name}
                    </span>
                  </Link>
                );
              }

              // Category button (opens sheet)
              if (item.isCategory) {
                return (
                  <button
                    key={item.name}
                    onClick={() => setCategorySheetOpen(true)}
                    className={cn(
                      "flex flex-col items-center justify-center w-16 h-14 relative transition-all duration-200",
                      categorySheetOpen ? "text-amber-600" : "text-slate-400 hover:text-amber-500"
                    )}
                    aria-label={item.name}
                  >
                    {/* Icon container */}
                    <div className={cn(
                      "relative p-2 rounded-xl transition-all duration-200",
                      categorySheetOpen && "bg-amber-50"
                    )}>
                      <Icon className={cn(
                        "h-5 w-5 transition-all duration-200",
                        categorySheetOpen && "scale-110"
                      )} aria-hidden="true" />
                    </div>
                    
                    {/* Label */}
                    <span className={cn(
                      "text-[10px] font-medium transition-all duration-200",
                      categorySheetOpen ? "text-amber-700 font-semibold" : "text-slate-500"
                    )}>
                      {item.name}
                    </span>
                    
                    {/* Active indicator dot */}
                    {categorySheetOpen && (
                      <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500" />
                    )}
                  </button>
                );
              }

              // Regular nav items
              return (
                <Link
                  key={item.name}
                  href={item.href!}
                  className={cn(
                    "flex flex-col items-center justify-center w-16 h-14 relative transition-all duration-200",
                    isActive ? "text-amber-600" : "text-slate-400 hover:text-amber-500"
                  )}
                  aria-label={`${item.name}${item.showBadge && totalItems > 0 ? `, ${totalItems} item` : ''}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {/* Icon container */}
                  <div className={cn(
                    "relative p-2 rounded-xl transition-all duration-200",
                    isActive && "bg-amber-50"
                  )}>
                    <Icon className={cn(
                      "h-5 w-5 transition-all duration-200",
                      isActive && "scale-110"
                    )} aria-hidden="true" />
                    
                    {/* Badge for cart */}
                    {item.showBadge && totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center font-bold shadow-md animate-bounce">
                        {totalItems > 9 ? "9+" : totalItems}
                      </span>
                    )}
                  </div>
                  
                  {/* Label */}
                  <span className={cn(
                    "text-[10px] font-medium transition-all duration-200",
                    isActive ? "text-amber-700 font-semibold" : "text-slate-500"
                  )}>
                    {item.name}
                  </span>
                  
                  {/* Active indicator dot */}
                  {isActive && (
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-500" />
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Safe area padding for iOS */}
        <div className="h-safe-area-inset-bottom bg-white" />
      </nav>

      {/* Category Sheet */}
      <CategorySheet
        open={categorySheetOpen}
        onOpenChange={setCategorySheetOpen}
      />
    </>
  );
}
