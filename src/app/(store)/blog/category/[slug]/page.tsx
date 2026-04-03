import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Suspense } from 'react'
import { ArrowLeft, FolderOpen } from 'lucide-react'
import {
  getBlogCategoryBySlug,
  getBlogPosts,
  getBlogCategories,
  getAllCategorySlugs,
} from '@/lib/supabase/blog'
import { BlogListingJsonLd, BreadcrumbJsonLd } from '@/components/seo'
import { BlogCard } from '@/components/blog/BlogCard'
import { BlogPagination } from '@/components/blog/BlogPagination'
import { Skeleton } from '@/components/ui/skeleton'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tenunansongket.com'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateStaticParams() {
  try {
    const categories = await getAllCategorySlugs()
    return categories.map((cat) => ({
      slug: cat.slug,
    }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params

  try {
    const category = await getBlogCategoryBySlug(slug)

    if (!category) {
      return {
        title: 'Kategori Tidak Ditemukan - Blog Tenunan Songket',
        description: 'Kategori yang anda cari tidak ditemukan.',
      }
    }

    const title = category.meta_title || `${category.name} - Blog Tenunan Songket`
    const description =
      category.meta_description ||
      category.description ||
      `Baca artikel menarik tentang ${category.name}. Tips, panduan, dan inspirasi seputar kain songket dan tenunan tradisional.`
    const url = `${SITE_URL}/blog/category/${category.slug}`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url,
        type: 'website',
        siteName: 'Tenunan Songket',
        locale: 'ms_MY',
        images: category.image_url
          ? [
              {
                url: category.image_url,
                width: 1200,
                height: 630,
                alt: category.name,
              },
            ]
          : [
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
        images: [category.image_url || `${SITE_URL}/images/blog-og.jpg`],
      },
      alternates: {
        canonical: url,
      },
    }
  } catch {
    return {
      title: 'Kategori Tidak Ditemukan - Blog Tenunan Songket',
      description: 'Kategori yang anda cari tidak ditemukan.',
    }
  }
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

async function CategoryBlogGrid({
  categorySlug,
  page,
}: {
  categorySlug: string
  page: number
}) {
  const { posts, totalPages, total } = await getBlogPosts({
    page,
    limit: 12,
    category_slug: categorySlug,
  })

  if (posts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 p-12 text-center dark:border-stone-700 dark:bg-stone-900">
        <FolderOpen className="mx-auto h-12 w-12 text-stone-400" />
        <h3 className="mt-4 text-lg font-semibold text-stone-900 dark:text-white">
          Tiada artikel dalam kategori ini
        </h3>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
          Artikel akan datang tidak lama lagi. Sila kembali semula.
        </p>
        <Link
          href="/blog"
          className="mt-4 inline-flex items-center text-sm font-medium text-amber-600 hover:text-amber-700"
        >
          Lihat semua artikel
        </Link>
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
          basePath={`/blog/category/${categorySlug}`}
        />
      )}
    </>
  )
}

async function OtherCategories({ currentSlug }: { currentSlug: string }) {
  const categories = await getBlogCategories()
  const otherCategories = categories.filter((c) => c.slug !== currentSlug)

  if (otherCategories.length === 0) return null

  return (
    <section className="mt-16 border-t border-stone-200 pt-12 dark:border-stone-800">
      <h2 className="mb-6 text-xl font-bold text-stone-900 dark:text-white">
        Kategori Lain
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {otherCategories.map((category) => (
          <Link
            key={category.id}
            href={`/blog/category/${category.slug}`}
            className="group flex items-center gap-3 rounded-lg border border-stone-200 bg-white p-4 transition-all hover:border-amber-300 hover:shadow-md dark:border-stone-800 dark:bg-stone-900"
          >
            {category.image_url ? (
              <Image
                src={category.image_url}
                alt={category.name}
                width={48}
                height={48}
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                <FolderOpen className="h-6 w-6" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-medium text-stone-900 transition-colors group-hover:text-amber-600 dark:text-white">
                {category.name}
              </h3>
              {category.description && (
                <p className="truncate text-xs text-stone-500 dark:text-stone-400">
                  {category.description}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { slug } = await params
  const { page: pageParam } = await searchParams
  const page = pageParam ? parseInt(pageParam, 10) : 1

  let category
  try {
    category = await getBlogCategoryBySlug(slug)
  } catch {
    notFound()
  }

  if (!category) {
    notFound()
  }

  const categoryUrl = `${SITE_URL}/blog/category/${category.slug}`
  const { posts } = await getBlogPosts({ category_slug: slug, limit: 12 })

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
        name={`${category.name} - Blog Tenunan Songket`}
        description={category.description || `Artikel dalam kategori ${category.name}`}
        url={categoryUrl}
      />

      {/* SEO: Breadcrumb JSON-LD */}
      <BreadcrumbJsonLd
        items={[
          { name: 'Beranda', url: SITE_URL },
          { name: 'Blog', url: `${SITE_URL}/blog` },
          { name: category.name, url: categoryUrl },
        ]}
      />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/blog"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-stone-600 transition-colors hover:text-amber-600 dark:text-stone-400 dark:hover:text-amber-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Blog
        </Link>

        {/* Category Header */}
        <header className="mb-10">
          <div className="flex items-start gap-6">
            {category.image_url ? (
              <Image
                src={category.image_url}
                alt={category.name}
                width={120}
                height={120}
                className="hidden h-24 w-24 rounded-xl object-cover shadow-md sm:block md:h-28 md:w-28"
              />
            ) : (
              <div className="hidden h-24 w-24 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700 shadow-md sm:flex md:h-28 md:w-28 dark:from-amber-900/30 dark:to-amber-800/30 dark:text-amber-400">
                <FolderOpen className="h-10 w-10" />
              </div>
            )}

            <div>
              <p className="mb-1 text-sm font-medium text-amber-600 dark:text-amber-400">
                Kategori
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-white sm:text-4xl">
                {category.name}
              </h1>
              {category.description && (
                <p className="mt-2 max-w-2xl text-lg text-stone-600 dark:text-stone-400">
                  {category.description}
                </p>
              )}
            </div>
          </div>
        </header>

        {/* Blog Posts Grid */}
        <main>
          <Suspense fallback={<BlogGridSkeleton />}>
            <CategoryBlogGrid categorySlug={slug} page={page} />
          </Suspense>
        </main>

        {/* Other Categories */}
        <Suspense fallback={null}>
          <OtherCategories currentSlug={slug} />
        </Suspense>
      </div>
    </>
  )
}
