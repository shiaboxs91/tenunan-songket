import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, Clock, Eye, Tag, User, ArrowLeft } from 'lucide-react'
import {
  getBlogPostBySlug,
  getRelatedPosts,
  getAllPublishedPostSlugs,
  incrementViewCount,
} from '@/lib/supabase/blog'
import { ArticleJsonLd, BreadcrumbJsonLd } from '@/components/seo'
import { BlogCard } from '@/components/blog/BlogCard'
import { ReadingProgress } from '@/components/blog/ReadingProgress'
import { TableOfContents } from '@/components/blog/TableOfContents'
import { SocialShareButtons } from '@/components/blog/SocialShareButtons'
import { RelatedProducts } from '@/components/blog/RelatedProducts'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tenunansongket.com'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  try {
    const posts = await getAllPublishedPostSlugs()
    return posts.map((post) => ({
      slug: post.slug,
    }))
  } catch {
    return []
  }
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  
  try {
    const post = await getBlogPostBySlug(slug)

    if (!post) {
      return {
        title: 'Artikel Tidak Ditemukan - Blog Tenunan Songket',
        description: 'Artikel yang anda cari tidak ditemukan.',
      }
    }

    const title = post.meta_title || `${post.title} - Blog Tenunan Songket`
    const description =
      post.meta_description || post.excerpt || post.content.slice(0, 155)
    const url = `${SITE_URL}/blog/${post.slug}`
    const image = post.og_image_url || post.featured_image_url || `${SITE_URL}/images/default-blog.jpg`

    return {
      title,
      description,
      keywords: post.tags?.map((t) => t.name).join(', '),
      authors: post.author ? [{ name: post.author.full_name || 'Tenunan Songket' }] : undefined,
      openGraph: {
        title,
        description,
        url,
        type: 'article',
        siteName: 'Tenunan Songket',
        locale: 'ms_MY',
        publishedTime: post.published_at || undefined,
        modifiedTime: post.updated_at,
        section: post.category?.name,
        tags: post.tags?.map((t) => t.name),
        images: [
          {
            url: image,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
      alternates: {
        canonical: post.canonical_url || url,
      },
    }
  } catch {
    return {
      title: 'Artikel Tidak Ditemukan - Blog Tenunan Songket',
      description: 'Artikel yang anda cari tidak ditemukan.',
    }
  }
}

function ArticleSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="aspect-video w-full rounded-xl" />
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    </div>
  )
}

function RelatedPostsSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="aspect-[16/10] rounded-xl" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-full" />
        </div>
      ))}
    </div>
  )
}

async function RelatedPostsSection({ postId, categoryId }: { postId: string; categoryId: string | null }) {
  const relatedPosts = await getRelatedPosts(postId, categoryId, 4)

  if (!relatedPosts || relatedPosts.length === 0) {
    return null
  }

  return (
    <section aria-labelledby="related-posts-heading" className="mt-16 border-t border-stone-200 pt-12 dark:border-stone-800">
      <h2 id="related-posts-heading" className="mb-8 text-2xl font-bold text-stone-900 dark:text-white">
        Artikel Berkaitan
      </h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {relatedPosts.map((post) => (
          <BlogCard
            key={post.id}
            post={{
              slug: post.slug,
              title: post.title,
              excerpt: post.excerpt,
              featured_image_url: post.featured_image_url,
              published_at: post.published_at,
              reading_time_minutes: post.reading_time_minutes,
              category: post.category as { name: string; slug: string } | null,
            }}
          />
        ))}
      </div>
    </section>
  )
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)

  let post
  try {
    post = await getBlogPostBySlug(decodedSlug)
  } catch {
    notFound()
  }

  if (!post) {
    notFound()
  }

  // Increment view count
  incrementViewCount(decodedSlug).catch(() => {})

  const postUrl = `${SITE_URL}/blog/${post.slug}`
  const formattedDate = post.published_at
    ? new Intl.DateTimeFormat('ms-MY', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(post.published_at))
    : null

  return (
    <>
      {/* Reading Progress Bar */}
      <ReadingProgress />

      {/* SEO: Article JSON-LD */}
      <ArticleJsonLd
        article={{
          title: post.title,
          description: post.meta_description || post.excerpt || post.content.slice(0, 155),
          url: postUrl,
          image: post.featured_image_url || `${SITE_URL}/images/default-blog.jpg`,
          publishedAt: post.published_at || post.created_at,
          modifiedAt: post.updated_at,
          authorName: post.author?.full_name || 'Tenunan Songket',
          section: post.category?.name,
          tags: post.tags?.map((t) => t.name),
        }}
      />

      {/* SEO: Breadcrumb JSON-LD */}
      <BreadcrumbJsonLd
        items={[
          { name: 'Beranda', url: SITE_URL },
          { name: 'Blog', url: `${SITE_URL}/blog` },
          ...(post.category
            ? [{ name: post.category.name, url: `${SITE_URL}/blog/category/${post.category.slug}` }]
            : []),
          { name: post.title, url: postUrl },
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

        <div className="grid gap-8 lg:grid-cols-[1fr_280px]">
          {/* Main Article Content */}
          <article className="min-w-0">
            <Suspense fallback={<ArticleSkeleton />}>
              {/* Article Header */}
              <header className="mb-8">
                {/* Category Badge */}
                {post.category && (
                  <Link href={`/blog/category/${post.category.slug}`}>
                    <Badge
                      variant="secondary"
                      className="mb-4 cursor-pointer transition-colors hover:bg-amber-100 hover:text-amber-800"
                    >
                      {post.category.name}
                    </Badge>
                  </Link>
                )}

                {/* Title */}
                <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-stone-900 dark:text-white sm:text-4xl lg:text-5xl">
                  {post.title}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-stone-600 dark:text-stone-400">
                  {/* Author */}
                  {post.author && (
                    <div className="flex items-center gap-2">
                      {post.author.avatar_url ? (
                        <Image
                          src={post.author.avatar_url}
                          alt={post.author.full_name || 'Author'}
                          width={32}
                          height={32}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                          <User className="h-4 w-4" />
                        </div>
                      )}
                      <span className="font-medium">{post.author.full_name || 'Tenunan Songket'}</span>
                    </div>
                  )}

                  {/* Date */}
                  {formattedDate && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {formattedDate}
                    </span>
                  )}

                  {/* Reading Time */}
                  {post.reading_time_minutes && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {post.reading_time_minutes} min bacaan
                    </span>
                  )}

                  {/* View Count */}
                  <span className="flex items-center gap-1.5">
                    <Eye className="h-4 w-4" />
                    {post.view_count.toLocaleString()} bacaan
                  </span>
                </div>
              </header>

              {/* Featured Image */}
              {post.featured_image_url && (
                <div className="mb-8 overflow-hidden rounded-xl">
                  <Image
                    src={post.featured_image_url}
                    alt={post.title}
                    width={1200}
                    height={630}
                    className="aspect-[16/9] w-full object-cover"
                    priority
                    sizes="(max-width: 768px) 100vw, 800px"
                  />
                </div>
              )}

              {/* Social Share - Mobile */}
              <div className="mb-8 lg:hidden">
                <SocialShareButtons url={postUrl} title={post.title} />
              </div>

              {/* Article Content */}
              <div
                className="prose prose-stone max-w-none dark:prose-invert prose-headings:scroll-mt-24 prose-headings:font-bold prose-h2:text-2xl prose-h3:text-xl prose-p:leading-relaxed prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-pre:bg-stone-900"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-10 border-t border-stone-200 pt-6 dark:border-stone-800">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-900 dark:text-white">
                    <Tag className="h-4 w-4" />
                    Tag
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link key={tag.id} href={`/blog?tag=${tag.slug}`}>
                        <Badge
                          variant="outline"
                          className="cursor-pointer transition-colors hover:bg-amber-50 hover:border-amber-300"
                        >
                          {tag.name}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Author Box */}
              {post.author && (
                <div className="mt-10 rounded-xl border border-stone-200 bg-stone-50 p-6 dark:border-stone-800 dark:bg-stone-900">
                  <div className="flex items-start gap-4">
                    {post.author.avatar_url ? (
                      <Image
                        src={post.author.avatar_url}
                        alt={post.author.full_name || 'Author'}
                        width={64}
                        height={64}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                        <User className="h-8 w-8" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Ditulis oleh</p>
                      <h4 className="text-lg font-bold text-stone-900 dark:text-white">
                        {post.author.full_name || 'Tenunan Songket'}
                      </h4>
                      <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                        Pakar dalam seni tenunan songket tradisional Melayu dengan pengalaman bertahun-tahun dalam industri kain songket.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Related Products */}
              {post.related_products && post.related_products.length > 0 && (
                <RelatedProducts products={post.related_products} />
              )}
            </Suspense>

            {/* Related Posts */}
            <Suspense fallback={<RelatedPostsSkeleton />}>
              <RelatedPostsSection postId={post.id} categoryId={post.category_id} />
            </Suspense>
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6">
              {/* Social Share */}
              <SocialShareButtons url={postUrl} title={post.title} vertical />

              {/* Table of Contents */}
              <TableOfContents content={post.content} />
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
