import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/product/ProductGrid";
import { HeroSlider } from "@/components/home/HeroSlider";
import { TrustBadges } from "@/components/mobile/TrustBadges";
import { getPopularProducts, getLatestProducts } from "@/lib/supabase/products";
import { getCategoriesWithProductCount } from "@/lib/supabase/categories";
import { toFrontendProducts } from "@/lib/supabase/adapters";
import categoryImagesData from "@/data/category-images.json";
import { getTranslations } from "next-intl/server";

// Simple Section Divider - optimized for performance
const SectionDivider = () => (
  <div className="relative h-6 flex items-center justify-center overflow-hidden" aria-hidden="true">
    <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />
    <div className="relative z-10 flex items-center gap-1 bg-white px-4">
      <div className="w-2 h-2 rotate-45 bg-amber-400" />
    </div>
  </div>
);

async function getHomeData() {
  // Fetch data from Supabase
  const [popularProductsRaw, latestProductsRaw, categoriesWithCount] = await Promise.all([
    getPopularProducts(5),
    getLatestProducts(5),
    getCategoriesWithProductCount(),
  ]);

  // Convert to frontend format
  const popularProducts = toFrontendProducts(popularProductsRaw);
  const latestProducts = toFrontendProducts(latestProductsRaw);

  // Build category data with images from local config
  const categoryImages = categoryImagesData.categories.reduce((acc, cat) => {
    acc[cat.name] = cat.image;
    return acc;
  }, {} as Record<string, string>);

  const jenisCorak = categoriesWithCount.map(cat => ({
    name: cat.name,
    items: cat.product_count,
    image: categoryImages[cat.name] || '/images/placeholder-product.svg',
  }));

  return {
    popularProducts,
    latestProducts,
    jenisCorak,
  };
}

export default async function HomePage() {
  const { popularProducts, latestProducts, jenisCorak } = await getHomeData();
  const t = await getTranslations("home");
  const tCommon = await getTranslations("common");

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[60vh] md:min-h-[70vh] overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-white to-amber-50/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-100/40 via-transparent to-transparent" />
        
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23B8860B'%3E%3Cpath d='M40 0L44 4L40 8L36 4L40 0zM20 20L24 24L20 28L16 24L20 20zM60 20L64 24L60 28L56 24L60 20zM40 40L44 44L40 48L36 44L40 40z'/%3E%3C/g%3E%3C/svg%3E")`,
        }} />

        {/* Border lines */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-300/40 to-transparent" />

        {/* Main Content */}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center min-h-[50vh] md:min-h-[60vh]">
            {/* Left - Text Content */}
            <div className="text-center md:text-left order-2 md:order-1">
              {/* Heritage Badge */}
              <div className="inline-flex items-center gap-2 mb-4 md:mb-5 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 border border-amber-300/60 shadow-sm">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="text-amber-800 text-sm font-semibold">{t("heritageBadge")}</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight mb-4 md:mb-5">
                <span className="inline-block text-slate-800">{t("beautyOf")}</span>
                <br />
                <span 
                  className="inline-block text-transparent bg-clip-text"
                  style={{
                    backgroundImage: 'linear-gradient(135deg, #8B6914 0%, #D4AF37 15%, #FFD700 30%, #FFF8DC 45%, #FFD700 55%, #D4AF37 70%, #B8860B 85%, #8B6914 100%)',
                    backgroundSize: '200% 200%',
                    animation: 'shimmer 8s ease-in-out infinite',
                  }}
                >
                  {t("songketWeaving")}
                </span>
              </h1>

              {/* Decorative divider */}
              <div className="flex items-center justify-center md:justify-start gap-2 mb-5 md:mb-6">
                <div className="h-0.5 w-8 md:w-10 bg-gradient-to-r from-transparent via-amber-400 to-amber-500 rounded-full" />
                <div className="w-2 h-2 rotate-45 bg-amber-500" />
                <div className="h-0.5 w-8 md:w-10 bg-gradient-to-l from-transparent via-amber-400 to-amber-500 rounded-full" />
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Button asChild size="lg" className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-700 hover:via-amber-600 hover:to-amber-700 text-white shadow-lg shadow-amber-500/30 h-12 md:h-11 text-base">
                  <Link href="/products">
                    {tCommon("shopNow")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="border-2 border-amber-400 text-amber-700 hover:bg-amber-50 h-12 md:h-11 text-base">
                  <Link href="#jenis-corak">{tCommon("viewCategories")}</Link>
                </Button>
              </div>

              {/* Trust indicators - hidden on mobile for cleaner look */}
              <div className="hidden md:flex flex-wrap items-center gap-4 mt-8 pt-6 border-t border-amber-200/60">
                {[
                  { icon: "M5 13l4 4L19 7", labelKey: "handmade" },
                  { icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z", labelKey: "realGoldThread" },
                  { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", labelKey: "qualityGuaranteed" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 border border-amber-200/50 shadow-sm">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                      <svg className="w-3 h-3 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                      </svg>
                    </div>
                    <span className="text-slate-700 text-sm font-medium">{t(item.labelKey)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right - Hero Slider */}
            <div className="order-1 md:order-2 w-full">
              <HeroSlider />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges - Mobile Only */}
      <TrustBadges />

      {/* Jenis Corak Kain Section */}
      <section id="jenis-corak" className="relative py-10 md:py-16 bg-white">
        <SectionDivider />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 md:mb-10">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-400" />
              <div className="w-1.5 h-1.5 rotate-45 bg-amber-500" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-400" />
            </div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800">{t("fabricPatterns")}</h2>
            <p className="text-slate-500 text-sm mt-2">{t("fabricPatternsDesc")}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-10">
            {jenisCorak.map((corak) => (
              <Link key={corak.name} href={`/products?q=${encodeURIComponent(corak.name)}`} className="group flex flex-col items-center text-center">
                <div className="relative w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full overflow-hidden mb-2 md:mb-3 ring-2 ring-amber-200 group-hover:ring-amber-400 transition-all shadow-sm group-hover:shadow-md">
                  <Image src={corak.image} alt={corak.name} fill className="object-cover group-hover:scale-110 transition-transform duration-300" sizes="96px" />
                </div>
                <span className="text-xs md:text-sm font-medium text-slate-700 group-hover:text-amber-700 transition-colors">{corak.name}</span>
                <span className="text-xs text-slate-400">{corak.items} {t("items")}</span>
              </Link>
            ))}
          </div>
        </div>
        <SectionDivider />
      </section>

      {/* Popular Products */}
      <section className="relative py-10 md:py-16 bg-slate-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1 md:mb-2">
                <span className="w-1 h-4 md:h-5 bg-amber-500 rounded-full" />
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800">{t("popularProducts")}</h2>
              </div>
              <p className="text-slate-500 text-sm">{t("popularDesc")}</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-amber-700 hover:text-amber-800 hover:bg-amber-50">
              <Link href="/products?sort=bestselling">
                {tCommon("viewAll")}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <ProductGrid products={popularProducts} />
        </div>
      </section>

      {/* Latest Products */}
      <section className="relative py-10 md:py-16 bg-white">
        <SectionDivider />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1 md:mb-2">
                <span className="w-1 h-4 md:h-5 bg-amber-500 rounded-full" />
                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-800">{t("latestProducts")}</h2>
              </div>
              <p className="text-slate-500 text-sm">{t("latestDesc")}</p>
            </div>
            <Button asChild variant="ghost" size="sm" className="text-amber-700 hover:text-amber-800 hover:bg-amber-50">
              <Link href="/products?sort=newest">
                {tCommon("viewAll")}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <ProductGrid products={latestProducts} />
        </div>
      </section>

      {/* USP Section */}
      <section className="relative py-10 md:py-16 bg-gradient-to-b from-slate-50 to-white">
        <SectionDivider />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-12">
            {[
              { icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", titleKey: "handmadeWithLove", descKey: "handmadeWithLoveDesc" },
              { icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z", titleKey: "premiumQuality", descKey: "premiumQualityDesc" },
              { icon: "M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7", titleKey: "culturalHeritage", descKey: "culturalHeritageDesc" },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-amber-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={item.icon} />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2 text-slate-800">{t(item.titleKey)}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{t(item.descKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
