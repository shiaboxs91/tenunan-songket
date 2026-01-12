"use client";

import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/CartProvider";
import { Product } from "@/lib/types";

interface StickyProductCTAProps {
  product: Product;
}

export function StickyProductCTA({ product }: StickyProductCTAProps) {
  const { addItem } = useCart();
  const router = useRouter();

  const handleAddToCart = () => {
    if (product.inStock) {
      addItem(product, 1);
    }
  };

  const handleBuyNow = () => {
    if (product.inStock) {
      addItem(product, 1);
      router.push("/checkout");
    }
  };

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t p-3 md:hidden">
      <div className="flex gap-3 max-w-lg mx-auto">
        <Button
          variant="outline"
          className="flex-1"
          onClick={handleAddToCart}
          disabled={!product.inStock}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {product.inStock ? "Keranjang" : "Stok Habis"}
        </Button>
        <Button
          className="flex-1"
          onClick={handleBuyNow}
          disabled={!product.inStock}
        >
          {product.inStock ? "Beli Sekarang" : "Stok Habis"}
        </Button>
      </div>
    </div>
  );
}
