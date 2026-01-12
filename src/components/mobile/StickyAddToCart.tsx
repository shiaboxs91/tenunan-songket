"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Heart, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/CartProvider";
import { useToast } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/utils";
import type { Product } from "@/lib/types";

interface StickyAddToCartProps {
  product: Product;
  showWhenScrolled?: boolean;
}

export function StickyAddToCart({ product, showWhenScrolled = true }: StickyAddToCartProps) {
  const [isVisible, setIsVisible] = useState(!showWhenScrolled);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addItem } = useCart();
  const { showToast } = useToast();

  useEffect(() => {
    if (!showWhenScrolled) return;

    const handleScroll = () => {
      // Show after scrolling 300px
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showWhenScrolled]);

  const handleAddToCart = () => {
    addItem(product, quantity);
    showToast(`${quantity}x ${product.title} ditambahkan ke keranjang`, "success");
    setQuantity(1);
  };

  const decreaseQty = () => setQuantity(q => Math.max(1, q - 1));
  const increaseQty = () => setQuantity(q => Math.min(10, q + 1));

  return (
    <div
      className={cn(
        "fixed bottom-20 left-0 right-0 z-40 md:hidden",
        "transition-all duration-300 ease-out",
        isVisible 
          ? "translate-y-0 opacity-100" 
          : "translate-y-full opacity-0 pointer-events-none"
      )}
    >
      {/* Background with blur */}
      <div className="absolute inset-0 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]" />

      {/* Content */}
      <div className="relative px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Price */}
          <div className="flex-shrink-0">
            <p className="text-lg font-bold text-amber-600">{formatPrice(product.price * quantity)}</p>
            {quantity > 1 && (
              <p className="text-[10px] text-slate-400">{formatPrice(product.price)}/pcs</p>
            )}
          </div>

          {/* Quantity selector */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            <button
              onClick={decreaseQty}
              className="w-8 h-8 rounded-md flex items-center justify-center text-slate-600 hover:bg-white active:scale-95 transition-all"
              aria-label="Kurangi jumlah"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-semibold text-slate-800">{quantity}</span>
            <button
              onClick={increaseQty}
              className="w-8 h-8 rounded-md flex items-center justify-center text-slate-600 hover:bg-white active:scale-95 transition-all"
              aria-label="Tambah jumlah"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Wishlist button */}
          <button
            onClick={() => {
              setIsWishlisted(!isWishlisted);
              showToast(
                isWishlisted ? "Dihapus dari wishlist" : "Ditambahkan ke wishlist",
                "success"
              );
            }}
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center border transition-all",
              isWishlisted 
                ? "bg-rose-50 border-rose-200 text-rose-500" 
                : "bg-white border-slate-200 text-slate-400 hover:text-rose-500"
            )}
            aria-label={isWishlisted ? "Hapus dari wishlist" : "Tambah ke wishlist"}
          >
            <Heart className={cn("w-5 h-5", isWishlisted && "fill-current")} />
          </button>

          {/* Add to cart button */}
          <Button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="flex-1 h-11 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {product.inStock ? "Tambah" : "Stok Habis"}
          </Button>
        </div>
      </div>
    </div>
  );
}
