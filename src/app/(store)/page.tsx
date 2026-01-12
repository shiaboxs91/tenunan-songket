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
      {/* Hero Section - Elegant Light Theme with Cultural Touch */}
      <section className="relative min-h-[60vh] md:min-h-[70vh] overflow-hidden bg-gradient-to-br from-amber-50 via-white to-slate-50">
        {/* Subtle Songket Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23B8860B' fill-opacity='1'%3E%3Cpath d='M30 0L33 3L30 6L27 3L30 0zM15 15L18 18L15 21L12 18L15 15zM45 15L48 18L45 21L42 18L45 15zM30 30L33 33L30 36L27 33L30 30zM15 45L18 48L15 51L12 48L15 45zM45 45L48 48L45 51L42 48L45 45z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Decorative Corner Ornaments - Gold */}
        <div className="absolute top-0 left-0 w-24 h-24 md:w-32 md:h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full text-amber-400/30">
            <path d="M0 0 L60 0 L60 8 L8 8 L8 60 L0 60 Z" fill="currentColor"/>
            <circle cx="20" cy="20" r="2" fill="currentColor"/>
          </svg>
        </div>
        <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 rotate-90">
          <svg viewBox="0 0 100 100" className="w-full h-full text-amber-400/30">
            <path d="M0 0 L60 0 L60 8 L8 8 L8 60 L0 60 Z" fill="currentColor"/>
            <circle cx="20" cy="20" r="2" fill="currentColor"/>
          </svg>
        </div>

        {/* Main Content */}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 md:py-24 flex flex-col justify-center min-h-[60vh] md:min-h-[70vh]">
          <div className="max-w-2xl">
            {/* Heritage Badge */}
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-amber-50 border border-amber-300/50">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-amber-800 text-sm font-medium tracking-wide">
                Warisan Budaya Melayu
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4">
              <span className="text-slate-800">Keindahan</span>
              <br />
              <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 bg-clip-text text-transparent">
                Tenunan Songket
              </span>
            </h1>

            {/* Decorative line */}
            <div className="flex items-center gap-2 mb-6">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-amber-400" />
              <div className="w-1.5 h-1.5 rotate-45 bg-amber-500" />
              <div className="h-px w-16 bg-amber-400/50" />
              <div className="w-1.5 h-1.5 rotate-45 bg-amber-500" />
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-amber-400" />
            </div>

            {/* Subtitle */}
            <p className="text-base md:text-lg text-slate-600 mb-8 max-w-xl leading-relaxed">
              Koleksi eksklusif kain tenun songket Brunei dengan motif tradisional 
              yang ditenun dengan benang emas asli oleh pengrajin mahir.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                asChild 
                size="lg" 
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white border-0 shadow-md shadow-amber-500/20 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/30"
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
                className="border-amber-400 text-amber-700 hover:bg-amber-50 hover:text-amber-800 transition-all duration-300"
              >
                <Link href="#jenis-corak">Lihat Kategori</Link>
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center gap-4 md:gap-6 mt-8 pt-6 border-t border-amber-200/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-600 text-sm">100% Handmade</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-slate-600 text-sm">Benang Emas Asli</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-slate-600 text-sm">Kualiti Terjamin</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Jenis Corak Kain Section - with gold ornaments */}
      <section id="jenis-corak" className="relative py-12 md:py-16 bg-white">
        {/* Top gold ornament line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
        
        {/* Subtle pattern */}
        <div 
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23B8860B'%3E%3Cpath d='M20 0L21 1L20 2L19 1L20 0z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header with ornament */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-400" />
              <div className="w-1.5 h-1.5 rotate-45 bg-amber-500" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-400" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
              Jenis Corak Kain
            </h2>
            <p className="text-slate-500 text-sm mt-2">Pilih corak tradisional kegemaran anda</p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 md:gap-8 lg:gap-10">
            {JENIS_CORAK.map((corak) => (
              <Link
                key={corak.name}
                href={`/products?q=${encodeURIComponent(corak.name)}`}
                className="group flex flex-col items-center text-center"
              >
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-3 ring-2 ring-amber-200 group-hover:ring-amber-400 transition-all shadow-sm group-hover:shadow-md group-hover:shadow-amber-200/50">
                  <Image
                    src={corak.image}
                    alt={corak.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="96px"
                  />
                </div>
                <span className="text-sm font-medium text-slate-700 group-hover:text-amber-700 transition-colors">
                  {corak.name}
                </span>
                <span className="text-xs text-slate-400">
                  {corak.items} items
                </span>
              </Link>
            ))}
          </div>
        </div>
        
        {/* Bottom gold ornament line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
      </section>

      {/* Popular Products */}
      <section className="relative py-12 md:py-16 bg-slate-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1 h-5 bg-amber-500 rounded-full" />
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
                  Produk Populer
                </h2>
              </div>
              <p className="text-slate-500">
                Pilihan favorit pelanggan kami
              </p>
            </div>
            <Button asChild variant="ghost" className="text-amber-700 hover:text-amber-800 hover:bg-amber-50">
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
      <section className="relative py-12 md:py-16 bg-white">
        {/* Subtle top border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-1 h-5 bg-amber-500 rounded-full" />
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800">
                  Produk Terbaru
                </h2>
              </div>
              <p className="text-slate-500">
                Koleksi terbaru yang baru saja hadir
              </p>
            </div>
            <Button asChild variant="ghost" className="text-amber-700 hover:text-amber-800 hover:bg-amber-50">
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
      <section className="relative py-12 md:py-16 bg-gradient-to-b from-slate-50 to-white">
        {/* Top ornament */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-300 to-transparent" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-slate-800">Handmade dengan Cinta</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Setiap kain ditenun dengan tangan oleh pengrajin berpengalaman
                menggunakan teknik tradisional turun-temurun.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-slate-800">Kualitas Premium</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Menggunakan bahan berkualitas tinggi termasuk benang emas dan
                sutra asli untuk hasil yang mewah dan tahan lama.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2 text-slate-800">Warisan Budaya</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Melestarikan warisan budaya Melayu dengan mendukung pengrajin
                lokal dan menjaga tradisi tenun nusantara.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
