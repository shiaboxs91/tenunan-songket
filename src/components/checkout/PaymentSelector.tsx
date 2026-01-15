"use client";

import { useState } from "react";
import { CreditCard, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface PaymentSelectorProps {
  orderId: string;
  total: number;
  currency: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function PaymentSelector({
  orderId,
  total,
  currency,
  onSuccess,
  onError,
}: PaymentSelectorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<"stripe" | null>("stripe");

  const handlePayment = async () => {
    if (!selectedMethod) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }

      onSuccess?.();
    } catch (error) {
      console.error("Payment error:", error);
      onError?.(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Pilih Metode Pembayaran</h3>

      {/* Stripe Card Payment */}
      <Card
        className={`cursor-pointer transition-all ${
          selectedMethod === "stripe"
            ? "border-primary ring-2 ring-primary/20"
            : "hover:border-gray-300"
        }`}
        onClick={() => setSelectedMethod("stripe")}
      >
        <CardContent className="flex items-center gap-4 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <CreditCard className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium">Kartu Kredit / Debit</p>
            <p className="text-sm text-muted-foreground">
              Visa, Mastercard, American Express
            </p>
          </div>
          <div
            className={`h-5 w-5 rounded-full border-2 ${
              selectedMethod === "stripe"
                ? "border-primary bg-primary"
                : "border-gray-300"
            }`}
          >
            {selectedMethod === "stripe" && (
              <div className="flex h-full w-full items-center justify-center">
                <div className="h-2 w-2 rounded-full bg-white" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <div className="rounded-lg bg-muted/50 p-4">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Total Pembayaran</span>
          <span className="text-xl font-bold">{formatCurrency(total)}</span>
        </div>
      </div>

      {/* Security Notice */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Lock className="h-4 w-4" />
        <span>Pembayaran aman dengan enkripsi SSL</span>
      </div>

      {/* Pay Button */}
      <Button
        onClick={handlePayment}
        disabled={!selectedMethod || isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memproses...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Bayar Sekarang
          </>
        )}
      </Button>
    </div>
  );
}
