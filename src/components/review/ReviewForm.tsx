"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "./StarRating";
import { createReview } from "@/lib/supabase/reviews";

interface ReviewFormProps {
  productId: string;
  orderId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ReviewForm({
  productId,
  orderId,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError("Silakan pilih rating");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const review = await createReview({
        productId,
        orderId,
        rating,
        reviewText: reviewText.trim() || undefined,
      });

      if (review) {
        setRating(0);
        setReviewText("");
        onSuccess?.();
      } else {
        setError("Gagal mengirim ulasan. Silakan coba lagi.");
      }
    } catch (err) {
      console.error("Review error:", err);
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Rating</label>
        <StarRating
          rating={rating}
          size="lg"
          interactive
          onChange={setRating}
        />
      </div>

      <div>
        <label htmlFor="review" className="block text-sm font-medium mb-2">
          Ulasan (opsional)
        </label>
        <Textarea
          id="review"
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          placeholder="Bagikan pengalaman Anda dengan produk ini..."
          rows={4}
          maxLength={1000}
        />
        <p className="mt-1 text-xs text-muted-foreground">
          {reviewText.length}/1000 karakter
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <div className="flex gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Batal
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || rating === 0}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mengirim...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Kirim Ulasan
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
