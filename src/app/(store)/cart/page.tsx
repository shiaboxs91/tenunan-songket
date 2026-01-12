"use client";

import Link from "next/link";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CartItemCard } from "@/components/cart/CartItemCard";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/utils";

// Demo shipping and tax values
const DEMO_SHIPPING = 50000;
const DEMO_TAX_RATE = 0.11; // 11% PPN

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();

  const shipping = items.length > 0 ? DEMO_SHIPPING : 0;
  const tax = Math.round(subtotal * DEMO_TAX_RATE);
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-muted mb-6">
            <ShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Keranjang Kosong</h1>
          <p className="text-muted-foreground mb-6">
            Belum ada produk di keranjang belanja Anda. Yuk mulai belanja!
          </p>
          <Button asChild>
            <Link href="/products">
              Mulai Belanja
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Keranjang Belanja</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {items.length} Produk
              </CardTitle>
            </CardHeader>
            <CardContent>
              {items.map((item) => (
                <CartItemCard
                  key={item.product.id}
                  item={item}
                  onUpdateQuantity={(qty) => updateQuantity(item.product.id, qty)}
                  onRemove={() => removeItem(item.product.id)}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ongkos Kirim</span>
                <span>{formatPrice(shipping)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pajak (PPN 11%)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <hr />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">{formatPrice(total)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                * Ongkos kirim dan pajak bersifat estimasi (demo)
              </p>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full" size="lg">
                <Link href="/checkout">
                  Lanjut ke Checkout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
