import { notFound } from "next/navigation";
import { Metadata } from "next";
import { Star, Truck, Shield, Sparkles } from "lucide-react";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductReviews } from "@/components/product/ProductReviews";
import { StickyProductCTA } from "@/components/product/StickyProductCTA";
import { ProductActions } from "@/components/product/ProductActions";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { getProductBySlug, getProductsByCategory } from "@/lib/supabase/products";
import { toFrontendProduct, toFrontendProducts } from "@/lib/supabase/adapters";
import { Product } from "@/lib/types";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/seo";

// ISR: Revalidate product pages every 60 seconds
export const revalidate = 60;

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

// Generate dynamic metadata for SEO
export async function generateMetadata({ 
  params 
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  
  const supabaseProduct = await getProductBySlug(decodedSlug);
  
  if (!supabaseProduct) {
    return {
      title: 'Produk Tidak Ditemukan - Tenunan Songket',
      description: 'Produk yang anda cari tidak ditemukan.',
    };
  }
  
  const primaryImage = supabaseProduct.images?.find((img) => img.is_primary)?.url 
    || supabaseProduct.images?.[0]?.url;
  
  // Use meta_title/meta_description if available, otherwise generate from product data
  const title = supabaseProduct.meta_title 
    || `${supabaseProduct.title} - Beli Kain Songket Asli Online`;
  
  const description = supabaseProduct.meta_description 
    || supabaseProduct.description?.slice(0, 155) 
    || `Beli ${supabaseProduct.title} asli berkualiti tinggi. Kain tenunan tradisional Melayu dengan benang emas, 100% handmade. Penghantaran ke Brunei, Malaysia, Singapura.`;
  
  const productUrl = `https://tenunansongket.com/products/${decodedSlug}`;
  
  return {
    title,
    description,
    keywords: [
      'kain songket',
      'songket asli',
      'kain tenunan',
      'songket brunei',
      'songket melayu',
      'benang emas',
      'handmade',
      supabaseProduct.title,
    ].join(', '),
    openGraph: {
      title,
      description,
      type: 'website',
      url: productUrl,
      siteName: 'Tenunan Songket',
      locale: 'ms_MY',
      images: primaryImage ? [
        {
          url: primaryImage,
          width: 1200,
          height: 630,
          alt: supabaseProduct.title,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: primaryImage ? [primaryImage] : [],
    },
    alternates: {
      canonical: productUrl,
    },
    other: {
      'product:price:amount': String(supabaseProduct.sale_price || supabaseProduct.price),
      'product:price:currency': 'BND',
      'product:availability': supabaseProduct.stock && supabaseProduct.stock > 0 ? 'in stock' : 'out of stock',
    },
  };
}

async function getProduct(slug: string): Promise<{ product: Product | null; images: string[] }> {
  const supabaseProduct = await getProductBySlug(slug);
  if (!supabaseProduct) {
    return { product: null, images: [] };
  }
  
  // Get all images sorted by display order
  const images = supabaseProduct.images
    ?.sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    .map(img => img.url) || [];
  
  return { 
    product: toFrontendProduct(supabaseProduct),
    images: images.length > 0 ? images : ['/images/placeholder-product.svg']
  };
}

async function getRecommendations(categorySlug: string, currentProductId: string): Promise<Product[]> {
  const products = await getProductsByCategory(categorySlug);
  const filtered = products.filter(p => p.id !== currentProductId).slice(0, 4);
  return toFrontendProducts(filtered);
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  
  const { product, images } = await getProduct(decodedSlug);

  if (!product) {
    notFound();
  }

  // Get category slug from product category name for recommendations
  const categorySlug = product.category.toLowerCase().replace(/\s+/g, '-');
  const recommendations = await getRecommendations(categorySlug, product.id);

  // Prepare data for JSON-LD structured data
  const productUrl = `https://tenunansongket.com/products/${decodedSlug}`;
  const primaryImage = images[0] || '/images/placeholder-product.svg';

  return (
    <>
      {/* SEO: Product JSON-LD Structured Data */}
      <ProductJsonLd 
        product={{
          title: product.title,
          description: product.description,
          price: product.price,
          currency: 'BND',
          image: primaryImage,
          images: images,
          url: productUrl,
          sku: product.id,
          inStock: product.inStock,
          rating: product.rating,
          reviewCount: product.sold > 0 ? Math.floor(product.sold * 0.3) : 0,
          brand: 'Tenunan Songket',
          category: product.category,
        }}
      />
      
      {/* SEO: Breadcrumb JSON-LD */}
      <BreadcrumbJsonLd 
        items={[
          { name: 'Beranda', url: 'https://tenunansongket.com' },
          { name: 'Produk', url: 'https://tenunansongket.com/products' },
          { name: product.category, url: `https://tenunansongket.com/products?category=${categorySlug}` },
          { name: product.title, url: productUrl },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Gallery */}
          <ProductGallery images={images} productTitle={product.title} />

          {/* Product Info */}
          <div className="space-y-6">
            {/* Category & Tags */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{product.category}</Badge>
              {product.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold">{product.title}</h1>

            {/* Rating & Sold */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-gold text-gold" />
                <span className="font-medium">{product.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">(128 ulasan)</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">
                {product.sold} terjual
              </span>
            </div>

            {/* Price */}
            <div className="py-4 border-y">
              <p className="text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </p>
            </div>

            {/* Stock Status */}
            {product.inStock ? (
              <div className="flex items-center gap-2 text-green-600">
                <div className="h-2 w-2 rounded-full bg-green-600" />
                <span className="text-sm font-medium">Stok tersedia</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <div className="h-2 w-2 rounded-full bg-red-600" />
                <span className="text-sm font-medium">Stok habis</span>
              </div>
            )}

            {/* Product Actions (Variant + Cart) */}
            <ProductActions 
              product={product} 
              variants={["Original", "Lepus", "Nago Besaung", "Bungo Mawar"]} 
            />

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center">
                <Truck className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">Pengiriman Aman</p>
              </div>
              <div className="text-center">
                <Shield className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">Garansi Keaslian</p>
              </div>
              <div className="text-center">
                <Sparkles className="h-5 w-5 mx-auto text-muted-foreground mb-1" />
                <p className="text-xs text-muted-foreground">Handmade</p>
              </div>
            </div>
          </div>
        </div>

        {/* Product Description - simplified without Tabs due to Radix UI issue */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">Deskripsi</h2>
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
            <h4 className="font-semibold mt-4 mb-2">Spesifikasi:</h4>
            <ul className="text-muted-foreground space-y-1">
              <li>Bahan: Sutra dan benang emas</li>
              <li>Ukuran: 200cm x 100cm (dapat disesuaikan)</li>
              <li>Asal: {product.category.replace("Songket ", "")}</li>
              <li>Teknik: Tenun tradisional</li>
            </ul>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6">Ulasan Pelanggan</h2>
          <ProductReviews 
            productId={product.id} 
            productRating={product.rating} 
            totalReviews={product.sold > 0 ? Math.floor(product.sold * 0.3) : 0} 
          />
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Produk Serupa</h2>
            <ProductGrid products={recommendations} />
          </div>
        )}

        {/* Sticky CTA for Mobile */}
        <StickyProductCTA product={product} />
      </div>
    </>
  );
}
