import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getPopularProducts, getLatestProducts } from "@/lib/products";
import { Product } from "@/lib/types";
import snapshotData from "@/data/products.snapshot.json";
import categoryImagesData from "@/data/category-images.json";

// Elegant Wood Carving Section Divider - Malay Royal Style
const SectionDivider = ({ variant = "default" }: { variant?: "default" | "ornate" }) => (
  <div className="relative h-8 flex items-center justify-center overflow-hidden">
    {/* Background gradient line */}
    <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />
    
    {/* Center ornament */}
    <div className="relative z-10 flex items-center gap-1 bg-white px-4">
      {/* Left decorative curl */}
      <svg viewBox="0 0 40 16" className="w-10 h-4 text-amber-400">
        <defs>
          <linearGradient id="woodGradL" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="30%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#B8860B" />
          </linearGradient>
        </defs>
        <path 
          d="M0 8 Q10 8 15 4 Q20 0 25 4 Q30 8 35 6 L40 8 L35 10 Q30 8 25 12 Q20 16 15 12 Q10 8 0 8" 
          fill="none" 
          stroke="url(#woodGradL)" 
          strokeWidth="1.2"
        />
        <circle cx="38" cy="8" r="1.5" fill="#D4AF37" />
      </svg>
      
      {/* Center diamond */}
      <div className="w-3 h-3 rotate-45 bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 shadow-sm" />
      
      {/* Right decorative curl (mirrored) */}
      <svg viewBox="0 0 40 16" className="w-10 h-4 text-amber-400" style={{ transform: 'scaleX(-1)' }}>
        <path 
          d="M0 8 Q10 8 15 4 Q20 0 25 4 Q30 8 35 6 L40 8 L35 10 Q30 8 25 12 Q20 16 15 12 Q10 8 0 8" 
          fill="none" 
          stroke="url(#woodGradL)" 
          strokeWidth="1.2"
        />
        <circle cx="38" cy="8" r="1.5" fill="#D4AF37" />
      </svg>
    </div>
    
    {/* Side ornaments for ornate variant */}
    {variant === "ornate" && (
      <>
        <div className="absolute left-8 md:left-16 top-1/2 -translate-y-1/2">
          <svg viewBox="0 0 24 12" className="w-6 h-3 text-amber-300/60">
            <path d="M0 6 L8 3 L16 6 L8 9 Z" fill="currentColor" />
            <circle cx="20" cy="6" r="2" fill="currentColor" />
          </svg>
        </div>
        <div className="absolute right-8 md:right-16 top-1/2 -translate-y-1/2">
          <svg viewBox="0 0 24 12" className="w-6 h-3 text-amber-300/60" style={{ transform: 'scaleX(-1)' }}>
            <path d="M0 6 L8 3 L16 6 L8 9 Z" fill="currentColor" />
            <circle cx="20" cy="6" r="2" fill="currentColor" />
          </svg>
        </div>
      </>
    )}
  </div>
);

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
      {/* Hero Section - Royal Palace Malay Style */}
      <section className="relative min-h-[55vh] md:min-h-[65vh] overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-amber-50/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-100/40 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-amber-100/30 via-transparent to-transparent" />
        
        {/* Elegant Songket Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23B8860B'%3E%3Cpath d='M40 0L44 4L40 8L36 4L40 0zM20 20L24 24L20 28L16 24L20 20zM60 20L64 24L60 28L56 24L60 20zM40 40L44 44L40 48L36 44L40 40zM20 60L24 64L20 68L16 64L20 60zM60 60L64 64L60 68L56 64L60 60zM0 40L4 44L0 48L-4 44L0 40zM80 40L84 44L80 48L76 44L80 40z'/%3E%3Crect x='38' y='18' width='4' height='4' rx='1'/%3E%3Crect x='18' y='38' width='4' height='4' rx='1'/%3E%3Crect x='58' y='38' width='4' height='4' rx='1'/%3E%3Crect x='38' y='58' width='4' height='4' rx='1'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Royal Gold Frame - Top Left */}
        <div className="absolute top-4 left-4 md:top-8 md:left-8 w-20 h-20 md:w-28 md:h-28">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="goldGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.6"/>
                <stop offset="50%" stopColor="#FFD700" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#B8860B" stopOpacity="0.6"/>
              </linearGradient>
            </defs>
            <path d="M0 0 L70 0 L70 6 L6 6 L6 70 L0 70 Z" fill="url(#goldGrad1)"/>
            <path d="M12 0 L12 12 L0 12" fill="none" stroke="url(#goldGrad1)" strokeWidth="2"/>
            <circle cx="18" cy="18" r="3" fill="url(#goldGrad1)"/>
            <path d="M24 6 L24 24 L6 24" fill="none" stroke="url(#goldGrad1)" strokeWidth="1" opacity="0.5"/>
          </svg>
        </div>
        
        {/* Royal Gold Frame - Top Right */}
        <div className="absolute top-4 right-4 md:top-8 md:right-8 w-20 h-20 md:w-28 md:h-28 rotate-90">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <defs>
              <linearGradient id="goldGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#B8860B" stopOpacity="0.6"/>
                <stop offset="50%" stopColor="#FFD700" stopOpacity="0.8"/>
                <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.6"/>
              </linearGradient>
            </defs>
            <path d="M0 0 L70 0 L70 6 L6 6 L6 70 L0 70 Z" fill="url(#goldGrad2)"/>
            <path d="M12 0 L12 12 L0 12" fill="none" stroke="url(#goldGrad2)" strokeWidth="2"/>
            <circle cx="18" cy="18" r="3" fill="url(#goldGrad2)"/>
          </svg>
        </div>
        
        {/* Royal Gold Frame - Bottom Left */}
        <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 w-20 h-20 md:w-28 md:h-28 -rotate-90">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M0 0 L70 0 L70 6 L6 6 L6 70 L0 70 Z" fill="url(#goldGrad1)"/>
            <path d="M12 0 L12 12 L0 12" fill="none" stroke="url(#goldGrad1)" strokeWidth="2"/>
            <circle cx="18" cy="18" r="3" fill="url(#goldGrad1)"/>
          </svg>
        </div>
        
        {/* Royal Gold Frame - Bottom Right */}
        <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 w-20 h-20 md:w-28 md:h-28 rotate-180">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M0 0 L70 0 L70 6 L6 6 L6 70 L0 70 Z" fill="url(#goldGrad2)"/>
            <path d="M12 0 L12 12 L0 12" fill="none" stroke="url(#goldGrad2)" strokeWidth="2"/>
            <circle cx="18" cy="18" r="3" fill="url(#goldGrad2)"/>
          </svg>
        </div>

        {/* Decorative gold lines on sides */}
        <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-gradient-to-b from-transparent via-amber-400/40 to-transparent" />
        <div className="absolute right-0 top-1/4 bottom-1/4 w-1 bg-gradient-to-b from-transparent via-amber-400/40 to-transparent" />

        {/* Main Content */}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-20 flex flex-col justify-center min-h-[55vh] md:min-h-[65vh]">
          <div className="max-w-2xl mx-auto md:mx-0 text-center md:text-left">
            {/* Heritage Badge with shimmer */}
            <div className="inline-flex items-center gap-2 mb-5 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 border border-amber-300/60 shadow-sm shadow-amber-200/50">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-amber-800 text-sm font-semibold tracking-wide">
                Warisan Budaya Melayu
              </span>
              <div className="w-2 h-2 rounded-full bg-gradient-to-br from-amber-400 to-amber-600" />
            </div>

            {/* Main Heading with 3D gold metallic effect */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-5">
              <span 
                className="inline-block text-transparent bg-clip-text"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #1a1a1a 0%, #4a4a4a 25%, #1a1a1a 50%, #4a4a4a 75%, #1a1a1a 100%)',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                Keindahan
              </span>
              <br />
              <span 
                className="inline-block text-transparent bg-clip-text relative"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #8B6914 0%, #D4AF37 15%, #FFD700 30%, #FFF8DC 45%, #FFD700 55%, #D4AF37 70%, #B8860B 85%, #8B6914 100%)',
                  backgroundSize: '200% 200%',
                  animation: 'shimmer 3s ease-in-out infinite',
                  filter: 'drop-shadow(2px 2px 2px rgba(139, 105, 20, 0.4)) drop-shadow(-1px -1px 1px rgba(255, 248, 220, 0.3))',
                  WebkitBackgroundClip: 'text',
                }}
              >
                Tenunan Songket
              </span>
            </h1>

            {/* Royal decorative divider */}
            <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
              <div className="h-0.5 w-10 bg-gradient-to-r from-transparent via-amber-400 to-amber-500 rounded-full" />
              <div className="w-2 h-2 rotate-45 bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm" />
              <div className="h-0.5 w-6 bg-amber-500 rounded-full" />
              <div className="w-3 h-3 rounded-full border-2 border-amber-500 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-amber-500" />
              </div>
              <div className="h-0.5 w-6 bg-amber-500 rounded-full" />
              <div className="w-2 h-2 rotate-45 bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm" />
              <div className="h-0.5 w-10 bg-gradient-to-l from-transparent via-amber-400 to-amber-500 rounded-full" />
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Button 
                asChild 
                size="lg" 
                className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-700 hover:via-amber-600 hover:to-amber-700 text-white border-0 shadow-lg shadow-amber-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/40 hover:scale-[1.02]"
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
                className="border-2 border-amber-400 text-amber-700 hover:bg-gradient-to-r hover:from-amber-50 hover:to-amber-100 hover:text-amber-800 hover:border-amber-500 transition-all duration-300"
              >
                <Link href="#jenis-corak">Lihat Kategori</Link>
              </Button>
            </div>

            {/* Trust indicators with royal style */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 md:gap-6 mt-8 pt-6 border-t border-amber-200/60">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-amber-200/50 shadow-sm">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-slate-700 text-sm font-medium">100% Handmade</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-amber-200/50 shadow-sm">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                </div>
                <span className="text-slate-700 text-sm font-medium">Benang Emas Asli</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-amber-200/50 shadow-sm">
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-slate-700 text-sm font-medium">Kualiti Terjamin</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Jenis Corak Kain Section - with gold ornaments */}
      <section id="jenis-corak" className="relative py-12 md:py-16 bg-white">
        {/* Top elegant wood carving divider */}
        <SectionDivider variant="ornate" />
        
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
        
        {/* Bottom elegant wood carving divider */}
        <SectionDivider />
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
        {/* Elegant wood carving divider */}
        <SectionDivider variant="ornate" />
        
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
        {/* Elegant wood carving divider */}
        <SectionDivider variant="ornate" />
        
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
