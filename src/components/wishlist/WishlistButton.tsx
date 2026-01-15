"use client";

import { useState, useEffect } from "react";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isInWishlist, toggleWishlist } from "@/lib/supabase/wishlist";
import { createClient } from "@/lib/supabase/client";

interface WishlistButtonProps {
  productId: string;
  variant?: "icon" | "button";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function WishlistButton({
  productId,
  variant = "icon",
  size = "md",
  className,
}: WishlistButtonProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
      
      if (user) {
        const wishlisted = await isInWishlist(productId);
        setIsWishlisted(wishlisted);
      }
    };
    checkStatus();
  }, [productId]);

  const handleToggle = async () => {
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    setIsLoading(true);
    try {
      const newState = await toggleWishlist(productId);
      setIsWishlisted(newState);
    } catch (error) {
      console.error("Wishlist error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className={cn(
          "flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-all",
          sizeClasses[size],
          className
        )}
        aria-label={isWishlisted ? "Hapus dari wishlist" : "Tambah ke wishlist"}
      >
        {isLoading ? (
          <Loader2 className={cn(iconSizes[size], "animate-spin text-gray-400")} />
        ) : (
          <Heart
            className={cn(
              iconSizes[size],
              isWishlisted
                ? "fill-red-500 text-red-500"
                : "text-gray-600 hover:text-red-500"
            )}
          />
        )}
      </button>
    );
  }

  return (
    <Button
      onClick={handleToggle}
      disabled={isLoading}
      variant={isWishlisted ? "default" : "outline"}
      className={cn(className)}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Heart
          className={cn(
            "mr-2 h-4 w-4",
            isWishlisted && "fill-current"
          )}
        />
      )}
      {isWishlisted ? "Di Wishlist" : "Tambah ke Wishlist"}
    </Button>
  );
}
