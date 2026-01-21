"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckoutStepper } from "@/components/checkout/CheckoutStepper";
import { AddressSelector, ShippingSelector, OrderSummary } from "@/components/checkout";
import { PaymentMethodSelector } from "@/components/checkout/PaymentMethodSelector";
import { useCart } from "@/components/cart/CartProvider";
import { createClient } from "@/lib/supabase/client";
import { createOrder } from "@/lib/supabase/orders";
import type { Address } from "@/lib/supabase/addresses";
import type { ShippingOption, ShippingAddress } from "@/lib/supabase/shipping";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, summary, clearCart, isLoading: cartLoading } = useCart();

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check authentication (optional now)
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      // Removed forced redirect to login
    }
    checkAuth();
  }, [router]);

  // Calculate total weight from cart items
  const totalWeight = items.reduce((acc, item) => {
    const weight = item.product?.weight || 0.5; // Default 0.5kg per item
    return acc + (weight * item.quantity);
  }, 0);

  // Convert Address to ShippingAddress format
  const getShippingAddress = (address: Address): ShippingAddress => ({
    recipientName: address.recipient_name,
    phone: address.phone,
    addressLine1: address.address_line1,
    addressLine2: address.address_line2 || undefined,
    city: address.city,
    state: address.state,
    postalCode: address.postal_code,
    country: address.country,
  });

  const handleAddressSelect = (address: Address) => {
    setSelectedAddress(address);
    setSelectedShipping(null); // Reset shipping when address changes
  };

  const handleShippingSelect = (option: ShippingOption) => {
    setSelectedShipping(option);
  };

  const handleContinueToShipping = () => {
    if (selectedAddress) {
      setCurrentStep(2);
    }
  };

  const handleContinueToPayment = () => {
    if (selectedShipping) {
      setCurrentStep(3);
    }
  };

  const handleContinueToSummary = () => {
    if (selectedPayment) {
      setCurrentStep(4);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress || !selectedShipping || !selectedPayment) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const orderItems = items.map(item => ({
        product_id: item.product_id,
        product_title: item.product?.title || 'Produk',
        product_image: item.product?.images?.find(img => img.is_primary)?.url || 
                       item.product?.images?.[0]?.url || null,
        price: item.product?.sale_price || item.product?.price || 0,
        quantity: item.quantity,
      }));

      const order = await createOrder({
        items: orderItems,
        shipping_address: {
          recipient_name: selectedAddress.recipient_name,
          phone: selectedAddress.phone,
          address_line1: selectedAddress.address_line1,
          address_line2: selectedAddress.address_line2,
          city: selectedAddress.city,
          state: selectedAddress.state,
          postal_code: selectedAddress.postal_code,
          country: selectedAddress.country,
        },
        shipping_cost: selectedShipping.cost,
        shipping_courier: selectedShipping.courier,
        shipping_service: selectedShipping.service,
        payment_method: selectedPayment,
        notes: '',
      });

      if (order) {
        await clearCart();
        router.push(`/checkout/success?order=${order.order_number}`);
      } else {
        setError("Gagal membuat pesanan. Silakan coba lagi.");
      }
    } catch (err) {
      console.error('Order error:', err);
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (cartLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

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

  const shippingCost = selectedShipping?.cost || 0;
  const total = summary.subtotal + shippingCost;

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

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Step 1: Address */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Pilih Alamat Pengiriman</CardTitle>
              </CardHeader>
              <CardContent>
                <AddressSelector
                  selectedAddressId={selectedAddress?.id}
                  onSelect={handleAddressSelect}
                  onAddressUpdated={(updatedAddress) => {
                    if (selectedAddress?.id === updatedAddress.id) {
                      setSelectedAddress(updatedAddress);
                    }
                  }}
                />
                
                <div className="mt-6 pt-4 border-t">
                  <Button
                    onClick={handleContinueToShipping}
                    disabled={!selectedAddress}
                    className="w-full sm:w-auto"
                  >
                    Lanjutkan ke Pengiriman
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Shipping */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Pilih Metode Pengiriman</CardTitle>
              </CardHeader>
              <CardContent>
                <ShippingSelector
                  address={selectedAddress ? getShippingAddress(selectedAddress) : null}
                  totalWeight={totalWeight}
                  selectedOption={selectedShipping || undefined}
                  onSelect={handleShippingSelect}
                />

                <div className="flex gap-4 mt-6 pt-4 border-t">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Kembali
                  </Button>
                  <Button
                    onClick={handleContinueToPayment} // Changed to Payment
                    disabled={!selectedShipping}
                  >
                    Lanjutkan ke Pembayaran
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Payment (NEW) */}
          {currentStep === 3 && (
            <Card>
              {/* No Header needed as PaymentMethodSelector has its own card style usually, but here we wrap it */}
              {/* Actually PaymentMethodSelector has its own Card, so we might not need to wrap it in another CardContent if it renders a Card. 
                  Checking PaymentMethodSelector: it returns a Card. So we should probably just render it directly or wrap for consistency.
                  Let's render it directly to avoid double cards.
               */}
               <PaymentMethodSelector 
                  selectedMethod={selectedPayment}
                  onSelect={setSelectedPayment}
               />
               
               <div className="flex gap-4 mt-6">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Kembali
                  </Button>
                  <Button
                    onClick={handleContinueToSummary}
                    disabled={!selectedPayment}
                  >
                    Lanjutkan ke Ringkasan
                  </Button>
                </div>
            </Card>
          )}

           {/* Step 4: Summary */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Konfirmasi Pesanan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Address Summary */}
                {selectedAddress && (
                  <div>
                    <h4 className="font-medium mb-2">Alamat Pengiriman</h4>
                    <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      <p className="font-medium text-foreground">
                        {selectedAddress.recipient_name}
                      </p>
                      <p>{selectedAddress.phone}</p>
                      <p>{selectedAddress.address_line1}</p>
                      {selectedAddress.address_line2 && (
                        <p>{selectedAddress.address_line2}</p>
                      )}
                      <p>
                        {selectedAddress.city}, {selectedAddress.state} {selectedAddress.postal_code}
                      </p>
                      <p>{selectedAddress.country}</p>
                    </div>
                  </div>
                )}

                {/* Shipping Summary */}
                {selectedShipping && (
                  <div>
                    <h4 className="font-medium mb-2">Metode Pengiriman</h4>
                    <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      <p className="font-medium text-foreground">
                        {selectedShipping.service}
                      </p>
                      <p>Estimasi: {selectedShipping.estimatedDays}</p>
                    </div>
                  </div>
                )}

                {/* Payment Summary */}
                {selectedPayment && (
                  <div>
                    <h4 className="font-medium mb-2">Metode Pembayaran</h4>
                    <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                      <p className="font-medium text-foreground capitalize">
                        {selectedPayment === 'intl_transfer' ? 'International Bank Transfer / Wise' : 
                         selectedPayment === 'brunei_transfer' ? 'Bank Transfer (Brunei)' :
                         selectedPayment}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4 border-t">
                  <Button variant="outline" onClick={() => setCurrentStep(3)}>
                    Kembali
                  </Button>
                  <Button
                    onClick={handlePlaceOrder}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      "Buat Pesanan"
                    )}
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
              <CardTitle className="text-lg">Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent>
              <OrderSummary
                items={items}
                subtotal={summary.subtotal}
                shipping={selectedShipping}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
