import { Skeleton } from "@/components/ui/skeleton";

export default function ProductsLoading() {
  return (
    <>
      {/* Horizontal Categories skeleton - Mobile Only */}
      <div className="lg:hidden overflow-hidden border-b bg-white">
        <div className="flex gap-2 px-4 py-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full flex-shrink-0" />
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <Skeleton className="h-8 w-48" />
        </div>

        <div className="flex gap-6 lg:gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[280px] flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Filter header */}
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-20" />
              </div>

              {/* Category filters */}
              <div className="space-y-3">
                <Skeleton className="h-5 w-24" />
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded" />
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-6" />
                  </div>
                ))}
              </div>

              {/* Color filters */}
              <div className="space-y-3">
                <Skeleton className="h-5 w-16" />
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-8 rounded-full" />
                  ))}
                </div>
              </div>

              {/* Price filter */}
              <div className="space-y-3">
                <Skeleton className="h-5 w-20" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 flex-1" />
                </div>
              </div>

              {/* Stock filter */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Mobile Filter Button & Sorting Bar */}
            <div className="flex flex-col gap-4 mb-6">
              {/* Mobile filter button */}
              <div className="lg:hidden">
                <Skeleton className="h-9 w-24" />
              </div>

              {/* Sorting & Grid controls */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-32" />
                </div>
                <div className="flex gap-1">
                  <Skeleton className="h-9 w-9" />
                  <Skeleton className="h-9 w-9" />
                </div>
              </div>
            </div>

            {/* Product Grid skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-card overflow-hidden">
                  {/* Product image */}
                  <Skeleton className="aspect-square w-full" />
                  <div className="p-3 space-y-2">
                    {/* Category badge */}
                    <Skeleton className="h-3 w-16" />
                    {/* Product title */}
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    {/* Rating & sold */}
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-3" />
                      <Skeleton className="h-3 w-8" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    {/* Price */}
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination skeleton */}
            <div className="flex items-center justify-center gap-2 mt-8">
              <Skeleton className="h-10 w-10 rounded" />
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-10 rounded" />
              ))}
              <Skeleton className="h-10 w-10 rounded" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
