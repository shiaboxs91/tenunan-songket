"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, ShoppingCart, ExternalLink } from "lucide-react";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface QuickViewModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart: (product: Product) => void;
}

export function QuickViewModal({
  product,
  open,
  onOpenChange,
  onAddToCart,
}: QuickViewModalProps) {
  if (!product) return null;

  const handleAddToCart = () => {
    onAddToCart(product);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <div className="grid sm:grid-cols-2 gap-0">
          {/* Product Image */}
          <div className="relative aspect-square bg-muted">
            <Image
              src={product.image || "/images/placeholder-product.svg"}
              alt={product.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 300px"
            />
            {!product.inStock && (
              <Badge
                variant="destructive"
                className="absolute top-3 left-3"
              >
                Stok Habis
              </Badge>
            )}
          </div>

          {/* Product Info */}
          <div className="p-6 flex flex-col">
            <DialogHeader className="text-left mb-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                {product.category}
              </p>
              <DialogTitle className="text-lg font-semibold line-clamp-2">
                {product.title}
              </DialogTitle>
            </DialogHeader>

            {/* Rating & Sold */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium text-foreground">
                  {product.rating.toFixed(1)}
                </span>
              </div>
              <span className="text-muted-foreground/50">|</span>
              <span>{product.sold} terjual</span>
            </div>

            {/* Price */}
            <p className="text-2xl font-bold text-primary mb-4">
              {formatPrice(product.price)}
            </p>

            {/* Short Description */}
            <DialogDescription className="text-sm text-muted-foreground line-clamp-3 mb-6 flex-grow">
              {product.description || "Produk tenun berkualitas tinggi dengan motif tradisional yang indah."}
            </DialogDescription>

            {/* Actions */}
            <div className="space-y-3 mt-auto">
              <Button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="w-full"
                size="lg"
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {product.inStock ? "Tambah ke Keranjang" : "Stok Habis"}
              </Button>

              <Link
                href={`/products/${product.slug}`}
                onClick={() => onOpenChange(false)}
                className="block"
              >
                <Button variant="outline" className="w-full" size="lg">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Lihat Detail Produk
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
