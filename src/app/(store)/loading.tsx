import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div className="flex flex-col">
      {/* Hero Skeleton */}
      <section className="relative w-full h-[400px] sm:h-[450px] md:h-[550px] lg:h-[600px] bg-slate-200 animate-pulse">
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl space-y-4">
              <Skeleton className="h-6 w-32 bg-slate-300" />
              <Skeleton className="h-12 w-full bg-slate-300" />
              <Skeleton className="h-12 w-3/4 bg-slate-300" />
              <Skeleton className="h-6 w-2/3 bg-slate-300" />
              <Skeleton className="h-12 w-40 rounded-full bg-slate-300" />
            </div>
          </div>
        </div>
      </section>

      {/* Categories Skeleton */}
      <section className="py-10 md:py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6 lg:gap-10">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <Skeleton className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-full mb-2" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-12 mt-1" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Skeleton */}
      <section className="py-10 md:py-16 bg-slate-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Products Skeleton */}
      <section className="py-10 md:py-16 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
