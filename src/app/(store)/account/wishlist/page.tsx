"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Heart, Loader2, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getWishlist, removeFromWishlist, type WishlistItem } from "@/lib/supabase/wishlist";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";

export default function WishlistPage() {
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login?redirect=/account/wishlist");
        return;
      }

      const wishlistItems = await getWishlist();
      setItems(wishlistItems);
      setIsLoading(false);
    };
    checkAuthAndLoad();
  }, [router]);

  const handleRemove = async (productId: string) => {
    setRemovingId(productId);
    const success = await removeFromWishlist(productId);
    if (success) {
      setItems(prev => prev.filter(item => item.product_id !== productId));
    }
    setRemovingId(null);
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-md mx-auto text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-muted mb-6">
            <Heart className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Wishlist Kosong</h1>
          <p className="text-muted-foreground mb-6">
            Belum ada produk di wishlist Anda. Simpan produk favorit untuk dibeli nanti!
          </p>
          <Button asChild>
            <Link href="/products">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Jelajahi Produk
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">Wishlist Saya</h1>
      <p className="text-muted-foreground mb-6">{items.length} produk</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden group">
            <div className="relative aspect-square">
              <Link href={`/products/${item.product?.slug}`}>
                <Image
                  src={
                    item.product?.images?.find(img => img.is_primary)?.url ||
                    item.product?.images?.[0]?.url ||
                    "/images/placeholder-product.svg"
                  }
                  alt={item.product?.title || "Product"}
                  width={400}
                  height={400}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
              
              {/* Remove Button */}
              <button
                onClick={() => handleRemove(item.product_id)}
                disabled={removingId === item.product_id}
                className="absolute top-2 right-2 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm transition-all"
                aria-label="Hapus dari wishlist"
              >
                {removingId === item.product_id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 text-red-500" />
                )}
              </button>

              {/* Stock Badge */}
              {item.product && !item.product.is_active && (
                <div className="absolute bottom-2 left-2 px-2 py-1 bg-red-500 text-white text-xs rounded">
                  Stok Habis
                </div>
              )}
            </div>

            <CardContent className="p-4">
              <Link href={`/products/${item.product?.slug}`}>
                <h3 className="font-medium line-clamp-2 hover:text-primary transition-colors">
                  {item.product?.title}
                </h3>
              </Link>
              
              <p className="text-lg font-bold text-primary mt-2">
                {formatPrice(Number(item.product?.sale_price || item.product?.price || 0))}
              </p>

              {item.product?.category && (
                <p className="text-xs text-muted-foreground mt-1">
                  {item.product.category.name}
                </p>
              )}

              <Button
                asChild
                className="w-full mt-4"
                disabled={!item.product?.is_active}
              >
                <Link href={`/products/${item.product?.slug}`}>
                  Lihat Produk
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
