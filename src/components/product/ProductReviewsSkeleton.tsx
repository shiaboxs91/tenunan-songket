"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ProductReviewsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Rating Summary Skeleton */}
      <div className="flex flex-col sm:flex-row gap-6 p-4 bg-muted/30 rounded-xl">
        <div className="text-center sm:text-left sm:pr-6 sm:border-r">
          <Skeleton className="h-10 w-16 mx-auto sm:mx-0 mb-2" />
          <Skeleton className="h-4 w-24 mx-auto sm:mx-0 mb-1" />
          <Skeleton className="h-3 w-16 mx-auto sm:mx-0" />
        </div>
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 w-3" />
              <Skeleton className="h-3 w-3" />
              <Skeleton className="h-1.5 flex-1" />
              <Skeleton className="h-3 w-8" />
            </div>
          ))}
        </div>
      </div>

      {/* Review Items Skeleton */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border rounded-lg">
            <div className="flex items-center gap-3 mb-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
