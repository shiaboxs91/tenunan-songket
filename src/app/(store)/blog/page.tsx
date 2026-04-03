import { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { Tag, TrendingUp, BookOpen } from 'lucide-react'
import { 
  getBlogPosts, 
  getBlogCategories, 
  getFeaturedPosts, 
  getPopularTags 
} from '@/lib/supabase/blog'
import { BlogListingJsonLd, BreadcrumbJsonLd } from '@/components/seo'
import { BlogCard } from '@/components/blog/BlogCard'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { BlogPagination } from '@/components/blog/BlogPagination'
import { BlogCategoryTabs } from '@/components/blog/BlogCategoryTabs'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tenunansongket.com'

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Blog Songket - Tips, Inspirasi & Cerita Tenunan Tradisional'
  const description = 'Baca artikel menarik tentang kain songket, tips penjagaan, inspirasi fesyen, dan cerita di sebalik seni tenunan tradisional Melayu. Panduan lengkap untuk pecinta songket.'
  const url = `${SITE_URL}/blog`

  return {
    title,
    description,
    keywords: [
      'blog songket',
      'artikel songket',
      'tips penjagaan songket',
      'inspirasi fesyen songket',
      'tenunan tradisional',
      'kain songket melayu',
      'sejarah songket',
      'motif songket',
    ].join(', '),
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'Tenunan Songket',
      locale: 'ms_MY',
      images: [
        {
          url: `${SITE_URL}/images/blog-og.jpg`,
          width: 1200,
          height: 630,
          alt: 'Blog Tenunan Songket',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${SITE_URL}/images/blog-og.jpg`],
    },
    alternates: {
      canonical: url,
    },
  }
}

interface BlogPageProps {
  searchParams: Promise<{ 
    page?: string
    category?: string 
  }>
}

function FeaturedPostSkeleton() {
  return (
    <div className="relative aspect-[16/10] md:aspect-[21/9] animate-pulse rounded-2xl bg-stone-200 dark:bg-stone-800" />
  )
}

function BlogGridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-[16/10] rounded-xl" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      ))}
    </div>
  )
}

function SidebarSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-32" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full" />
        ))}
      </div>
    </div>
  )
}

async function FeaturedPostSection() {
  const featuredPosts = await getFeaturedPosts(1)
  
  if (!featuredPosts || featuredPosts.length === 0) {
    return null
  }

  const post = featuredPosts[0]

  return (
    <section aria-labelledby="featured-heading" className="mb-12">
      <h2 id="featured-heading" className="sr-only">Artikel Pilihan</h2>
      <BlogCard
        post={{
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          featured_image_url: post.featured_image_url,
          published_at: post.published_at,
          reading_time_minutes: post.reading_time_minutes,
          category: post.category as { name: string; slug: string } | null,
        }}
        variant="featured"
      />
    </section>
  )
}

async function BlogGrid({ page, categorySlug }: { page: number; categorySlug?: string }) {
  const { posts, totalPages, total } = await getBlogPosts({
    page,
    limit: 9,
    category_slug: categorySlug,
  })

  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 p-12 text-center dark:border-stone-700 dark:bg-stone-900">
        <BookOpen className="mx-auto h-12 w-12 text-stone-400" />
        <h3 className="mt-4 text-lg font-semibold text-stone-900 dark:text-white">
          Tiada artikel dijumpai
        </h3>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
          {categorySlug 
            ? 'Tiada artikel dalam kategori ini buat masa ini.' 
            : 'Artikel akan datang tidak lama lagi.'}
        </p>
        {categorySlug && (
          <Link
            href="/blog"
            className="mt-4 inline-flex items-center text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            Lihat semua artikel
          </Link>
        )}
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <BlogCard
            key={post.id}
            post={{
              slug: post.slug,
              title: post.title,
              excerpt: post.excerpt,
              featured_image_url: post.featured_image_url,
              published_at: post.published_at,
              reading_time_minutes: post.reading_time_minutes,
              category: post.category,
            }}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <BlogPagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          basePath={categorySlug ? `/blog?category=${categorySlug}` : '/blog'}
        />
      )}
    </>
  )
}

async function PopularTagsSidebar() {
  const tags = await getPopularTags(12)

  if (tags.length === 0) return null

  return (
    <aside className="lg:sticky lg:top-24" aria-labelledby="popular-tags-heading">
      <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
        <h3 
          id="popular-tags-heading" 
          className="mb-4 flex items-center gap-2 text-lg font-bold text-stone-900 dark:text-white"
        >
          <TrendingUp className="h-5 w-5 text-amber-600" />
          Tag Popular
        </h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/blog?tag=${tag.slug}`}
              className="group"
            >
              <Badge
                variant="outline"
                className="cursor-pointer transition-colors hover:bg-amber-50 hover:border-amber-300 dark:hover:bg-amber-950/30"
              >
                <Tag className="mr-1 h-3 w-3" />
                {tag.name}
                <span className="ml-1 text-stone-400">({tag.count})</span>
              </Badge>
            </Link>
          ))}
        </div>
      </div>
    </aside>
  )
}

async function RecentPostsSidebar() {
  const { posts } = await getBlogPosts({ limit: 5 })

  if (posts.length === 0) return null

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6 dark:border-stone-800 dark:bg-stone-900">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-stone-900 dark:text-white">
        <BookOpen className="h-5 w-5 text-amber-600" />
        Artikel Terbaru
      </h3>
      <div className="space-y-4">
        {posts.slice(0, 5).map((post) => (
          <BlogCard
            key={post.id}
            post={{
              slug: post.slug,
              title: post.title,
              excerpt: post.excerpt,
              featured_image_url: post.featured_image_url,
              published_at: post.published_at,
              reading_time_minutes: post.reading_time_minutes,
              category: post.category,
            }}
            variant="horizontal"
            className="border-0 p-0 shadow-none hover:shadow-none"
          />
        ))}
      </div>
    </div>
  )
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const { page: pageParam, category } = await searchParams
  const page = pageParam ? parseInt(pageParam, 10) : 1
  
  const [categories, { posts }] = await Promise.all([
    getBlogCategories(),
    getBlogPosts({ page, limit: 9, category_slug: category }),
  ])

  const blogUrl = `${SITE_URL}/blog`

  return (
    <>
      {/* SEO: Blog Listing JSON-LD */}
      <BlogListingJsonLd
        posts={posts.map((post) => ({
          title: post.title,
          url: `${SITE_URL}/blog/${post.slug}`,
          image: post.featured_image_url || `${SITE_URL}/images/default-blog.jpg`,
          publishedAt: post.published_at || post.created_at,
        }))}
        name="Blog Tenunan Songket"
        description="Artikel menarik tentang kain songket, tips penjagaan, inspirasi fesyen, dan cerita tenunan tradisional."
        url={blogUrl}
      />

      {/* SEO: Breadcrumb JSON-LD */}
      <BreadcrumbJsonLd
        items={[
          { name: 'Beranda', url: SITE_URL },
          { name: 'Blog', url: blogUrl },
          ...(category ? [{ 
            name: categories.find(c => c.slug === category)?.name || category, 
            url: `${blogUrl}?category=${category}` 
          }] : []),
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-white sm:text-4xl">
            Blog & Artikel
          </h1>
          <p className="mt-3 text-lg text-stone-600 dark:text-stone-400">
            Temui inspirasi, tips penjagaan, dan cerita menarik tentang seni tenunan songket tradisional
          </p>
        </header>

        {/* Featured Post */}
        {!category && page === 1 && (
          <Suspense fallback={<FeaturedPostSkeleton />}>
            <FeaturedPostSection />
          </Suspense>
        )}

        {/* Category Tabs */}
        <BlogCategoryTabs 
          categories={categories} 
          activeCategory={category} 
        />

        {/* Main Content Grid */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Blog Posts Grid */}
          <main>
            <Suspense fallback={<BlogGridSkeleton />}>
              <BlogGrid page={page} categorySlug={category} />
            </Suspense>
          </main>

          {/* Sidebar */}
          <aside className="space-y-6">
            <Suspense fallback={<SidebarSkeleton />}>
              <PopularTagsSidebar />
            </Suspense>
            
            <Suspense fallback={<SidebarSkeleton />}>
              <RecentPostsSidebar />
            </Suspense>
          </aside>
        </div>
      </div>
    </>
  )
}
