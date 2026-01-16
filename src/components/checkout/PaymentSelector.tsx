"use client";

import { useState, useEffect, useCallback } from "react";
import { CreditCard, Loader2, Lock, Building2, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import type { PaymentMethodPublic, BankTransferConfig } from "@/lib/supabase/types";

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
  const [loadingMethods, setLoadingMethods] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodPublic[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);

  const supabase = createClient();

  const fetchPaymentMethods = useCallback(async () => {
    setLoadingMethods(true);
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      // Remove secret keys from Stripe config for security
      const safeMethods = (data || []).map(method => {
        if (method.type === 'stripe' && method.config) {
          const config = method.config as any;
          return {
            ...method,
            type: method.type as PaymentMethodPublic['type'],
            config: {
              publishable_key: config.publishable_key
            },
            is_active: method.is_active ?? true,
            display_order: method.display_order ?? 0
          } as PaymentMethodPublic;
        }
        return {
          ...method,
          type: method.type as PaymentMethodPublic['type'],
          is_active: method.is_active ?? true,
          display_order: method.display_order ?? 0
        } as PaymentMethodPublic;
      });

      setPaymentMethods(safeMethods);
      
      // Auto-select first method
      if (safeMethods.length > 0 && !selectedMethod) {
        setSelectedMethod(safeMethods[0].code);
      }
    } catch (err) {
      console.error('Error fetching payment methods:', err);
      // Fallback to default Stripe method
      setPaymentMethods([{
        id: 'default-stripe',
        name: 'Kartu Kredit / Debit',
        code: 'stripe',
        type: 'stripe',
        config: null,
        instructions: null,
        is_active: true,
        display_order: 0
      }]);
      setSelectedMethod('stripe');
    } finally {
      setLoadingMethods(false);
    }
  }, [supabase, selectedMethod]);

  useEffect(() => {
    fetchPaymentMethods();
  }, [fetchPaymentMethods]);

  const handlePayment = async () => {
    if (!selectedMethod) return;

    const method = paymentMethods.find(m => m.code === selectedMethod);
    if (!method) return;

    setIsLoading(true);

    try {
      if (method.type === 'stripe') {
        // Stripe payment flow
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
      } else if (method.type === 'bank_transfer') {
        // Bank transfer - redirect to confirmation page with instructions
        window.location.href = `/checkout/bank-transfer?orderId=${orderId}`;
      } else {
        // Manual payment - redirect to confirmation
        window.location.href = `/checkout/manual?orderId=${orderId}`;
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

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'stripe':
        return <CreditCard className="h-5 w-5 text-blue-600" />;
      case 'bank_transfer':
        return <Building2 className="h-5 w-5 text-green-600" />;
      default:
        return <Wallet className="h-5 w-5 text-gray-600" />;
    }
  };

  const getMethodDescription = (method: PaymentMethodPublic) => {
    switch (method.type) {
      case 'stripe':
        return 'Visa, Mastercard, American Express';
      case 'bank_transfer':
        const config = method.config as BankTransferConfig | null;
        const bankCount = config?.bank_accounts?.length || 0;
        return bankCount > 0 ? `${bankCount} rekening tersedia` : 'Transfer ke rekening bank';
      default:
        return method.instructions || 'Pembayaran manual';
    }
  };

  if (loadingMethods) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Memuat metode pembayaran...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Pilih Metode Pembayaran</h3>

      {paymentMethods.map((method) => (
        <Card
          key={method.id}
          className={`cursor-pointer transition-all ${
            selectedMethod === method.code
              ? "border-primary ring-2 ring-primary/20"
              : "hover:border-gray-300"
          }`}
          onClick={() => setSelectedMethod(method.code)}
        >
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              {getMethodIcon(method.type)}
            </div>
            <div className="flex-1">
              <p className="font-medium">{method.name}</p>
              <p className="text-sm text-muted-foreground">
                {getMethodDescription(method)}
              </p>
            </div>
            <div
              className={`h-5 w-5 rounded-full border-2 ${
                selectedMethod === method.code
                  ? "border-primary bg-primary"
                  : "border-gray-300"
              }`}
            >
              {selectedMethod === method.code && (
                <div className="flex h-full w-full items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

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
