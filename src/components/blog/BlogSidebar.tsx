import Link from 'next/link'
import { Mail, Tag, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BlogCard } from './BlogCard'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Category {
  name: string
  slug: string
  post_count?: number
}

interface TagItem {
  name: string
  slug: string
  post_count?: number
}

interface RecentPost {
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

interface BlogSidebarProps {
  categories?: Category[]
  tags?: TagItem[]
  recentPosts?: RecentPost[]
  showNewsletter?: boolean
  className?: string
}

export function BlogSidebar({
  categories = [],
  tags = [],
  recentPosts = [],
  showNewsletter = true,
  className
}: BlogSidebarProps) {
  return (
    <aside className={cn('space-y-8', className)} aria-label="Blog sidebar">
      {/* Categories */}
      {categories.length > 0 && (
        <section
          className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900"
          aria-labelledby="sidebar-categories"
        >
          <h3
            id="sidebar-categories"
            className="mb-4 flex items-center gap-2 text-sm font-semibold text-stone-900 dark:text-white"
          >
            <FolderOpen className="h-4 w-4" />
            Kategori
          </h3>

          <ul className="space-y-1">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  href={`/blog/category/${category.slug}`}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                    'text-stone-600 hover:bg-stone-50 hover:text-stone-900',
                    'dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-white',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500'
                  )}
                >
                  <span>{category.name}</span>
                  {typeof category.post_count === 'number' && (
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs text-stone-500 dark:bg-stone-800 dark:text-stone-400">
                      {category.post_count}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Popular Tags */}
      {tags.length > 0 && (
        <section
          className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900"
          aria-labelledby="sidebar-tags"
        >
          <h3
            id="sidebar-tags"
            className="mb-4 flex items-center gap-2 text-sm font-semibold text-stone-900 dark:text-white"
          >
            <Tag className="h-4 w-4" />
            Tag Populer
          </h3>

          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag.slug}
                href={`/blog/tag/${tag.slug}`}
                className={cn(
                  'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  'border border-stone-200 bg-stone-50 text-stone-600',
                  'hover:border-amber-300 hover:bg-amber-50 hover:text-amber-700',
                  'dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400',
                  'dark:hover:border-amber-700 dark:hover:bg-amber-900/20 dark:hover:text-amber-400',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500'
                )}
              >
                #{tag.name}
                {typeof tag.post_count === 'number' && tag.post_count > 0 && (
                  <span className="ml-1 text-stone-400 dark:text-stone-500">
                    ({tag.post_count})
                  </span>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent Posts */}
      {recentPosts.length > 0 && (
        <section
          className="rounded-xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900"
          aria-labelledby="sidebar-recent"
        >
          <h3
            id="sidebar-recent"
            className="mb-4 text-sm font-semibold text-stone-900 dark:text-white"
          >
            Artikel Terbaru
          </h3>

          <div className="space-y-3">
            {recentPosts.map((post) => (
              <BlogCard
                key={post.slug}
                post={post}
                variant="horizontal"
                className="border-0 bg-transparent p-0 shadow-none hover:shadow-none dark:bg-transparent"
              />
            ))}
          </div>
        </section>
      )}

      {/* Newsletter Signup */}
      {showNewsletter && (
        <section
          className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100/50 p-5 dark:border-amber-900/50 dark:from-amber-900/20 dark:to-amber-800/10"
          aria-labelledby="sidebar-newsletter"
        >
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10 dark:bg-amber-500/20">
            <Mail className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>

          <h3
            id="sidebar-newsletter"
            className="mb-2 text-sm font-semibold text-stone-900 dark:text-white"
          >
            Berlangganan Newsletter
          </h3>

          <p className="mb-4 text-xs text-stone-600 dark:text-stone-400">
            Dapatkan artikel terbaru tentang songket dan kerajinan tradisional langsung ke email Anda.
          </p>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="space-y-2"
            aria-label="Newsletter subscription form"
          >
            <Input
              type="email"
              placeholder="Alamat email…"
              className="h-9 text-sm"
              aria-label="Email address"
              required
            />
            <Button
              type="submit"
              size="sm"
              className="w-full bg-amber-600 text-white hover:bg-amber-700 dark:bg-amber-600 dark:hover:bg-amber-700"
            >
              Berlangganan
            </Button>
          </form>

          <p className="mt-3 text-center text-[10px] text-stone-500 dark:text-stone-500">
            Kami menghormati privasi Anda. Berhenti berlangganan kapan saja.
          </p>
        </section>
      )}
    </aside>
  )
}
