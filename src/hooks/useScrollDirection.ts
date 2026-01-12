"use client";

import { useState, useEffect, useCallback } from "react";

export type ScrollDirection = "up" | "down" | null;

interface UseScrollDirectionOptions {
  threshold?: number; // Minimum scroll distance to trigger direction change
  initialDirection?: ScrollDirection;
}

interface UseScrollDirectionReturn {
  scrollDirection: ScrollDirection;
  isScrolled: boolean; // True when scrolled past threshold from top
  scrollY: number;
}

/**
 * Hook to detect scroll direction (up/down) with configurable threshold.
 * Used for implementing compact header on scroll behavior.
 * 
 * Requirements: 9.1, 9.3
 */
export function useScrollDirection(
  options: UseScrollDirectionOptions = {}
): UseScrollDirectionReturn {
  const { threshold = 10, initialDirection = null } = options;

  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(initialDirection);
  const [scrollY, setScrollY] = useState(0);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const updateScrollDirection = useCallback(() => {
    const currentScrollY = window.scrollY;

    // Update isScrolled state (true when past threshold from top)
    setIsScrolled(currentScrollY > threshold);

    // Determine scroll direction
    if (Math.abs(currentScrollY - lastScrollY) < threshold) {
      // Not enough movement to determine direction
      setScrollY(currentScrollY);
      return;
    }

    const newDirection: ScrollDirection = currentScrollY > lastScrollY ? "down" : "up";
    
    if (newDirection !== scrollDirection) {
      setScrollDirection(newDirection);
    }

    setLastScrollY(currentScrollY);
    setScrollY(currentScrollY);
  }, [lastScrollY, scrollDirection, threshold]);

  useEffect(() => {
    // Set initial scroll position
    setLastScrollY(window.scrollY);
    setScrollY(window.scrollY);
    setIsScrolled(window.scrollY > threshold);

    const handleScroll = () => {
      window.requestAnimationFrame(updateScrollDirection);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [updateScrollDirection, threshold]);

  return {
    scrollDirection,
    isScrolled,
    scrollY,
  };
}
