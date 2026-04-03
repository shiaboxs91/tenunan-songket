import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface BlogCardProps {
  post: {
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
  variant?: 'default' | 'featured' | 'horizontal'
  className?: string
}

export function BlogCard({ post, variant = 'default', className }: BlogCardProps) {
  const formattedDate = post.published_at
    ? new Intl.DateTimeFormat('ms-MY', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }).format(new Date(post.published_at))
    : null

  if (variant === 'featured') {
    return (
      <article
        className={cn(
          'group relative overflow-hidden rounded-2xl bg-stone-900',
          'aspect-[16/10] md:aspect-[21/9]',
          className
        )}
      >
        {post.featured_image_url && (
          <Image
            src={post.featured_image_url}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 1200px"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/50 to-transparent" />
        
        <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-10">
          {post.category && (
            <Link
              href={`/blog/category/${post.category.slug}`}
              className="mb-3 self-start rounded-full bg-amber-600/90 px-4 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-amber-600"
            >
              {post.category.name}
            </Link>
          )}
          
          <h2 className="mb-3 text-2xl font-bold leading-tight text-white md:text-4xl md:leading-tight">
            <Link
              href={`/blog/${post.slug}`}
              className="transition-colors hover:text-amber-300"
            >
              {post.title}
            </Link>
          </h2>
          
          {post.excerpt && (
            <p className="mb-4 line-clamp-2 max-w-2xl text-sm text-stone-300 md:text-base">
              {post.excerpt}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-stone-400">
            {formattedDate && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formattedDate}
              </span>
            )}
            {post.reading_time_minutes && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {post.reading_time_minutes} min
              </span>
            )}
          </div>
        </div>
      </article>
    )
  }

  if (variant === 'horizontal') {
    return (
      <article
        className={cn(
          'group flex gap-4 rounded-xl border border-stone-200 bg-white p-4 transition-shadow hover:shadow-lg dark:border-stone-800 dark:bg-stone-900',
          className
        )}
      >
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg md:h-32 md:w-32">
          {post.featured_image_url ? (
            <Image
              src={post.featured_image_url}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="128px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-stone-100 dark:bg-stone-800">
              <span className="text-3xl">📝</span>
            </div>
          )}
        </div>
        
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          {post.category && (
            <Link
              href={`/blog/category/${post.category.slug}`}
              className="mb-1 text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-amber-500"
            >
              {post.category.name}
            </Link>
          )}
          
          <h3 className="mb-1 line-clamp-2 font-semibold leading-snug text-stone-900 dark:text-white">
            <Link
              href={`/blog/${post.slug}`}
              className="transition-colors hover:text-amber-600 dark:hover:text-amber-400"
            >
              {post.title}
            </Link>
          </h3>
          
          <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
            {formattedDate && <span>{formattedDate}</span>}
            {post.reading_time_minutes && (
              <span>{post.reading_time_minutes} min</span>
            )}
          </div>
        </div>
      </article>
    )
  }

  // Default card
  return (
    <article
      className={cn(
        'group overflow-hidden rounded-xl border border-stone-200 bg-white transition-all duration-300 hover:shadow-xl dark:border-stone-800 dark:bg-stone-900',
        className
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        {post.featured_image_url ? (
          <Image
            src={post.featured_image_url}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30">
            <span className="text-5xl">📝</span>
          </div>
        )}
        
        {post.category && (
          <Link
            href={`/blog/category/${post.category.slug}`}
            className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-stone-800 backdrop-blur-sm transition-colors hover:bg-white dark:bg-stone-900/90 dark:text-stone-100"
          >
            {post.category.name}
          </Link>
        )}
      </div>
      
      <div className="p-5">
        <div className="mb-3 flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
          {formattedDate && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {formattedDate}
            </span>
          )}
          {post.reading_time_minutes && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.reading_time_minutes} min
            </span>
          )}
        </div>
        
        <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-snug text-stone-900 dark:text-white">
          <Link
            href={`/blog/${post.slug}`}
            className="transition-colors hover:text-amber-600 dark:hover:text-amber-400"
          >
            {post.title}
          </Link>
        </h3>
        
        {post.excerpt && (
          <p className="mb-4 line-clamp-2 text-sm text-stone-600 dark:text-stone-300">
            {post.excerpt}
          </p>
        )}
        
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 transition-colors hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400"
        >
          Baca selengkapnya
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </article>
  )
}
