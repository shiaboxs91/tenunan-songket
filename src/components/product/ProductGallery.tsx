"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  productTitle: string;
}

export function ProductGallery({ images, productTitle }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const galleryImages = images.length > 0 ? images : ["/images/placeholder-product.jpg"];

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? galleryImages.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) =>
      prev === galleryImages.length - 1 ? 0 : prev + 1
    );
  };

  const goToIndex = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <>
      <div className="space-y-3">
        {/* Main Image */}
        <div 
          className="relative aspect-square overflow-hidden rounded-xl bg-muted cursor-zoom-in group"
          onClick={() => setIsZoomed(true)}
        >
          <Image
            src={galleryImages[currentIndex]}
            alt={`${productTitle} - Gambar ${currentIndex + 1}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />

          {/* Zoom hint */}
          <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn className="h-3 w-3" />
            <span>Zoom</span>
          </div>

          {/* Navigation Arrows */}
          {galleryImages.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full opacity-0 group-hover:opacity-90 transition-opacity shadow-lg"
                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full opacity-0 group-hover:opacity-90 transition-opacity shadow-lg"
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* Image Counter */}
          {galleryImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
              {currentIndex + 1} / {galleryImages.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {galleryImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {galleryImages.map((image, index) => (
              <button
                key={index}
                onClick={() => goToIndex(index)}
                className={cn(
                  "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                  currentIndex === index
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-transparent hover:border-muted-foreground/30"
                )}
              >
                <Image
                  src={image}
                  alt={`${productTitle} - Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox / Zoom Modal */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setIsZoomed(false)}
        >
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 h-10 w-10 rounded-full text-white hover:bg-white/20 z-10"
            onClick={() => setIsZoomed(false)}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Navigation */}
          {galleryImages.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full text-white hover:bg-white/20"
                onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full text-white hover:bg-white/20"
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          {/* Zoomed Image */}
          <div 
            className="relative w-full h-full max-w-5xl max-h-[85vh] m-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={galleryImages[currentIndex]}
              alt={`${productTitle} - Gambar ${currentIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {/* Counter */}
          {galleryImages.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm">
              {currentIndex + 1} / {galleryImages.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}
