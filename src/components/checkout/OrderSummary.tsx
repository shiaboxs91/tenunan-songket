"use client";

import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import type { ShippingOption } from "@/lib/supabase/shipping";

interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product?: {
    id: string;
    title: string;
    price: number;
    sale_price?: number | null;
    slug: string;
    images?: Array<{ url: string; is_primary: boolean }>;
  };
}

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  shipping?: ShippingOption | null;
  discount?: number;
  couponCode?: string;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}

export function OrderSummary({
  items,
  subtotal,
  shipping,
  discount = 0,
  couponCode,
}: OrderSummaryProps) {
  const shippingCost = shipping?.cost || 0;
  const total = subtotal - discount + shippingCost;

  return (
    <div className="space-y-4">
      {/* Items */}
      <div className="space-y-3">
        <h3 className="font-medium flex items-center gap-2">
          <ShoppingBag className="h-4 w-4" />
          Pesanan ({items.length} item)
        </h3>
        
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {items.map((item) => {
            const product = item.product;
            if (!product) return null;
            
            const price = product.sale_price || product.price;
            const primaryImage = product.images?.find(img => img.is_primary)?.url || 
                                product.images?.[0]?.url;
            
            return (
              <div key={item.id} className="flex gap-3">
                <div className="h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
                  {primaryImage ? (
                    <Image
                      src={primaryImage}
                      alt={product.title}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium line-clamp-2">{product.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.quantity} x {formatPrice(price)}
                  </p>
                </div>
                <p className="text-sm font-medium flex-shrink-0">
                  {formatPrice(price * item.quantity)}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Summary */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Diskon {couponCode && `(${couponCode})`}</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Ongkos Kirim</span>
          <span>
            {shipping ? formatPrice(shippingCost) : '-'}
          </span>
        </div>
        
        {shipping && (
          <p className="text-xs text-muted-foreground">
            {shipping.service} • {shipping.estimatedDays}
          </p>
        )}
      </div>

      <Separator />

      {/* Total */}
      <div className="flex justify-between items-center">
        <span className="font-semibold">Total</span>
        <span className="text-xl font-bold text-primary">
          {formatPrice(total)}
        </span>
      </div>
    </div>
  );
}
