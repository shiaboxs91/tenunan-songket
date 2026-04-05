"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarRating } from "./StarRating";
import { getProductReviews, toggleReviewHelpful, type Review } from "@/lib/supabase/reviews";
import { createClient } from "@/lib/supabase/client";

interface ReviewListProps {
  productId: string;
  initialReviews?: Review[];
}

export function ReviewList({ productId, initialReviews }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews || []);
  const [isLoading, setIsLoading] = useState(!initialReviews);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [votedReviews, setVotedReviews] = useState<Set<string>>(new Set());
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (!initialReviews) {
      loadReviews();
    }
  }, [productId, page]);

  const checkAuth = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    setIsAuthenticated(!!user);
  };

  const loadReviews = async () => {
    setIsLoading(true);
    const result = await getProductReviews(productId, page, 5);
    setReviews(result.data);
    setTotalPages(result.totalPages);
    setIsLoading(false);
  };

  const handleHelpful = async (reviewId: string) => {
    if (!isAuthenticated) return;

    const result = await toggleReviewHelpful(reviewId);
    if (result) {
      if (result.voted) {
        setVotedReviews(prev => new Set(prev).add(reviewId));
      } else {
        setVotedReviews(prev => {
          const next = new Set(prev);
          next.delete(reviewId);
          return next;
        });
      }
      setReviews(prev =>
        prev.map(r =>
          r.id === reviewId
            ? { ...r, helpful_count: result.count }
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
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted flex-shrink-0">
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

            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {review.profile?.full_name || "Pengguna"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <StarRating rating={review.rating} size="sm" />
                    <span className="text-xs text-muted-foreground">
                      {review.created_at ? formatDate(review.created_at) : ''}
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
                <div className="mt-3 flex flex-wrap gap-2">
                  {(review.images as string[]).map((image, index) => (
                    <a
                      key={index}
                      href={image}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <img
                        src={image}
                        alt={`Foto ulasan ${index + 1}`}
                        className="h-20 w-20 rounded-lg object-cover border hover:opacity-80 transition-opacity"
                      />
                    </a>
                  ))}
                </div>
              )}

              {/* Helpful Button */}
              <div className="mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleHelpful(review.id)}
                  disabled={!isAuthenticated}
                  className="text-muted-foreground hover:text-foreground"
                  title={!isAuthenticated ? "Masuk untuk menandai ulasan ini membantu" : undefined}
                >
                  <ThumbsUp className={`mr-1 h-4 w-4 ${votedReviews.has(review.id) ? 'fill-current text-primary' : ''}`} />
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
