import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/product/ProductGrid";
import { HeroSlider } from "@/components/home/HeroSlider";
import { TrustBadges } from "@/components/mobile/TrustBadges";
import { getPopularProducts, getLatestProducts } from "@/lib/supabase/products";
import { getCategoriesWithProductCount } from "@/lib/supabase/categories";
import { getHeroSlides } from "@/lib/supabase/hero";
import { toFrontendProducts } from "@/lib/supabase/adapters";
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
  const [popularProductsRaw, latestProductsRaw, categoriesWithCount, heroSlides] = await Promise.all([
    getPopularProducts(5),
    getLatestProducts(5),
    getCategoriesWithProductCount(),
    getHeroSlides(),
  ]);

  // Convert to frontend format
  const popularProducts = toFrontendProducts(popularProductsRaw);
  const latestProducts = toFrontendProducts(latestProductsRaw);

  // Build category data with images from database
  const jenisCorak = categoriesWithCount.map(cat => ({
    name: cat.name,
    items: cat.product_count,
    image: cat.image_url || '/images/placeholder-product.svg',
  }));

  return {
    popularProducts,
    latestProducts,
    jenisCorak,
    heroSlides,
  };
}

export default async function HomePage() {
  const { popularProducts, latestProducts, jenisCorak, heroSlides } = await getHomeData();
  const t = await getTranslations("home");
  const tCommon = await getTranslations("common");

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full">
        <HeroSlider slides={heroSlides} />
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
