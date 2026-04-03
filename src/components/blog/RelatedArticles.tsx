import { BlogCard } from './BlogCard'
import { cn } from '@/lib/utils'

interface RelatedPost {
  slug: string
  title: string
  excerpt: string | null
  featured_image_url: string | null
  published_at: string | null
  reading_time_minutes: number | null
  category?: {
    name: string
    slug: string
  } | null
}

interface RelatedArticlesProps {
  posts: RelatedPost[]
  title?: string
  className?: string
}

export function RelatedArticles({
  posts,
  title = 'Artikel Terkait',
  className
}: RelatedArticlesProps) {
  if (!posts.length) return null

  return (
    <section className={cn('py-8 md:py-12', className)} aria-labelledby="related-articles-heading">
      <h2
        id="related-articles-heading"
        className="mb-6 text-xl font-bold text-stone-900 dark:text-white md:text-2xl"
      >
        {title}
      </h2>

      {/* Mobile: horizontal scroll */}
      <div className="md:hidden">
        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide">
          {posts.map((post) => (
            <div key={post.slug} className="w-72 flex-shrink-0">
              <BlogCard post={post} variant="default" className="h-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: grid */}
      <div className="hidden gap-6 md:grid md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard
            key={post.slug}
            post={post}
            variant="horizontal"
            className="h-full"
          />
        ))}
      </div>
    </section>
  )
}
