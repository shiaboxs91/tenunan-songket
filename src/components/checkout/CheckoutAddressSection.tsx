"use client";

/**
 * CheckoutAddressSection - Unified address selection for checkout
 * Supports both authenticated users and guest checkout
 * 
 * Flow:
 * - If authenticated: Show saved addresses + option to add new
 * - If guest: Show guest address form with login prompt
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin, LogIn, User, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AddressSelector } from "./AddressSelector";
import { GuestAddressForm, type GuestAddress } from "./GuestAddressForm";
import { createClient } from "@/lib/supabase/client";
import type { Address } from "@/lib/supabase/addresses";

export interface CheckoutAddress {
  // Common fields for both guest and authenticated
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  // Only for authenticated users
  id?: string;
  is_default?: boolean;
  label?: string;
  // Only for guest checkout
  email?: string;
}

interface CheckoutAddressSectionProps {
  onAddressSelect: (address: CheckoutAddress) => void;
  selectedAddress?: CheckoutAddress | null;
}

export function CheckoutAddressSection({
  onAddressSelect,
  selectedAddress,
}: CheckoutAddressSectionProps) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showGuestForm, setShowGuestForm] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [guestAddress, setGuestAddress] = useState<GuestAddress | null>(null);

  // Check authentication status
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      setIsLoading(false);
    }
    checkAuth();
  }, []);

  // Handle address selection from AddressSelector (authenticated)
  const handleAuthenticatedAddressSelect = (address: Address) => {
    onAddressSelect({
      id: address.id,
      recipient_name: address.recipient_name,
      phone: address.phone,
      address_line1: address.address_line1,
      address_line2: address.address_line2 || undefined,
      city: address.city,
      state: address.state,
      postal_code: address.postal_code,
      country: address.country,
      is_default: address.is_default || false,
      label: address.label || undefined,
    });
  };

  // Handle guest address submission
  const handleGuestAddressSubmit = (address: GuestAddress) => {
    setGuestAddress(address);
    setShowGuestForm(false);
    onAddressSelect({
      ...address,
    });
  };

  // Handle login button click
  const handleLoginClick = () => {
    // Store current URL to return after login
    const returnUrl = encodeURIComponent(window.location.pathname);
    router.push(`/login?returnUrl=${returnUrl}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Authenticated user - show normal AddressSelector
  if (isAuthenticated) {
    return (
      <AddressSelector
        selectedAddressId={selectedAddress?.id}
        onSelect={handleAuthenticatedAddressSelect}
      />
    );
  }

  // Guest user - show guest flow
  return (
    <div className="space-y-4">
      {/* Guest address display if already entered */}
      {guestAddress && !showGuestForm ? (
        <div className="p-4 border rounded-lg bg-muted/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">{guestAddress.recipient_name}</p>
              <p className="text-sm text-muted-foreground">{guestAddress.phone}</p>
              <p className="text-sm text-muted-foreground">{guestAddress.email}</p>
              <p className="text-sm mt-1">
                {guestAddress.address_line1}
                {guestAddress.address_line2 && `, ${guestAddress.address_line2}`}
              </p>
              <p className="text-sm">
                {guestAddress.city}, {guestAddress.state} {guestAddress.postal_code}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGuestForm(true)}
            >
              Ubah
            </Button>
          </div>
        </div>
      ) : !showGuestForm ? (
        // Initial state - show options
        <div className="text-center py-6 space-y-4">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
          <div>
            <h3 className="font-medium mb-1">Alamat Pengiriman</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Masukkan alamat untuk melanjutkan checkout
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => setShowGuestForm(true)}>
              <User className="mr-2 h-4 w-4" />
              Lanjut Sebagai Tamu
            </Button>
            <Button variant="outline" onClick={() => setShowLoginPrompt(true)}>
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          </div>
        </div>
      ) : null}

      {/* Guest Address Form */}
      {showGuestForm && (
        <div className="space-y-4">
          <GuestAddressForm
            initialData={guestAddress || undefined}
            onSubmit={handleGuestAddressSubmit}
            onCancel={guestAddress ? () => setShowGuestForm(false) : undefined}
          />
          
          {/* Login prompt below form */}
          <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                  Login untuk menyimpan alamat
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Simpan alamat ini dan gunakan lagi di pesanan berikutnya
                </p>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 mt-2 text-amber-700 dark:text-amber-300"
                  onClick={() => setShowLoginPrompt(true)}
                >
                  Login sekarang
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Prompt Dialog */}
      <Dialog open={showLoginPrompt} onOpenChange={setShowLoginPrompt}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Login ke Akun Anda</DialogTitle>
            <DialogDescription>
              Login untuk menyimpan alamat dan mempermudah checkout berikutnya
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Simpan alamat untuk pesanan berikutnya</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Lacak status pesanan dengan mudah</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span>Akses riwayat pembelian</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Button onClick={handleLoginClick}>
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>
              <Button variant="ghost" asChild>
                <Link href="/register">Belum punya akun? Daftar</Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowLoginPrompt(false);
                  setShowGuestForm(true);
                }}
              >
                Lanjut Sebagai Tamu
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
