import { notFound } from "next/navigation";
import { Star, Truck, Shield, Sparkles } from "lucide-react";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductReviews } from "@/components/product/ProductReviews";
import { StickyProductCTA } from "@/components/product/StickyProductCTA";
import { AddToCartButton } from "./AddToCartButton";
import { Badge } from "@/components/ui/badge";
// Temporarily disabled due to Radix UI issue
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice } from "@/lib/utils";
import { getRelatedProducts } from "@/lib/products";
import { Product } from "@/lib/types";
import snapshotData from "@/data/products.snapshot.json";

interface ProductDetailPageProps {
  params: { slug: string };
}

async function getProduct(slug: string): Promise<Product | null> {
  // snapshotData is directly an array
  const products = snapshotData as unknown as Product[];
  return products.find((p) => p.slug === slug) || null;
}

async function getRecommendations(product: Product): Promise<Product[]> {
  // snapshotData is directly an array
  const products = snapshotData as unknown as Product[];
  return getRelatedProducts(products, product, 4);
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const product = await getProduct(params.slug);

  if (!product) {
    notFound();
  }

  const recommendations = await getRecommendations(product);
  const images = product.image ? [product.image] : [];

  return (
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

          {/* Variant Selector (Demo) */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Pilih Motif</label>
            <div className="flex flex-wrap gap-2">
              {["Original", "Lepus", "Nago Besaung", "Bungo Mawar"].map(
                (motif) => (
                  <button
                    key={motif}
                    className="px-4 py-2 text-sm border rounded-md hover:border-primary hover:text-primary transition-colors first:border-primary first:text-primary"
                  >
                    {motif}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Add to Cart Buttons */}
          <AddToCartButton product={product} />

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
  );
}
