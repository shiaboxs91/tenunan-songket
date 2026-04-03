import { Skeleton } from '@/components/ui/skeleton'

export default function BlogPostLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Link Skeleton */}
      <Skeleton className="mb-6 h-4 w-32" />

      <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
        {/* Main Article Content */}
        <article>
          {/* Article Header */}
          <header className="mb-8">
            <Skeleton className="mb-4 h-6 w-24 rounded-full" />
            <Skeleton className="mb-4 h-12 w-full" />
            <Skeleton className="h-12 w-3/4" />

            {/* Meta Info */}
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-20" />
            </div>
          </header>

          {/* Featured Image */}
          <Skeleton className="mb-8 aspect-[16/9] w-full rounded-xl" />

          {/* Content */}
          <div className="space-y-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-4 w-full"
                style={{ width: `${Math.random() * 20 + 80}%` }}
              />
            ))}
          </div>

          {/* Tags */}
          <div className="mt-10 border-t border-stone-200 pt-6 dark:border-stone-800">
            <Skeleton className="mb-3 h-4 w-16" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-20 rounded-full" />
              ))}
            </div>
          </div>

          {/* Author Box */}
          <div className="mt-10 rounded-xl border border-stone-200 bg-stone-50 p-6 dark:border-stone-800 dark:bg-stone-900">
            <div className="flex items-start gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-6">
            {/* Social Share */}
            <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
              <Skeleton className="mb-4 h-5 w-28" />
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full rounded-md" />
                ))}
              </div>
            </div>

            {/* Table of Contents */}
            <div className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
              <Skeleton className="mb-4 h-5 w-24" />
              <div className="space-y-2 border-l-2 border-stone-200 pl-4 dark:border-stone-700">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
