"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/CartProvider";
import { Product } from "@/lib/types";

interface AddToCartButtonProps {
  product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const router = useRouter();

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

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    router.push("/checkout");
  };

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
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
          <span className="w-12 text-center">{quantity}</span>
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

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          size="lg"
          className="flex-1"
          onClick={handleAddToCart}
          disabled={!product.inStock}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Tambah ke Keranjang
        </Button>
        <Button
          size="lg"
          className="flex-1"
          onClick={handleBuyNow}
          disabled={!product.inStock}
        >
          Beli Sekarang
        </Button>
      </div>
    </div>
  );
}
