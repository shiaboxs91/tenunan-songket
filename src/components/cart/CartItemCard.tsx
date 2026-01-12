"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItem } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export function CartItemCard({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemCardProps) {
  const { product, quantity } = item;

  const handleDecrease = () => {
    if (quantity > 1) {
      onUpdateQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < 99) {
      onUpdateQuantity(quantity + 1);
    }
  };

  return (
    <div className="flex gap-3 sm:gap-4 py-4 border-b last:border-b-0">
      {/* Product Image */}
      <Link
        href={`/products/${product.slug}`}
        className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted"
      >
        <Image
          src={product.image || "/images/placeholder-product.jpg"}
          alt={product.title}
          fill
          className="object-cover"
          sizes="96px"
        />
      </Link>

      {/* Product Info */}
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <div>
            <Link
              href={`/products/${product.slug}`}
              className="font-medium text-sm hover:text-primary transition-colors line-clamp-2"
            >
              {product.title}
            </Link>
            <p className="text-xs text-muted-foreground mt-1">
              {product.category}
            </p>
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-end justify-between mt-auto">
          {/* Quantity Stepper */}
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDecrease}
              disabled={quantity <= 1}
              className="h-8 w-8 rounded-none"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-10 text-center text-sm">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleIncrease}
              disabled={quantity >= 99}
              className="h-8 w-8 rounded-none"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Price */}
          <div className="text-right">
            <p className="font-semibold text-primary">
              {formatPrice(product.price * quantity)}
            </p>
            {quantity > 1 && (
              <p className="text-xs text-muted-foreground">
                {formatPrice(product.price)} × {quantity}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
