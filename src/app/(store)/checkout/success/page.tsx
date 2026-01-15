"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const orderNumber = searchParams.get("order");
  
  const [isVerifying, setIsVerifying] = useState(!!sessionId);
  const [verified, setVerified] = useState(!sessionId);

  useEffect(() => {
    if (sessionId) {
      // Verify the session with our backend
      fetch(`/api/checkout/verify?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => {
          setVerified(data.success);
        })
        .catch(() => {
          setVerified(false);
        })
        .finally(() => {
          setIsVerifying(false);
        });
    }
  }, [sessionId]);

  if (isVerifying) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Memverifikasi pembayaran...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          <h1 className="mb-2 text-2xl font-bold">Pembayaran Berhasil!</h1>
          <p className="mb-6 text-muted-foreground">
            Terima kasih atas pesanan Anda. Kami akan segera memproses pesanan Anda.
          </p>

          {orderNumber && (
            <div className="mb-6 rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Nomor Pesanan</p>
              <p className="text-lg font-bold">{orderNumber}</p>
            </div>
          )}

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/account/orders">
                <Package className="mr-2 h-4 w-4" />
                Lihat Pesanan Saya
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full">
              <Link href="/products">
                Lanjut Belanja
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Order Info */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          Email konfirmasi telah dikirim ke alamat email Anda.
        </p>
        <p className="mt-2">
          Ada pertanyaan?{" "}
          <Link href="/faq" className="text-primary hover:underline">
            Lihat FAQ
          </Link>{" "}
          atau{" "}
          <Link href="/cara-order" className="text-primary hover:underline">
            hubungi kami
          </Link>
        </p>
      </div>
    </div>
  );
}
