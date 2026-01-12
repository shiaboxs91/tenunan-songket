"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Check, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckoutStepper } from "@/components/checkout/CheckoutStepper";
import { AddressForm } from "@/components/checkout/AddressForm";
import { useCart } from "@/components/cart/CartProvider";
import { formatPrice } from "@/lib/utils";
import { ShippingAddress, ShippingOption } from "@/lib/types";

// Demo shipping options
const SHIPPING_OPTIONS: ShippingOption[] = [
  { id: "regular", name: "Reguler", price: 30000, estimatedDays: "3-5 hari" },
  { id: "express", name: "Express", price: 50000, estimatedDays: "1-2 hari" },
  { id: "same-day", name: "Same Day", price: 100000, estimatedDays: "Hari ini" },
];

const TAX_RATE = 0.11;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);

  const shipping = selectedShipping?.price || 0;
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + shipping + tax;

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Keranjang Kosong</h1>
        <p className="text-muted-foreground mb-6">
          Tambahkan produk ke keranjang sebelum checkout.
        </p>
        <Button asChild>
          <Link href="/products">Lihat Produk</Link>
        </Button>
      </div>
    );
  }

  const handleAddressSubmit = (address: ShippingAddress) => {
    setShippingAddress(address);
    setCurrentStep(2);
  };

  const handleShippingSelect = (option: ShippingOption) => {
    setSelectedShipping(option);
  };

  const handleShippingContinue = () => {
    if (selectedShipping) {
      setCurrentStep(3);
    }
  };

  const handlePlaceOrder = () => {
    // Generate dummy order number
    const orderNumber = `TS${Date.now().toString().slice(-8)}`;
    
    // Clear cart
    clearCart();
    
    // Redirect to success page
    router.push(`/checkout/success?order=${orderNumber}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/cart">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali ke Keranjang
        </Link>
      </Button>

      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      {/* Stepper */}
      <CheckoutStepper currentStep={currentStep} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 1: Address */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Alamat Pengiriman</CardTitle>
              </CardHeader>
              <CardContent>
                <AddressForm
                  initialData={shippingAddress || undefined}
                  onSubmit={handleAddressSubmit}
                />
              </CardContent>
            </Card>
          )}

          {/* Step 2: Shipping */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Pilih Pengiriman</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {SHIPPING_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleShippingSelect(option)}
                    className={`w-full p-4 border rounded-lg text-left transition-colors ${
                      selectedShipping?.id === option.id
                        ? "border-primary bg-primary/5"
                        : "hover:border-muted-foreground/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Truck className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{option.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Estimasi: {option.estimatedDays}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold">
                          {formatPrice(option.price)}
                        </span>
                        {selectedShipping?.id === option.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>
                  </button>
                ))}

                <div className="flex gap-4 pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Kembali
                  </Button>
                  <Button
                    onClick={handleShippingContinue}
                    disabled={!selectedShipping}
                  >
                    Lanjutkan
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Summary */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Address Summary */}
                <div>
                  <h4 className="font-medium mb-2">Alamat Pengiriman</h4>
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">
                      {shippingAddress?.fullName}
                    </p>
                    <p>{shippingAddress?.phone}</p>
                    <p>{shippingAddress?.address}</p>
                    <p>
                      {shippingAddress?.city}, {shippingAddress?.province}{" "}
                      {shippingAddress?.postalCode}
                    </p>
                  </div>
                </div>

                {/* Shipping Summary */}
                <div>
                  <h4 className="font-medium mb-2">Metode Pengiriman</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedShipping?.name} - {selectedShipping?.estimatedDays}
                  </p>
                </div>

                {/* Items Summary */}
                <div>
                  <h4 className="font-medium mb-2">Produk ({items.length})</h4>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex gap-3">
                        <div className="relative h-16 w-16 rounded overflow-hidden bg-muted flex-shrink-0">
                          <Image
                            src={item.product.image || "/images/placeholder-product.jpg"}
                            alt={item.product.title}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {item.product.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity} × {formatPrice(item.product.price)}
                          </p>
                        </div>
                        <p className="text-sm font-medium">
                          {formatPrice(item.product.price * item.quantity)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Kembali
                  </Button>
                  <Button onClick={handlePlaceOrder} className="flex-1">
                    Bayar Sekarang
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Total Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Subtotal ({items.length} produk)
                </span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ongkos Kirim</span>
                <span>
                  {selectedShipping ? formatPrice(shipping) : "-"}
                </span>
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
                * Ini adalah demo. Pembayaran bersifat simulasi.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
