"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star, Eye } from "lucide-react";
import { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/components/cart/CartProvider";
import { cn } from "@/lib/utils";
import { GridDensity } from "./GridDensityToggle";

// Elegant wood carving corner ornament SVG
const CornerOrnament = ({ className, flip = false }: { className?: string; flip?: boolean }) => (
  <svg 
    viewBox="0 0 24 24" 
    className={cn("w-5 h-5 text-amber-400/70", className)}
    style={{ transform: flip ? 'scaleX(-1)' : undefined }}
  >
    <defs>
      <linearGradient id="goldOrnament" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#D4AF37" />
        <stop offset="50%" stopColor="#FFD700" />
        <stop offset="100%" stopColor="#B8860B" />
      </linearGradient>
    </defs>
    <path 
      d="M2 2 L8 2 C6 4 4 6 2 8 L2 2 M4 2 Q6 6 2 10 M6 2 Q8 4 8 8 Q4 8 2 6" 
      fill="none" 
      stroke="url(#goldOrnament)" 
      strokeWidth="0.8"
      strokeLinecap="round"
    />
    <circle cx="3" cy="3" r="1" fill="url(#goldOrnament)" />
  </svg>
);

interface ProductCardProps {
  product: Product;
  density?: GridDensity;
  onQuickView?: (product: Product) => void;
}

export function ProductCard({ product, density = "comfortable", onQuickView }: ProductCardProps) {
  const { addItem } = useCart();
  const isCompact = density === "compact";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  };

  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="group overflow-hidden h-full hover:shadow-lg transition-shadow duration-300 relative border-amber-200/50 hover:border-amber-300/70">
        {/* Elegant corner ornaments */}
        <div className="absolute top-0 left-0 z-10 opacity-60 group-hover:opacity-100 transition-opacity">
          <CornerOrnament />
        </div>
        <div className="absolute top-0 right-0 z-10 opacity-60 group-hover:opacity-100 transition-opacity rotate-90">
          <CornerOrnament />
        </div>
        <div className="absolute bottom-0 left-0 z-10 opacity-60 group-hover:opacity-100 transition-opacity -rotate-90">
          <CornerOrnament />
        </div>
        <div className="absolute bottom-0 right-0 z-10 opacity-60 group-hover:opacity-100 transition-opacity rotate-180">
          <CornerOrnament />
        </div>
        {/* Image Container - smaller aspect ratio */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <Image
            src={product.image || "/images/placeholder-product.jpg"}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            loading="lazy"
            quality={75}
          />
          
          {/* Stock Badge */}
          {!product.inStock && (
            <Badge
              variant="destructive"
              className={cn(
                "absolute top-2 left-2",
                isCompact ? "text-[9px] px-1.5 py-0" : "text-xs"
              )}
            >
              Habis
            </Badge>
          )}

          {/* Quick Add Button */}
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1.5">
            {/* Quick View Button - Desktop only */}
            {onQuickView && (
              <Button
                size="icon"
                variant="secondary"
                onClick={handleQuickView}
                className={cn(
                  "rounded-full shadow-lg hidden md:flex",
                  isCompact ? "h-6 w-6" : "h-8 w-8"
                )}
                aria-label={`Lihat cepat ${product.title}`}
              >
                <Eye className={isCompact ? "h-3 w-3" : "h-3.5 w-3.5"} />
              </Button>
            )}
            <Button
              size="icon"
              variant="secondary"
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={cn(
                "rounded-full shadow-lg",
                isCompact ? "h-6 w-6" : "h-8 w-8"
              )}
              aria-label={`Tambah ${product.title} ke keranjang`}
            >
              <ShoppingCart className={isCompact ? "h-3 w-3" : "h-3.5 w-3.5"} />
            </Button>
          </div>
        </div>

        <CardContent className={cn(isCompact ? "p-2" : "p-3")}>
          {/* Category */}
          <p className={cn(
            "text-muted-foreground uppercase tracking-wide",
            isCompact ? "text-[8px] mb-0" : "text-[10px] mb-0.5"
          )}>
            {product.category}
          </p>

          {/* Title */}
          <h3 className={cn(
            "font-medium line-clamp-2 group-hover:text-primary transition-colors leading-tight",
            isCompact ? "text-xs mb-1" : "text-sm mb-1.5"
          )}>
            {product.title}
          </h3>

          {/* Rating & Sold - compact */}
          <div className={cn(
            "flex items-center gap-1.5 text-muted-foreground",
            isCompact ? "text-[9px] mb-1" : "text-[11px] mb-1.5"
          )}>
            <div className="flex items-center gap-0.5">
              <Star className={cn(
                "fill-amber-400 text-amber-400",
                isCompact ? "h-2.5 w-2.5" : "h-3 w-3"
              )} />
              <span className="font-medium text-foreground">{product.rating.toFixed(1)}</span>
            </div>
            <span className="text-muted-foreground/50">|</span>
            <span>{product.sold} terjual</span>
          </div>

          {/* Price */}
          <p className={cn(
            "font-bold text-primary",
            isCompact ? "text-xs" : "text-sm"
          )}>
            {formatPrice(product.price)}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
