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
    // Get categories from products data - productsData is directly an array
    const cats = getCategories(productsData as unknown as Product[]);
    setCategories(cats);
  }, []);

  const handleCategorySelect = (category: string) => {
    // Navigation is handled inside CategorySheet
    console.log("Selected category:", category);
  };

  return (
    <>
      <nav 
        className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur border-t md:hidden"
        aria-label="Navigasi mobile"
      >
        <div className="flex items-center justify-around h-16 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href 
              ? pathname === item.href || 
                (item.href === "/products" && pathname.startsWith("/products"))
              : false;

            // Handle category button separately
            if (item.isCategory) {
              return (
                <button
                  key={item.name}
                  onClick={() => setCategorySheetOpen(true)}
                  className={cn(
                    "flex flex-col items-center justify-center flex-1 h-full relative transition-colors",
                    "text-muted-foreground hover:text-primary"
                  )}
                  aria-label="Buka kategori produk"
                >
                  <div className="relative">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <span className="text-[10px] mt-1 font-medium">{item.name}</span>
                </button>
              );
            }

            return (
              <Link
                key={item.name}
                href={item.href!}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full relative transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
                aria-label={`${item.name}${item.showBadge && totalItems > 0 ? `, ${totalItems} item` : ''}`}
                aria-current={isActive ? "page" : undefined}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  {item.showBadge && totalItems > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center font-medium" aria-hidden="true">
                      {totalItems > 9 ? "9+" : totalItems}
                    </span>
                  )}
                </div>
                <span className="text-[10px] mt-1 font-medium">{item.name}</span>
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full" aria-hidden="true" />
                )}
              </Link>
            );
          })}
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
