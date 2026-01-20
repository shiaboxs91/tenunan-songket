"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingBag, ArrowRight, Loader2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CartItem } from "@/components/cart/CartItem";
import { CartSummary } from "@/components/cart/CartSummary";
import { useCart } from "@/components/cart/CartProvider";
import { createClient } from "@/lib/supabase/client";
import { getActiveShippingServices, type ShippingService } from "@/lib/supabase/shipping-client";

export default function CartPage() {
  const { items, updateQuantity, removeItem, summary, isLoading, error } = useCart();
  const [userId, setUserId] = useState<string | null>(null);
  const [shippingServices, setShippingServices] = useState<ShippingService[]>([]);
  const [estimatedShipping, setEstimatedShipping] = useState<number>(0);
  const [totalWeight, setTotalWeight] = useState<number>(0);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string;
    code: string;
    discountAmount: number;
  } | null>(null);

  // Get user ID and Shipping Services
  useEffect(() => {
    const initData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);

      const services = await getActiveShippingServices();
      setShippingServices(services);
    };
    initData();
  }, []);

  // Calculate total weight and estimated shipping
  useEffect(() => {
    if (items.length > 0) {
      // Calculate total weight (default 0.5kg if missing)
      const weight = items.reduce((acc, item) => {
        const itemWeight = (item.product as any).weight || 0.5;
        return acc + (itemWeight * item.quantity);
      }, 0);
      setTotalWeight(weight);

      // Estimate shipping based on first available service
      if (shippingServices.length > 0) {
        const service = shippingServices[0];
        // Simple calculation: Base Cost + (Cost Per Kg * Weight)
        // Fallback checks for cost_per_kg or uses 10% of base cost rule
        const costPerKg = service.cost_per_kg ?? (service.base_cost * 0.1);
        const shippingCost = service.base_cost + (costPerKg * weight);
        setEstimatedShipping(Math.round(shippingCost));
      } else {
        // Fallback if no services loaded yet
        setEstimatedShipping(50000); 
      }
    } else {
      setTotalWeight(0);
      setEstimatedShipping(0);
    }
  }, [items, shippingServices]);

  const handleCouponApplied = (couponId: string, discountAmount: number, code: string) => {
    setAppliedCoupon({
      id: couponId,
      code,
      discountAmount
    });
  };

  const handleCouponRemoved = () => {
    setAppliedCoupon(null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Memuat keranjang...</span>
        </div>
      </div>
    );
  }

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

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex justify-between items-center">
                <span>{summary.itemCount} Produk</span>
                <span className="text-sm font-normal text-muted-foreground flex items-center gap-1">
                  <Truck className="h-4 w-4" />
                  Total Berat: {totalWeight.toFixed(1)} kg
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeItem}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <CartSummary 
            summary={summary}
            showCoupon={true}
            userId={userId}
            shippingCost={estimatedShipping}
            totalWeight={totalWeight}
            appliedCoupon={appliedCoupon ? {
              code: appliedCoupon.code,
              discountAmount: appliedCoupon.discountAmount
            } : undefined}
            onCouponApplied={handleCouponApplied}
            onCouponRemoved={handleCouponRemoved}
          />
        </div>
      </div>
    </div>
  );
}
