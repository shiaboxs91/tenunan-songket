import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getPopularProducts, getLatestProducts } from "@/lib/products";
import { Product } from "@/lib/types";
import { fetchRSSProducts } from "@/lib/rss";
import snapshotData from "@/data/products.snapshot.json";
import categoryImagesData from "@/data/category-images.json";

// Jenis Corak Kain - using real images from category data
const JENIS_CORAK = categoryImagesData.categories.map(cat => {
  // Count products in each category from snapshot
  const products = snapshotData as unknown as Product[];
  const count = products.filter(p => p.category === cat.name).length;
  return {
    name: cat.name,
    items: count || 1,
    image: cat.image,
  };
});

async function getHomeData() {
  let products: Product[];
  
  try {
    products = await fetchRSSProducts();
  } catch (error) {
    console.error("Failed to fetch RSS, using snapshot:", error);
    // snapshotData is directly an array, not an object with products property
    products = snapshotData as unknown as Product[];
  }
  
  return {
    popularProducts: getPopularProducts(products, 4),
    latestProducts: getLatestProducts(products, 4),
  };
}

export default async function HomePage() {
  const { popularProducts, latestProducts } = await getHomeData();

  return (
    <div className="flex flex-col">
      {/* Hero Section - Full width background */}
      <section className="relative bg-gradient-to-br from-slate-100 via-slate-50 to-white">
        {/* Subtle songket pattern */}
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%237A1F3D' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-amber-500 hover:bg-amber-600 text-white border-0">
              Warisan Budaya Indonesia
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-8">
              Keindahan{" "}
              <span className="text-primary">Tenunan Songket</span>
            </h1>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link href="/products">
                  Belanja Sekarang
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#jenis-corak">Lihat Kategori</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>


      {/* Jenis Corak Kain Section - sesuai screenshot */}
      <section id="jenis-corak" className="py-12 md:py-16 bg-white border-y border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
              Jenis Corak Kain
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-6 md:gap-8 lg:gap-10">
            {JENIS_CORAK.map((corak) => (
              <Link
                key={corak.name}
                href={`/products?q=${encodeURIComponent(corak.name)}`}
                className="group flex flex-col items-center text-center"
              >
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-3 ring-2 ring-slate-200 group-hover:ring-primary transition-all">
                  <Image
                    src={corak.image}
                    alt={corak.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="96px"
                  />
                </div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-primary transition-colors">
                  {corak.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  {corak.items} items
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Products */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Produk Populer
              </h2>
              <p className="text-muted-foreground">
                Pilihan favorit pelanggan kami
              </p>
            </div>
            <Button asChild variant="ghost">
              <Link href="/products?sort=bestselling">
                Lihat Semua
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <ProductGrid products={popularProducts} />
        </div>
      </section>

      {/* Latest Products */}
      <section className="py-12 md:py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Produk Terbaru
              </h2>
              <p className="text-muted-foreground">
                Koleksi terbaru yang baru saja hadir
              </p>
            </div>
            <Button asChild variant="ghost">
              <Link href="/products?sort=newest">
                Lihat Semua
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <ProductGrid products={latestProducts} />
        </div>
      </section>

      {/* USP Section */}
      <section className="py-12 md:py-16 bg-slate-50 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-3">Handmade dengan Cinta</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Setiap kain ditenun dengan tangan oleh pengrajin berpengalaman
                menggunakan teknik tradisional turun-temurun.
              </p>
            </div>

            <div className="text-center">
              <h3 className="font-semibold text-lg mb-3">Kualitas Premium</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Menggunakan bahan berkualitas tinggi termasuk benang emas dan
                sutra asli untuk hasil yang mewah dan tahan lama.
              </p>
            </div>

            <div className="text-center">
              <h3 className="font-semibold text-lg mb-3">Warisan Budaya</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Melestarikan warisan budaya Indonesia dengan mendukung pengrajin
                lokal dan menjaga tradisi tenun nusantara.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
