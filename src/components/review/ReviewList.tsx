"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarRating } from "./StarRating";
import { getProductReviews, markReviewHelpful, type Review } from "@/lib/supabase/reviews";

interface ReviewListProps {
  productId: string;
  initialReviews?: Review[];
}

export function ReviewList({ productId, initialReviews }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews || []);
  const [isLoading, setIsLoading] = useState(!initialReviews);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [helpfulClicked, setHelpfulClicked] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!initialReviews) {
      loadReviews();
    }
  }, [productId, page]);

  const loadReviews = async () => {
    setIsLoading(true);
    const result = await getProductReviews(productId, page, 5);
    setReviews(result.data);
    setTotalPages(result.totalPages);
    setIsLoading(false);
  };

  const handleHelpful = async (reviewId: string) => {
    if (helpfulClicked.has(reviewId)) return;
    
    const success = await markReviewHelpful(reviewId);
    if (success) {
      setHelpfulClicked(prev => new Set(prev).add(reviewId));
      setReviews(prev =>
        prev.map(r =>
          r.id === reviewId
            ? { ...r, helpful_count: (r.helpful_count || 0) + 1 }
            : r
        )
      );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>Belum ada ulasan untuk produk ini.</p>
        <p className="text-sm mt-1">Jadilah yang pertama memberikan ulasan!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b pb-6 last:border-0">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              {review.profile?.avatar_url ? (
                <img
                  src={review.profile.avatar_url}
                  alt=""
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {review.profile?.full_name || "Pengguna"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={review.rating} size="sm" />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(review.created_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Review Text */}
              {review.review_text && (
                <p className="mt-3 text-sm text-muted-foreground">
                  {review.review_text}
                </p>
              )}

              {/* Review Images */}
              {review.images && Array.isArray(review.images) && review.images.length > 0 && (
                <div className="mt-3 flex gap-2">
                  {(review.images as string[]).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Review image ${index + 1}`}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}

              {/* Helpful Button */}
              <div className="mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleHelpful(review.id)}
                  disabled={helpfulClicked.has(review.id)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ThumbsUp className={`mr-1 h-4 w-4 ${helpfulClicked.has(review.id) ? 'fill-current' : ''}`} />
                  Membantu ({review.helpful_count || 0})
                </Button>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Sebelumnya
          </Button>
          <span className="flex items-center px-3 text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Selanjutnya
          </Button>
        </div>
      )}
    </div>
  );
}
