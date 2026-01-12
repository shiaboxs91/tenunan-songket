"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, ShoppingCart, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/cart/CartProvider";
import { CategorySheet } from "./CategorySheet";
import { getCategories } from "@/lib/products";
import productsData from "@/data/products.snapshot.json";
import type { Product } from "@/lib/types";

type NavItem = {
  name: string;
  href?: string;
  icon: typeof Home;
  showBadge?: boolean;
  isCategory?: boolean;
};

const navItems: NavItem[] = [
  { name: "Beranda", href: "/", icon: Home },
  { name: "Kategori", icon: LayoutGrid, isCategory: true },
  { name: "Keranjang", href: "/cart", icon: ShoppingCart, showBadge: true },
  { name: "Akun", href: "/account", icon: User },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const [categorySheetOpen, setCategorySheetOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    const cats = getCategories(productsData as unknown as Product[]);
    setCategories(cats);
  }, []);

  const handleCategorySelect = (category: string) => {
    console.log("Selected category:", category);
  };

  return (
    <>
      <nav 
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        aria-label="Navigasi mobile"
      >
        {/* Top gold accent line */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
        
        {/* Nav container with subtle pattern */}
        <div className="relative bg-white/95 backdrop-blur-md border-t border-amber-100">
          {/* Subtle songket pattern */}
          <div 
            className="absolute inset-0 opacity-[0.02] pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23B8860B'%3E%3Cpath d='M10 0L11 1L10 2L9 1L10 0z'/%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
          
          <div className="relative flex items-center justify-around h-16 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href 
                ? pathname === item.href || 
                  (item.href === "/products" && pathname.startsWith("/products"))
                : false;

              // Handle category button
              if (item.isCategory) {
                return (
                  <button
                    key={item.name}
                    onClick={() => setCategorySheetOpen(true)}
                    className={cn(
                      "flex flex-col items-center justify-center flex-1 h-full relative transition-all",
                      "text-slate-500 hover:text-amber-600"
                    )}
                    aria-label="Buka kategori produk"
                  >
                    <div className="relative p-1.5">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className="text-[10px] mt-0.5 font-medium">{item.name}</span>
                  </button>
                );
              }

              return (
                <Link
                  key={item.name}
                  href={item.href!}
                  className={cn(
                    "flex flex-col items-center justify-center flex-1 h-full relative transition-all",
                    isActive ? "text-amber-600" : "text-slate-500 hover:text-amber-600"
                  )}
                  aria-label={`${item.name}${item.showBadge && totalItems > 0 ? `, ${totalItems} item` : ''}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {/* Active indicator - cultural diamond pattern */}
                  {isActive && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 flex items-center gap-0.5">
                      <div className="w-1 h-1 rotate-45 bg-amber-400" />
                      <div className="w-6 h-0.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 rounded-full" />
                      <div className="w-1 h-1 rotate-45 bg-amber-400" />
                    </div>
                  )}
                  
                  <div className={cn(
                    "relative p-1.5 rounded-lg transition-all",
                    isActive && "bg-amber-50"
                  )}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    {item.showBadge && totalItems > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-amber-500 text-[10px] text-white flex items-center justify-center font-medium shadow-sm">
                        {totalItems > 9 ? "9+" : totalItems}
                      </span>
                    )}
                  </div>
                  <span className={cn(
                    "text-[10px] mt-0.5 font-medium transition-all",
                    isActive && "text-amber-700"
                  )}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <CategorySheet
        open={categorySheetOpen}
        onOpenChange={setCategorySheetOpen}
        categories={categories}
        onSelectCategory={handleCategorySelect}
      />
    </>
  );
}
