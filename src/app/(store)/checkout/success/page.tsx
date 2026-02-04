"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Package, ArrowRight, MessageCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// WhatsApp number for payment confirmation
const WHATSAPP_NUMBER = "628159870037"; // Format: country code + number without +

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");

  // Generate WhatsApp message
  const whatsappMessage = encodeURIComponent(
    `Halo, saya ingin konfirmasi pembayaran untuk pesanan:\n\nNomor Pesanan: ${orderNumber || "-"}\n\nMohon informasi untuk pembayaran. Terima kasih.`
  );
  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMessage}`;

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <Card>
        <CardContent className="pt-6 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>

          <h1 className="mb-2 text-2xl font-bold">Pesanan Berhasil Dibuat!</h1>
          <p className="mb-6 text-muted-foreground">
            Terima kasih atas pesanan Anda. Silakan lakukan konfirmasi pembayaran untuk memproses pesanan.
          </p>

          {orderNumber && (
            <div className="mb-6 rounded-lg bg-muted/50 p-4">
              <p className="text-sm text-muted-foreground">Nomor Pesanan</p>
              <p className="text-xl font-bold">{orderNumber}</p>
            </div>
          )}

          {/* Payment Status */}
          <div className="mb-6 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Menunggu Pembayaran
              </p>
            </div>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Pesanan akan diproses setelah pembayaran dikonfirmasi
            </p>
          </div>

          {/* WhatsApp CTA */}
          <div className="mb-6 p-4 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
            <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-3">
              Konfirmasi Pembayaran via WhatsApp
            </p>
            <Button asChild className="w-full bg-green-600 hover:bg-green-700">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" />
                Chat WhatsApp Kami
              </a>
            </Button>
            <p className="text-xs text-green-700 dark:text-green-300 mt-2">
              Klik untuk langsung chat dengan nomor pesanan Anda
            </p>
          </div>

          <div className="space-y-3">
            <Button asChild variant="outline" className="w-full">
              <Link href="/account/orders">
                <Package className="mr-2 h-4 w-4" />
                Lihat Pesanan Saya
              </Link>
            </Button>

            <Button variant="ghost" asChild className="w-full">
              <Link href="/products">
                Lanjut Belanja
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Additional Info */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          Simpan nomor pesanan Anda untuk referensi pembayaran.
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
