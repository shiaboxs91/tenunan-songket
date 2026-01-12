import Link from "next/link";
import { PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProductNotFound() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-muted mb-6">
          <PackageX className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Produk Tidak Ditemukan</h1>
        <p className="text-muted-foreground mb-6">
          Maaf, produk yang Anda cari tidak tersedia atau telah dihapus.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/products">Lihat Semua Produk</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Kembali ke Beranda</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
