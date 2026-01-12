import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getPopularProducts, getLatestProducts } from "@/lib/products";
import { Product } from "@/lib/types";
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
  // Use snapshot data directly for reliable product display
  // Snapshot contains real products from tenunansongket.com
  const products = snapshotData as unknown as Product[];
  
  return {
    popularProducts: getPopularProducts(products, 4),
    latestProducts: getLatestProducts(products, 4),
  };
}

export default async function HomePage() {
  const { popularProducts, latestProducts } = await getHomeData();

  return (
    <div className="flex flex-col">
      {/* Hero Section - Premium Malay Heritage Design */}
      <section className="relative min-h-[70vh] md:min-h-[80vh] overflow-hidden bg-gradient-to-br from-[#1a0a0f] via-[#2d1520] to-[#1a0a0f]">
        {/* Animated Gold Particles Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-2 h-2 bg-amber-400/30 rounded-full animate-pulse" />
          <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-amber-300/40 rounded-full animate-pulse delay-300" />
          <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-amber-500/30 rounded-full animate-pulse delay-500" />
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-amber-400/20 rounded-full animate-pulse delay-700" />
          <div className="absolute bottom-20 right-10 w-1.5 h-1.5 bg-amber-300/30 rounded-full animate-pulse delay-1000" />
        </div>

        {/* Songket Pattern Overlay - Traditional Geometric */}
        <div 
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23D4AF37' fill-opacity='1'%3E%3Cpath d='M40 0L45 5L40 10L35 5L40 0zM20 20L25 25L20 30L15 25L20 20zM60 20L65 25L60 30L55 25L60 20zM40 40L45 45L40 50L35 45L40 40zM0 40L5 45L0 50L-5 45L0 40zM80 40L85 45L80 50L75 45L80 40zM20 60L25 65L20 70L15 65L20 60zM60 60L65 65L60 70L55 65L60 60zM40 80L45 85L40 90L35 85L40 80z'/%3E%3Crect x='38' y='18' width='4' height='4' rx='0.5'/%3E%3Crect x='18' y='38' width='4' height='4' rx='0.5'/%3E%3Crect x='58' y='38' width='4' height='4' rx='0.5'/%3E%3Crect x='38' y='58' width='4' height='4' rx='0.5'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Decorative Corner Ornaments */}
        <div className="absolute top-0 left-0 w-32 h-32 md:w-48 md:h-48">
          <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500/20">
            <path d="M0 0 L100 0 L100 10 L10 10 L10 100 L0 100 Z" fill="currentColor"/>
            <path d="M20 0 L20 20 L0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
            <circle cx="30" cy="30" r="3" fill="currentColor"/>
          </svg>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32 md:w-48 md:h-48 rotate-90">
          <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500/20">
            <path d="M0 0 L100 0 L100 10 L10 10 L10 100 L0 100 Z" fill="currentColor"/>
            <path d="M20 0 L20 20 L0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
            <circle cx="30" cy="30" r="3" fill="currentColor"/>
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-32 h-32 md:w-48 md:h-48 -rotate-90">
          <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500/20">
            <path d="M0 0 L100 0 L100 10 L10 10 L10 100 L0 100 Z" fill="currentColor"/>
            <path d="M20 0 L20 20 L0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
            <circle cx="30" cy="30" r="3" fill="currentColor"/>
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-32 h-32 md:w-48 md:h-48 rotate-180">
          <svg viewBox="0 0 100 100" className="w-full h-full text-amber-500/20">
            <path d="M0 0 L100 0 L100 10 L10 10 L10 100 L0 100 Z" fill="currentColor"/>
            <path d="M20 0 L20 20 L0 20" fill="none" stroke="currentColor" strokeWidth="1"/>
            <circle cx="30" cy="30" r="3" fill="currentColor"/>
          </svg>
        </div>

        {/* Gradient Overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

        {/* Main Content */}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-32 flex flex-col justify-center min-h-[70vh] md:min-h-[80vh]">
          <div className="max-w-3xl">
            {/* Heritage Badge with shimmer effect */}
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 via-amber-400/30 to-amber-500/20 border border-amber-500/30 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              <span className="text-amber-300 text-sm font-medium tracking-wide">
                Warisan Budaya Melayu
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            </div>

            {/* Main Heading with gradient text */}
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="text-white/90">Keindahan</span>
              <br />
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                Tenunan Songket
              </span>
            </h1>

            {/* Decorative line */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500/50" />
              <div className="w-2 h-2 rotate-45 bg-amber-500/50" />
              <div className="h-px w-24 bg-amber-500/30" />
              <div className="w-2 h-2 rotate-45 bg-amber-500/50" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500/50" />
            </div>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-white/70 mb-8 max-w-xl leading-relaxed">
              Koleksi eksklusif kain tenun songket Brunei dengan motif tradisional 
              yang ditenun dengan benang emas asli oleh pengrajin mahir.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild 
                size="lg" 
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0 shadow-lg shadow-amber-500/25 transition-all duration-300 hover:shadow-amber-500/40 hover:scale-105"
              >
                <Link href="/products">
                  Belanja Sekarang
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="border-amber-500/50 text-amber-300 hover:bg-amber-500/10 hover:text-amber-200 hover:border-amber-400/70 backdrop-blur-sm transition-all duration-300"
              >
                <Link href="#jenis-corak">Lihat Kategori</Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-6 mt-10 pt-8 border-t border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-white/60 text-sm">100% Handmade</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-white/60 text-sm">Benang Emas Asli</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-white/60 text-sm">Kualiti Terjamin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full h-auto" preserveAspectRatio="none">
            <path 
              d="M0,60 L0,30 Q360,0 720,30 T1440,30 L1440,60 Z" 
              fill="white"
            />
          </svg>
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
