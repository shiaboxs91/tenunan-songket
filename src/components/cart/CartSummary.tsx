"use client";

import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/utils";
import type { CartSummary as CartSummaryType } from "@/lib/supabase/cart";

interface CartSummaryProps {
  summary: CartSummaryType;
  showShipping?: boolean;
  showTax?: boolean;
  taxRate?: number;
  shippingCost?: number;
  showCheckoutButton?: boolean;
  checkoutHref?: string;
  compact?: boolean;
  className?: string;
}

/**
 * Cart summary component showing subtotal, shipping, tax, and total
 */
export function CartSummary({
  summary,
  showShipping = true,
  showTax = true,
  taxRate = 0.11,
  shippingCost,
  showCheckoutButton = true,
  checkoutHref = "/checkout",
  compact = false,
  className = "",
}: CartSummaryProps) {
  const shipping = shippingCost ?? (summary.itemCount > 0 ? 50000 : 0);
  const tax = showTax ? Math.round(summary.subtotal * taxRate) : 0;
  const total = summary.subtotal + (showShipping ? shipping : 0) + tax;

  if (compact) {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatPrice(summary.subtotal)}</span>
        </div>
        {showShipping && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Ongkir</span>
            <span>{formatPrice(shipping)}</span>
          </div>
        )}
        <hr className="my-2" />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span className="text-primary">{formatPrice(total)}</span>
        </div>
      </div>
    );
  }

  return (
    <Card className={`sticky top-24 ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ShoppingBag className="h-5 w-5" />
          Ringkasan Pesanan
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            Subtotal ({summary.itemCount} item)
          </span>
          <span>{formatPrice(summary.subtotal)}</span>
        </div>
        
        {showShipping && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Ongkos Kirim</span>
            <span>{formatPrice(shipping)}</span>
          </div>
        )}
        
        {showTax && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              Pajak (PPN {Math.round(taxRate * 100)}%)
            </span>
            <span>{formatPrice(tax)}</span>
          </div>
        )}
        
        {summary.discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Diskon</span>
            <span>-{formatPrice(summary.discount)}</span>
          </div>
        )}
        
        <hr />
        
        <div className="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span className="text-primary">{formatPrice(total)}</span>
        </div>
        
        <p className="text-xs text-muted-foreground">
          * Ongkos kirim dan pajak bersifat estimasi
        </p>
      </CardContent>
      
      {showCheckoutButton && summary.itemCount > 0 && (
        <CardFooter>
          <Button asChild className="w-full" size="lg">
            <Link href={checkoutHref}>
              Lanjut ke Checkout
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
