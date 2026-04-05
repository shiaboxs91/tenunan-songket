"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Heart, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/CartProvider";
import { useToast } from "@/components/ui/Toast";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/utils";

interface StickyProductCTAProps {
  product: Product;
}

export function StickyProductCTA({ product }: StickyProductCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addItem } = useCart();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling 200px
      setIsVisible(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAddToCart = () => {
    if (product.inStock) {
      for (let i = 0; i < quantity; i++) {
        addItem(product, 1);
      }
      showToast(`${quantity}x ${product.title} ditambahkan ke keranjang`, "success");
      setQuantity(1);
    }
  };

  const handleBuyNow = () => {
    if (product.inStock) {
      for (let i = 0; i < quantity; i++) {
        addItem(product, 1);
      }
      router.push("/checkout");
    }
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
        <div className="flex items-center gap-2">
          {/* Price */}
          <div className="flex-shrink-0 min-w-0">
            <p className="text-base font-bold text-amber-600 truncate">{formatPrice(product.price * quantity)}</p>
            {quantity > 1 && (
              <p className="text-[10px] text-slate-400">{formatPrice(product.price)}/pcs</p>
            )}
          </div>

          {/* Quantity selector */}
          <div className="flex items-center gap-0.5 bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={decreaseQty}
              className="w-7 h-7 rounded-md flex items-center justify-center text-slate-600 hover:bg-white active:scale-95 transition-all"
              aria-label="Kurangi jumlah"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-6 text-center text-sm font-semibold text-slate-800">{quantity}</span>
            <button
              onClick={increaseQty}
              className="w-7 h-7 rounded-md flex items-center justify-center text-slate-600 hover:bg-white active:scale-95 transition-all"
              aria-label="Tambah jumlah"
            >
              <Plus className="w-3.5 h-3.5" />
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
              "w-9 h-9 rounded-full flex items-center justify-center border transition-all flex-shrink-0",
              isWishlisted 
                ? "bg-rose-50 border-rose-200 text-rose-500" 
                : "bg-white border-slate-200 text-slate-400 hover:text-rose-500"
            )}
            aria-label={isWishlisted ? "Hapus dari wishlist" : "Tambah ke wishlist"}
          >
            <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
          </button>

          {/* Add to cart button */}
          <Button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            size="sm"
            className="h-9 px-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all"
          >
            <ShoppingCart className="w-4 h-4 mr-1" />
            <span className="hidden xs:inline">Keranjang</span>
          </Button>

          {/* Buy now button */}
          <Button
            onClick={handleBuyNow}
            disabled={!product.inStock}
            size="sm"
            className="h-9 px-3 bg-slate-800 hover:bg-slate-900 text-white font-semibold active:scale-[0.98] transition-all"
          >
            Beli
          </Button>
        </div>
      </div>
    </div>
  );
}
