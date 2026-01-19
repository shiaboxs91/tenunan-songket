"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Minus, Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/CartProvider";
import { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProductActionsProps {
  product: Product;
  variants?: string[];
}

export function ProductActions({ product, variants = [] }: ProductActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const { addItem } = useCart();
  const router = useRouter();

  // Initialize with first variant if not set in URL, but only if variants exist
  if (variants.length > 0 && !selectedVariant) {
    // We don't auto-set URL param on load to keep URL clean, 
    // but handled in logic. Or we could set it:
    // setSelectedVariant(variants[0]);
  }

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < 99) {
      setQuantity(quantity + 1);
    }
  };

  const handleAddToCart = async () => {
    try {
      if (variants.length > 0 && !selectedVariant) {
        toast.error("Silakan pilih motif terlebih dahulu");
        return;
      }

      setIsAdding(true);
      // Note: Backend currently doesn't support saving variant/option
      // We pass the product object.
      await addItem(product, quantity);
      
      toast.success("Berhasil ditambahkan ke keranjang");
      
    } catch (error) {
      console.error("Failed to add to cart", error);
      toast.error("Gagal menambahkan ke keranjang");
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    try {
        if (variants.length > 0 && !selectedVariant) {
            toast.error("Silakan pilih motif terlebih dahulu");
            return;
        }
        setIsAdding(true);
        await addItem(product, quantity);
        router.push("/cart");
    } catch (error) {
        console.error("Failed to buy now", error);
    } finally {
        setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6">
       {/* Variant Selector */}
       {variants.length > 0 && (
         <div className="space-y-3">
            <label className="text-sm font-medium">Pilih Motif</label>
            <div className="flex flex-wrap gap-2">
              {variants.map((motif) => (
                <button
                  key={motif}
                  onClick={() => setSelectedVariant(motif)}
                  className={cn(
                    "px-4 py-2 text-sm border rounded-md transition-all",
                    selectedVariant === motif
                      ? "border-amber-600 text-amber-700 bg-amber-50 ring-1 ring-amber-600"
                      : "border-slate-200 hover:border-amber-600/50 text-slate-700"
                  )}
                >
                  {motif}
                </button>
              ))}
            </div>
         </div>
       )}

       {/* Quantity & Actions */}
       <div className="space-y-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Jumlah</span>
            <div className="flex items-center border rounded-md">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDecrease}
                disabled={quantity <= 1 || !product.inStock}
                className="h-10 w-10 rounded-none"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-12 text-center select-none">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleIncrease}
                disabled={quantity >= 99 || !product.inStock}
                className="h-10 w-10 rounded-none"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 border-amber-600 text-amber-700 hover:bg-amber-50"
              onClick={handleAddToCart}
              disabled={!product.inStock || isAdding}
            >
              {isAdding ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                  <ShoppingCart className="mr-2 h-4 w-4" />
              )}
              Tambah ke Keranjang
            </Button>
            <Button
              size="lg"
              className="flex-1 bg-amber-700 hover:bg-amber-800"
              onClick={handleBuyNow}
              disabled={!product.inStock || isAdding}
            >
              Beli Sekarang
            </Button>
          </div>
       </div>
    </div>
  );
}
