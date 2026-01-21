"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroSlide } from "@/lib/supabase/hero";
import { cn } from "@/lib/utils";

interface HeroSliderProps {
  slides: HeroSlide[];
}

export function HeroSlider({ slides }: HeroSliderProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 6000, stopOnInteraction: false }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  if (!slides || slides.length === 0) return null;

  return (
    <div className="relative group w-full h-[400px] sm:h-[450px] md:h-[550px] lg:h-[600px] bg-slate-100 overflow-hidden">
      <div className="absolute inset-0 z-0" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, index) => (
            <div className="relative flex-[0_0_100%] min-w-0 h-full" key={slide.id}>
              {/* Background Image */}
              <div className="absolute inset-0">
                <Image
                  src={slide.image_url}
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  className="object-cover"
                  sizes="100vw"
                  style={{ objectPosition: "center top" }} // Focus on top/center of image (usually faces/main content)
                />
                {/* Refined Gradient Overlay for Professional Look */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent sm:from-black/60 sm:via-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent sm:hidden" />
              </div>

              {/* Content Overlay */}
              <div className="relative z-10 h-full flex items-center">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="max-w-xl md:max-w-2xl text-white space-y-4 md:space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
                     {slide.subtitle && (
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-amber-200 text-xs md:text-sm font-medium tracking-wide uppercase">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        {slide.subtitle}
                      </div>
                     )}
                    
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight drop-shadow-lg">
                      {slide.title}
                    </h1>
                    
                    {slide.description && (
                      <p className="text-base sm:text-lg md:text-xl text-slate-100 leading-relaxed max-w-lg drop-shadow-md font-light">
                        {slide.description}
                      </p>
                    )}

                    <div className="pt-2 md:pt-4 flex flex-col sm:flex-row gap-3">
                      {slide.cta_text && (slide.cta_link || slide.link_url) && (
                        <Button 
                          asChild 
                          size="lg" 
                          className="bg-amber-600 hover:bg-amber-700 text-white rounded-full px-8 h-12 text-base font-medium shadow-xl shadow-amber-900/20 transition-all hover:translate-y-[-2px]"
                        >
                          <Link href={slide.cta_link || slide.link_url || "/"}>
                            {slide.cta_text}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls - Modernized */}
      <div className="absolute bottom-6 left-0 right-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            {/* Minimalist Dots */}
            <div className="flex gap-2">
                {slides.map((_, index) => (
                <button
                    key={index}
                    onClick={() => scrollTo(index)}
                    className={cn(
                    "h-1 rounded-full transition-all duration-500",
                    index === selectedIndex ? "w-8 bg-amber-500" : "w-2 bg-white/40 hover:bg-white/60"
                    )}
                    aria-label={`Go to slide ${index + 1}`}
                />
                ))}
            </div>

            {/* Glassmorphism Arrows */}
            <div className="hidden md:flex gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white backdrop-blur-sm transition-all hover:scale-105"
                    onClick={scrollPrev}
                >
                    <ChevronLeft className="h-5 w-5" />
                </Button>
                 <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white backdrop-blur-sm transition-all hover:scale-105"
                    onClick={scrollNext}
                >
                    <ChevronRight className="h-5 w-5" />
                </Button>
            </div>
        </div>
      </div>
    </div>
  );
}
