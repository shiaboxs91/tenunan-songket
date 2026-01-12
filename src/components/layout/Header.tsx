"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, ShoppingCart, User, X, Home, Grid3X3, Info, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/cart/CartProvider";
import { useScrollDirection } from "@/hooks/useScrollDirection";

const navigation = [
  { name: "Beranda", href: "/", icon: Home },
  { name: "Produk", href: "/products", icon: Grid3X3 },
  { name: "Tentang Kami", href: "/tentang-kami", icon: Info },
  { name: "Cara Order", href: "/cara-order", icon: ClipboardList },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchExpanded, setMobileSearchExpanded] = useState(false);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();
  const { scrollDirection, isScrolled } = useScrollDirection({ threshold: 50 });
  const isCompact = scrollDirection === "down" && isScrolled && !mobileSearchExpanded;

  useEffect(() => {
    if (mobileSearchExpanded && mobileSearchInputRef.current) {
      mobileSearchInputRef.current.focus();
    }
  }, [mobileSearchExpanded]);

  const handleMobileSearchToggle = () => {
    setMobileSearchExpanded(true);
  };

  const handleMobileSearchClose = () => {
    setMobileSearchExpanded(false);
    setSearchQuery("");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileSearchExpanded(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Elegant gold accent line */}
      <div className="h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600" />
      
      {/* Main header */}
      <div className={cn(
        "bg-white/95 backdrop-blur-md border-b border-amber-100/50",
        "transition-all duration-300 ease-in-out"
      )}>
        <nav 
          className={cn(
            "mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8",
            "transition-all duration-300 ease-in-out",
            isCompact ? "h-14" : "h-20"
          )}
          aria-label="Navigasi utama"
        >
          {/* Logo */}
          <Link 
            href="/" 
            className={cn(
              "flex items-center space-x-2 transition-all duration-300",
              isCompact ? "scale-90 origin-left" : "scale-100"
            )}
            aria-label="TenunanSongket - Kembali ke beranda"
          >
            <Image
              src="https://tenunansongket.com/wp-content/uploads/2020/08/ts-4.png"
              alt="TenunanSongket Logo"
              width={isCompact ? 140 : 180}
              height={isCompact ? 36 : 48}
              className={cn(
                "object-contain transition-all duration-300",
                isCompact ? "h-9" : "h-12"
              )}
              priority
            />
          </Link>

          {/* Desktop Search */}
          <form
            onSubmit={handleSearch}
            className={cn(
              "hidden flex-1 max-w-md mx-8 md:flex transition-all duration-300",
              isCompact && "md:hidden"
            )}
          >
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-600/60" />
              <Input
                type="search"
                placeholder="Cari produk songket..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 border-amber-200 focus:border-amber-400 focus:ring-amber-400/20"
              />
            </div>
          </form>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {isCompact && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleMobileSearchToggle}
                aria-label="Buka pencarian"
                className="text-amber-700 hover:text-amber-900 hover:bg-amber-50"
              >
                <Search className="h-5 w-5" />
              </Button>
            )}
            
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-all",
                    isActive
                      ? "text-amber-700 bg-amber-50"
                      : "text-slate-600 hover:text-amber-700 hover:bg-amber-50/50"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}

            {/* Cart */}
            <Link href="/cart" className="relative">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-slate-600 hover:text-amber-700 hover:bg-amber-50"
                aria-label={`Keranjang belanja${totalItems > 0 ? `, ${totalItems} item` : ''}`}
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-500 text-xs text-white flex items-center justify-center font-medium">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </Button>
            </Link>

            {/* Account */}
            <Link href="/account">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-slate-600 hover:text-amber-700 hover:bg-amber-50"
                aria-label="Akun saya"
              >
                <User className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu */}
          <div className="flex items-center space-x-2 md:hidden">
            {!mobileSearchExpanded && (
              <Button 
                variant="ghost" 
                size="icon"
                onClick={handleMobileSearchToggle}
                aria-label="Buka pencarian"
                className="text-amber-700"
              >
                <Search className="h-5 w-5" />
              </Button>
            )}

            {!mobileSearchExpanded && (
              <Link href="/cart" className="relative">
                <Button variant="ghost" size="icon" className="text-amber-700">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-500 text-xs text-white flex items-center justify-center font-medium">
                      {totalItems > 99 ? "99+" : totalItems}
                    </span>
                  )}
                </Button>
              </Link>
            )}

            {!mobileSearchExpanded && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-amber-700"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Mobile Expanded Search */}
          {mobileSearchExpanded && (
            <div className="absolute inset-0 flex items-center px-4 bg-white">
              <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-600/60" />
                  <Input
                    ref={mobileSearchInputRef}
                    type="search"
                    placeholder="Cari produk songket..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10 w-full border-amber-200"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleMobileSearchClose}
                  className="text-amber-700"
                >
                  Batal
                </Button>
              </form>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
