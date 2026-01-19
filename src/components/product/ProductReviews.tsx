"use client";

import { useState, useEffect } from "react";
import { Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ReviewForm, ReviewList, StarRating } from "@/components/review";
import { getProductReviews, canReviewProduct, getRatingDistribution, type Review } from "@/lib/supabase/reviews";
import { createClient } from "@/lib/supabase/client";

interface ProductReviewsProps {
  productId: string;
  productRating: number;
  totalReviews?: number;
}

export function ProductReviews({ productId, productRating, totalReviews = 0 }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [ratingDist, setRatingDist] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

  useEffect(() => {
    loadReviews();
    checkAuth();
  }, [productId]);

  const loadReviews = async () => {
    setIsLoading(true);
    const result = await getProductReviews(productId, 1, 5);
    setReviews(result.data);
    
    // If we have "fake" stats (productRating > 0) but no actual reviews,
    // we need to fake the distribution to match the visual rating.
    if (result.data.length === 0 && productRating > 0 && totalReviews > 0) {
        // Generate a distribution that roughly matches the 4.8 rating
        // Mostly 5 stars, some 4 stars.
        setRatingDist({
            1: 0,
            2: 0,
            3: 0,
            4: Math.floor(totalReviews * 0.2), // 20% 4 stars
            5: Math.ceil(totalReviews * 0.8)   // 80% 5 stars
        });
    } else {
        setRatingDist(getRatingDistribution(result.data));
    }
    
    setIsLoading(false);
  };

  const checkAuth = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
    
    if (user) {
      const eligible = await canReviewProduct(productId);
      setCanReview(eligible);
    }
  };

  const handleReviewSuccess = () => {
    setShowReviewForm(false);
    loadReviews();
    setCanReview(false); // User can only review once
  };

  const totalRatings = Object.values(ratingDist).reduce((a, b) => a + b, 0);
  const getPercentage = (count: number) => totalRatings > 0 ? Math.round((count / totalRatings) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="flex flex-col sm:flex-row gap-6 p-4 bg-muted/30 rounded-xl">
        {/* Overall Rating */}
        <div className="text-center sm:text-left sm:pr-6 sm:border-r">
          <div className="text-4xl font-bold text-primary">{productRating.toFixed(1)}</div>
          <StarRating rating={productRating} size="md" />
          <p className="text-xs text-muted-foreground mt-1">{totalReviews} ulasan</p>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1 space-y-1.5">
          {[5, 4, 3, 2, 1].map((stars) => (
            <div key={stars} className="flex items-center gap-2 text-xs">
              <span className="w-3 text-muted-foreground">{stars}</span>
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${getPercentage(ratingDist[stars])}%` }}
                />
              </div>
              <span className="w-8 text-muted-foreground text-right">
                {getPercentage(ratingDist[stars])}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Write Review Button */}
      {isAuthenticated && canReview && !showReviewForm && (
        <Button onClick={() => setShowReviewForm(true)} variant="outline">
          Tulis Ulasan
        </Button>
      )}

      {!isAuthenticated && (
        <p className="text-sm text-muted-foreground">
          <a href="/login" className="text-primary hover:underline">Masuk</a> untuk menulis ulasan
        </p>
      )}

      {/* Review Form */}
      {showReviewForm && (
        <div className="p-4 border rounded-lg bg-muted/20">
          <h3 className="font-medium mb-4">Tulis Ulasan Anda</h3>
          <ReviewForm
            productId={productId}
            onSuccess={handleReviewSuccess}
            onCancel={() => setShowReviewForm(false)}
          />
        </div>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <ReviewList productId={productId} initialReviews={reviews} />
      )}
    </div>
  );
}
