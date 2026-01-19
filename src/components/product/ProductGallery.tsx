"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  productTitle: string;
}

export function ProductGallery({ images, productTitle }: ProductGalleryProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const galleryImages = images.length > 0 ? images : ["/images/placeholder-product.jpg"];

  // Embla Carousel Init
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000, stopOnInteraction: true })
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Sync state with carousel
  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Navigation handlers
  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  return (
    <>
      <div className="space-y-3">
        {/* Main Carousel */}
        <div className="relative overflow-hidden rounded-xl bg-muted group">
          <div className="cursor-zoom-in" onClick={() => setIsZoomed(true)} ref={emblaRef}>
            <div className="flex touch-pan-y">
              {galleryImages.map((image, index) => (
                <div key={index} className="relative flex-[0_0_100%] min-w-0 aspect-square">
                  <Image
                    src={image}
                    alt={`${productTitle} - Gambar ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Zoom hint */}
          <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <ZoomIn className="h-3 w-3" />
            <span>Zoom</span>
          </div>

          {/* Navigation Arrows */}
          {galleryImages.length > 1 && (
            <>
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full opacity-0 group-hover:opacity-90 transition-opacity shadow-lg z-10"
                onClick={(e) => { e.stopPropagation(); scrollPrev(); }}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full opacity-0 group-hover:opacity-90 transition-opacity shadow-lg z-10"
                onClick={(e) => { e.stopPropagation(); scrollNext(); }}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* Image Counter */}
          {galleryImages.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full pointer-events-none">
              {selectedIndex + 1} / {galleryImages.length}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {galleryImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {galleryImages.map((image, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={cn(
                  "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all",
                  selectedIndex === index
                    ? "border-primary ring-2 ring-primary/20 opacity-100"
                    : "border-transparent opacity-70 hover:opacity-100 hover:border-muted-foreground/30"
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

      {/* Lightbox / Zoom Modal - Reusing state for simple zoom for now */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center animate-in fade-in duration-200"
          onClick={() => setIsZoomed(false)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 h-10 w-10 number-full text-white hover:bg-white/20 z-50"
            onClick={() => setIsZoomed(false)}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Navigation for zoomed view could be separate carousel, but keeping it simple linked to main for now */}
           <div 
            className="relative w-full h-full max-w-6xl max-h-[90vh] p-4 flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
             {/* Reuse simple nav for zoom view or enhance later. For now showing current selected high res */}
             <div className="relative w-full h-full">
                <Image
                  src={galleryImages[selectedIndex]}
                  alt={`${productTitle} - Zoom ${selectedIndex + 1}`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
             </div>
             
             {/* Zoom Nav */}
             {galleryImages.length > 1 && (
               <>
                 <Button
                   variant="ghost"
                   size="icon"
                   className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full text-white hover:bg-white/20"
                   onClick={(e) => { e.stopPropagation(); scrollPrev(); }}
                 >
                   <ChevronLeft className="h-8 w-8" />
                 </Button>
                 <Button
                   variant="ghost"
                   size="icon"
                   className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full text-white hover:bg-white/20"
                   onClick={(e) => { e.stopPropagation(); scrollNext(); }}
                 >
                   <ChevronRight className="h-8 w-8" />
                 </Button>
               </>
             )}
          </div>
          
           {/* Counter */}
           <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white text-sm">
             {selectedIndex + 1} / {galleryImages.length}
           </div>
        </div>
      )}
    </>
  );
}
