"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Search, ShoppingCart, User, X, Home, Grid3X3, Info, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/cart/CartProvider";
import { useScrollDirection } from "@/hooks/useScrollDirection";

const navigation = [
  { name: "Beranda", href: "/", icon: Home },
  { name: "Produk", href: "/products", icon: Grid3X3 },
  { name: "Tentang", href: "#", icon: Info },
  { name: "Kontak", href: "#", icon: Phone },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchExpanded, setMobileSearchExpanded] = useState(false);
  const mobileSearchInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { totalItems } = useCart();
  
  // Scroll direction detection for compact header (Requirements: 9.1, 9.3)
  const { scrollDirection, isScrolled } = useScrollDirection({ threshold: 50 });
  
  // Compact mode: active when scrolled down and not in search mode
  const isCompact = scrollDirection === "down" && isScrolled && !mobileSearchExpanded;

  // Focus input when mobile search expands
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
    <header 
      className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        "transition-all duration-300 ease-in-out" // Smooth transition (Requirement 9.4)
      )}
    >
      {/* Container with max-width for desktop */}
      <nav 
        className={cn(
          "mx-auto max-w-7xl flex items-center justify-between px-4 sm:px-6 lg:px-8",
          "transition-all duration-300 ease-in-out",
          isCompact ? "h-12" : "h-16" // Compact height on scroll down (Requirement 9.1)
        )}
        aria-label="Navigasi utama"
      >
        {/* Logo - with image */}
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
            width={isCompact ? 120 : 150}
            height={isCompact ? 32 : 40}
            className={cn(
              "object-contain transition-all duration-300",
              isCompact ? "h-8" : "h-10"
            )}
            priority
          />
        </Link>

        {/* Desktop Search - hidden in compact mode */}
        <form
          onSubmit={handleSearch}
          className={cn(
            "hidden flex-1 max-w-md mx-8 md:flex transition-all duration-300",
            isCompact && "md:hidden" // Hide search bar in compact mode (Requirement 9.2)
          )}
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari produk songket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
            />
          </div>
        </form>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-1">
          {/* Search icon - shown only in compact mode (Requirement 9.2, 9.5) */}
          {isCompact && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleMobileSearchToggle}
              aria-label="Buka pencarian"
              className="transition-opacity duration-300"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
          
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-muted",
                  pathname === item.href
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.name}
              </Link>
            );
          })}

          {/* Cart */}
          <Link href="/cart" className="relative">
            <Button variant="ghost" size="icon" aria-label={`Keranjang belanja${totalItems > 0 ? `, ${totalItems} item` : ''}`}>
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center" aria-hidden="true">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </Button>
          </Link>

          {/* Account */}
          <Link href="/account">
            <Button variant="ghost" size="icon" aria-label="Akun saya">
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center space-x-2 md:hidden">
          {/* Mobile Search Icon - shows when search is not expanded */}
          {!mobileSearchExpanded && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleMobileSearchToggle}
              aria-label="Buka pencarian"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}

          {/* Mobile Cart */}
          {!mobileSearchExpanded && (
            <Link href="/cart" className="relative">
              <Button variant="ghost" size="icon" aria-label={`Keranjang belanja${totalItems > 0 ? `, ${totalItems} item` : ''}`}>
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs text-primary-foreground flex items-center justify-center" aria-hidden="true">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </Button>
            </Link>
          )}

          {/* Mobile Menu Button */}
          {!mobileSearchExpanded && (
            <Button 
              variant="ghost" 
              size="icon" 
              aria-label="Buka menu navigasi"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Mobile Expanded Search Bar - overlays header content */}
        {mobileSearchExpanded && (
          <div className={cn(
            "absolute inset-0 flex items-center px-4 bg-background",
            "transition-all duration-300"
          )}>
            <form onSubmit={handleSearch} className="flex-1 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  ref={mobileSearchInputRef}
                  type="search"
                  placeholder="Cari produk songket..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={cn(
                    "pl-10 pr-10 w-full transition-all duration-300",
                    isCompact ? "h-8" : "h-10"
                  )}
                  autoComplete="off"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Hapus pencarian"
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
                className="shrink-0"
              >
                Batal
              </Button>
            </form>
          </div>
        )}
      </nav>
    </header>
  );
}
