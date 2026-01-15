"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CheckoutCancelPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-10 w-10 text-red-600" />
          </div>

          <h1 className="mb-2 text-2xl font-bold">Pembayaran Dibatalkan</h1>
          <p className="mb-6 text-muted-foreground">
            Pembayaran Anda telah dibatalkan. Pesanan Anda masih tersimpan dan dapat dibayar nanti.
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
                <RefreshCw className="mr-2 h-4 w-4" />
                Coba Bayar Lagi
              </Link>
            </Button>

            <Button variant="outline" asChild className="w-full">
              <Link href="/cart">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Keranjang
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Help Info */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          Mengalami masalah dengan pembayaran?
        </p>
        <p className="mt-2">
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
