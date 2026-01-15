"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import type { CartItem as CartItemType } from "@/lib/supabase/cart";

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  compact?: boolean;
}

/**
 * Cart item component that works with Supabase cart data format
 */
export function CartItem({
  item,
  onUpdateQuantity,
  onRemove,
  compact = false,
}: CartItemProps) {
  const product = item.product;
  const price = Number(product?.sale_price || product?.price || 0);
  const primaryImage = product?.images?.find((img) => img.is_primary)?.url 
    || product?.images?.[0]?.url 
    || "/images/placeholder-product.svg";
  const title = product?.title || "Produk";
  const slug = product?.slug || "";
  const stock = product?.stock || 0;

  const handleDecrease = () => {
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (item.quantity < Math.min(99, stock)) {
      onUpdateQuantity(item.id, item.quantity + 1);
    }
  };

  if (compact) {
    return (
      <div className="flex gap-3 py-3 border-b last:border-b-0">
        <Link
          href={`/products/${slug}`}
          className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted"
        >
          <Image
            src={primaryImage}
            alt={title}
            fill
            className="object-cover"
            sizes="64px"
          />
        </Link>

        <div className="flex flex-1 flex-col min-w-0">
          <Link
            href={`/products/${slug}`}
            className="font-medium text-sm hover:text-primary transition-colors line-clamp-1"
          >
            {title}
          </Link>
          
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDecrease}
                disabled={item.quantity <= 1}
                className="h-6 w-6"
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="w-6 text-center text-xs">{item.quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleIncrease}
                disabled={item.quantity >= Math.min(99, stock)}
                className="h-6 w-6"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
            
            <span className="text-sm font-semibold text-primary">
              {formatPrice(price * item.quantity)}
            </span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => onRemove(item.id)}
          className="h-6 w-6 text-muted-foreground hover:text-destructive flex-shrink-0"
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-3 sm:gap-4 py-4 border-b last:border-b-0">
      <Link
        href={`/products/${slug}`}
        className="relative h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-md bg-muted"
      >
        <Image
          src={primaryImage}
          alt={title}
          fill
          className="object-cover"
          sizes="96px"
        />
      </Link>

      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <div>
            <Link
              href={`/products/${slug}`}
              className="font-medium text-sm hover:text-primary transition-colors line-clamp-2"
            >
              {title}
            </Link>
            {stock <= 5 && stock > 0 && (
              <p className="text-xs text-orange-500 mt-1">
                Sisa {stock} item
              </p>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(item.id)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-end justify-between mt-auto">
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDecrease}
              disabled={item.quantity <= 1}
              className="h-8 w-8 rounded-none"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-10 text-center text-sm">{item.quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleIncrease}
              disabled={item.quantity >= Math.min(99, stock)}
              className="h-8 w-8 rounded-none"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <div className="text-right">
            <p className="font-semibold text-primary">
              {formatPrice(price * item.quantity)}
            </p>
            {item.quantity > 1 && (
              <p className="text-xs text-muted-foreground">
                {formatPrice(price)} × {item.quantity}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
