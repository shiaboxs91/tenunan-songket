import Link from "next/link";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface SuccessPageProps {
  searchParams: { order?: string };
}

export default function SuccessPage({ searchParams }: SuccessPageProps) {
  const orderNumber = searchParams.order || `TS${Date.now().toString().slice(-8)}`;

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-lg mx-auto text-center">
        {/* Success Icon */}
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6">
          <CheckCircle className="h-10 w-10 text-green-600" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold mb-2">Pesanan Berhasil!</h1>
        <p className="text-muted-foreground mb-8">
          Terima kasih telah berbelanja di TenunanSongket
        </p>

        {/* Order Info Card */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Package className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">Nomor Pesanan</span>
            </div>
            <p className="text-2xl font-bold text-primary mb-4">{orderNumber}</p>
            <p className="text-sm text-muted-foreground">
              Simpan nomor pesanan ini untuk melacak status pengiriman Anda.
            </p>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="bg-muted/50 rounded-lg p-4 mb-8 text-left">
          <h3 className="font-medium mb-2">Langkah Selanjutnya</h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>• Email konfirmasi akan dikirim ke alamat email Anda</li>
            <li>• Pesanan akan diproses dalam 1-2 hari kerja</li>
            <li>• Anda akan menerima notifikasi saat pesanan dikirim</li>
          </ul>
        </div>

        {/* Demo Notice */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-8">
          <p className="text-sm text-primary">
            <strong>Catatan:</strong> Ini adalah demo. Tidak ada transaksi nyata
            yang terjadi dan tidak ada produk yang akan dikirim.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/products">
              Lanjut Belanja
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
