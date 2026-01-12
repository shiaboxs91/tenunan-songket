"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    image: "https://tenunansongket.com/wp-content/uploads/2020/08/Untitled-Facebook-Cover-6-1.webp",
    alt: "Tenunan Songket Collection",
  },
  {
    id: 2,
    image: "https://tenunansongket.com/wp-content/uploads/2023/09/were-open-1pm-till-late-14.png",
    alt: "Model Songket Elegant",
  },
  {
    id: 3,
    image: "https://tenunansongket.com/wp-content/uploads/2023/09/were-open-1pm-till-late-10.png",
    alt: "Songket Fashion",
  },
];

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(nextSlide, 4000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide]);

  return (
    <div className="relative w-full flex items-center gap-2 md:gap-4">
      {/* Navigation Arrow - Previous (Desktop) */}
      <button
        onClick={prevSlide}
        className="flex-shrink-0 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-amber-700 hover:bg-white hover:scale-110 transition-all hidden md:flex"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {/* Slider Container */}
      <div className="relative flex-1 aspect-[16/9] md:aspect-[4/3] lg:aspect-[4/3] rounded-2xl overflow-hidden shadow-xl shadow-amber-900/10 border border-amber-200/30">
        {/* Slides */}
        <div 
          className="flex h-full transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {SLIDES.map((slide) => (
            <div key={slide.id} className="relative w-full h-full flex-shrink-0">
              <Image
                src={slide.image}
                alt={slide.alt}
                fill
                className="object-cover"
                sizes="100vw"
                priority={slide.id === 1}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
            </div>
          ))}
        </div>

        {/* Dots Indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
          {SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? "w-6 bg-white" 
                  : "w-2 bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Swipe hint for mobile */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/70 text-xs md:hidden animate-pulse">
          ← Geser untuk melihat →
        </div>
      </div>

      {/* Navigation Arrow - Next (Desktop) */}
      <button
        onClick={nextSlide}
        className="flex-shrink-0 w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center text-amber-700 hover:bg-white hover:scale-110 transition-all hidden md:flex"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}
