"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface Review {
  id: number;
  name: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
}

const sampleReviews: Review[] = [
  {
    id: 1,
    name: "Siti Aminah",
    rating: 5,
    date: "2 minggu lalu",
    comment: "Kain songket sangat indah dan berkualitas tinggi. Benang emasnya berkilau dan jahitannya rapi. Sangat puas!",
    verified: true,
  },
  {
    id: 2,
    name: "Ahmad Rizki",
    rating: 5,
    date: "1 bulan lalu",
    comment: "Pengiriman cepat dan packaging aman. Kain sesuai dengan foto, motifnya cantik sekali.",
    verified: true,
  },
  {
    id: 3,
    name: "Dewi Lestari",
    rating: 4,
    date: "1 bulan lalu",
    comment: "Kualitas bagus, warna sesuai ekspektasi. Recommended seller!",
    verified: true,
  },
];

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const starSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={cn(
            starSize,
            star <= rating ? "fill-amber-400 text-amber-400" : "fill-muted text-muted"
          )}
        />
      ))}
    </div>
  );
}

interface ProductReviewsProps {
  productRating: number;
  totalReviews?: number;
}

export function ProductReviews({ productRating, totalReviews = 128 }: ProductReviewsProps) {
  const ratingDistribution = [
    { stars: 5, percentage: 75 },
    { stars: 4, percentage: 18 },
    { stars: 3, percentage: 5 },
    { stars: 2, percentage: 1 },
    { stars: 1, percentage: 1 },
  ];

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="flex flex-col sm:flex-row gap-6 p-4 bg-muted/30 rounded-xl">
        {/* Overall Rating */}
        <div className="text-center sm:text-left sm:pr-6 sm:border-r">
          <div className="text-4xl font-bold text-primary">{productRating.toFixed(1)}</div>
          <StarRating rating={Math.round(productRating)} size="md" />
          <p className="text-xs text-muted-foreground mt-1">{totalReviews} ulasan</p>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1 space-y-1.5">
          {ratingDistribution.map(({ stars, percentage }) => (
            <div key={stars} className="flex items-center gap-2 text-xs">
              <span className="w-3 text-muted-foreground">{stars}</span>
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <span className="w-8 text-muted-foreground text-right">{percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {sampleReviews.map((review) => (
          <div key={review.id} className="p-4 border rounded-lg">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{review.name}</span>
                  {review.verified && (
                    <span className="text-[10px] text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                      Terverifikasi
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <StarRating rating={review.rating} />
                  <span className="text-xs text-muted-foreground">{review.date}</span>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
          </div>
        ))}
      </div>

      {/* Load More */}
      <button className="w-full py-2 text-sm text-primary hover:text-primary/80 font-medium">
        Lihat semua {totalReviews} ulasan →
      </button>
    </div>
  );
}
