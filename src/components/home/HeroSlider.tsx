"use client";

import { useState, useEffect, useCallback, memo } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { HeroSlide } from "@/lib/supabase/hero";

interface HeroSliderProps {
  slides: HeroSlide[];
}

// Memoized slide component for better performance
const Slide = memo(function Slide({ 
  image, 
  alt, 
  priority 
}: { 
  image: string; 
  alt: string; 
  priority: boolean;
}) {
  return (
    <div className="relative w-full h-full flex-shrink-0">
      <Image
        src={image}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 50vw"
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        quality={75}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgEDAwUBAAAAAAAAAAAAAQIDAAQRBRIhBhMiMUFR/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAZEQACAwEAAAAAAAAAAAAAAAABAgADESH/2gAMAwEAAhEDEEA/AKOm6hqF1YW8txdTSSvGrO7OSzEjJJJ5JNFFKZmY9k1FbKuf/9k="
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
    </div>
  );
});

export function HeroSlider({ slides }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying || slides.length === 0) return;
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, slides.length]);

  if (slides.length === 0) {
    return (
      <div className="relative flex-1 aspect-[16/9] md:aspect-[4/3] lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-xl shadow-amber-900/10 border border-amber-200/30 bg-amber-50 flex items-center justify-center">
        <p className="text-amber-700">Loading slides...</p>
      </div>
    );
  }

  return (
    <div className="relative w-full flex items-center gap-2 md:gap-4">
      {/* Navigation Arrow - Previous (Desktop) */}
      <button
        onClick={prevSlide}
        className="flex-shrink-0 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-amber-700 hover:bg-white hover:scale-110 transition-all hidden md:flex"
        aria-label="Slide sebelumnya"
        type="button"
      >
        <ChevronLeft className="w-5 h-5" aria-hidden="true" />
      </button>

      {/* Slider Container */}
      <div 
        className="relative flex-1 aspect-[16/9] md:aspect-[4/3] lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-xl shadow-amber-900/10 border border-amber-200/30"
        role="region"
        aria-label="Hero slider"
        aria-roledescription="carousel"
      >
        {/* Slides */}
        <div 
          className="flex h-full will-change-transform"
          style={{ 
            transform: `translateX(-${currentSlide * 100}%)`,
            transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {slides.map((slide, index) => (
            <Slide
              key={slide.id}
              image={slide.image_url}
              alt={slide.title}
              priority={index === 0}
            />
          ))}
        </div>

        {/* Dots Indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2" role="tablist">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? "w-6 bg-white" 
                  : "w-2 bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Slide ${index + 1}`}
              aria-selected={index === currentSlide}
              role="tab"
              type="button"
            />
          ))}
        </div>

        {/* Swipe hint for mobile */}
        <p className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/70 text-xs md:hidden animate-pulse">
          ← Geser untuk melihat →
        </p>
      </div>

      {/* Navigation Arrow - Next (Desktop) */}
      <button
        onClick={nextSlide}
        className="flex-shrink-0 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-amber-700 hover:bg-white hover:scale-110 transition-all hidden md:flex"
        aria-label="Slide berikutnya"
        type="button"
      >
        <ChevronRight className="w-5 h-5" aria-hidden="true" />
      </button>
    </div>
  );
}
