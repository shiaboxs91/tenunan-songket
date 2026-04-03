import { createClient } from './server'

// Types
export interface BlogCategory {
  id: string
  name: string
  slug: string
  description: string | null
  image_url: string | null
  meta_title: string | null
  meta_description: string | null
  display_order: number | null
  is_active: boolean | null
  created_at: string | null
  updated_at: string | null
}

export interface BlogTag {
  id: string
  name: string
  slug: string
  created_at: string | null
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  featured_image_url: string | null
  category_id: string | null
  author_id: string | null
  status: 'draft' | 'published' | 'archived'
  published_at: string | null
  meta_title: string | null
  meta_description: string | null
  canonical_url: string | null
  og_image_url: string | null
  view_count: number | null
  reading_time_minutes: number | null
  is_featured: boolean | null
  allow_comments: boolean | null
  created_at: string | null
  updated_at: string | null
  // Relations
  category?: BlogCategory | null
  author?: {
    id: string
    full_name: string | null
    avatar_url: string | null
  } | null
  tags?: BlogTag[]
  related_products?: {
    id: string
    title: string
    slug: string
    price: number
    sale_price: number | null
    image_url: string | null
  }[]
}

export interface BlogPostFilters {
  status?: 'draft' | 'published' | 'archived'
  category_slug?: string
  tag_slug?: string
  is_featured?: boolean
  search?: string
  page?: number
  limit?: number
}

// Public Functions (for frontend)

export async function getBlogCategories() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('blog_categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) throw error
  return data as BlogCategory[]
}

export async function getBlogCategoryBySlug(slug: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('blog_categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) throw error
  return data as BlogCategory
}

export async function getBlogTags() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('blog_tags')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return data as BlogTag[]
}

export async function getBlogPosts(filters: BlogPostFilters = {}) {
  const supabase = await createClient()
  const {
    status = 'published',
    category_slug,
    tag_slug,
    is_featured,
    search,
    page = 1,
    limit = 12
  } = filters

  let query = supabase
    .from('blog_posts')
    .select(`
      *,
      category:blog_categories(*),
      author:profiles(id, full_name, avatar_url)
    `, { count: 'exact' })
    .eq('status', status)
    .order('published_at', { ascending: false })

  if (category_slug) {
    const category = await getBlogCategoryBySlug(category_slug)
    if (category) {
      query = query.eq('category_id', category.id)
    }
  }

  if (is_featured !== undefined) {
    query = query.eq('is_featured', is_featured)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`)
  }

  // Pagination
  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) throw error

  // If filtering by tag, we need additional query
  let filteredData = data
  if (tag_slug && data) {
    const { data: tagData } = await supabase
      .from('blog_tags')
      .select('id')
      .eq('slug', tag_slug)
      .single()

    if (tagData) {
      const { data: postTagData } = await supabase
        .from('blog_post_tags')
        .select('post_id')
        .eq('tag_id', tagData.id)

      const postIds = postTagData?.map(pt => pt.post_id) || []
      filteredData = data.filter(post => postIds.includes(post.id))
    }
  }

  return {
    posts: filteredData as BlogPost[],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit)
  }
}

export async function getBlogPostBySlug(slug: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      category:blog_categories(*),
      author:profiles(id, full_name, avatar_url)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (error) throw error

  // Get tags
  const { data: tagData } = await supabase
    .from('blog_post_tags')
    .select(`
      tag:blog_tags(*)
    `)
    .eq('post_id', data.id)

  // Get related products
  const { data: productData } = await supabase
    .from('blog_post_products')
    .select(`
      product:products(id, title, slug, price, sale_price),
      display_order
    `)
    .eq('post_id', data.id)
    .order('display_order', { ascending: true })

  // Get product images
  const productIds = productData?.map(p => p.product?.id).filter(Boolean) || []
  let productImages: Record<string, string> = {}
  
  if (productIds.length > 0) {
    const { data: imagesData } = await supabase
      .from('product_images')
      .select('product_id, url')
      .in('product_id', productIds)
      .eq('is_primary', true)
    
    productImages = (imagesData || []).reduce((acc, img) => {
      acc[img.product_id] = img.url
      return acc
    }, {} as Record<string, string>)
  }

  const post: BlogPost = {
    ...data,
    status: (data.status || 'draft') as 'draft' | 'published' | 'archived',
    tags: tagData?.map(t => t.tag).filter(Boolean) as BlogTag[],
    related_products: productData?.map(p => ({
      ...p.product,
      image_url: productImages[p.product?.id || ''] || null
    })).filter(Boolean) as BlogPost['related_products']
  }

  return post
}

export async function getFeaturedPosts(limit = 5) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      id, title, slug, excerpt, featured_image_url, published_at, reading_time_minutes,
      category:blog_categories(id, name, slug)
    `)
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function getRelatedPosts(postId: string, categoryId: string | null, limit = 4) {
  const supabase = await createClient()
  
  let query = supabase
    .from('blog_posts')
    .select(`
      id, title, slug, excerpt, featured_image_url, published_at, reading_time_minutes,
      category:blog_categories(id, name, slug)
    `)
    .eq('status', 'published')
    .neq('id', postId)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getRecentPosts(limit = 5) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      id, title, slug, featured_image_url, published_at, reading_time_minutes,
      category:blog_categories(id, name, slug)
    `)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function incrementViewCount(slug: string) {
  const supabase = await createClient()
  
  // Use RPC function for atomic increment
  await supabase.rpc('increment_blog_view_count', { post_slug: slug })
}

export async function getPopularTags(limit = 10) {
  const supabase = await createClient()
  
  // Get tag usage counts
  const { data, error } = await supabase
    .from('blog_post_tags')
    .select(`
      tag_id,
      tag:blog_tags(id, name, slug)
    `)

  if (error) throw error

  // Count occurrences
  const tagCounts = (data || []).reduce((acc, item) => {
    if (item.tag) {
      const tag = item.tag as BlogTag
      acc[tag.id] = {
        ...tag,
        count: (acc[tag.id]?.count || 0) + 1
      }
    }
    return acc
  }, {} as Record<string, BlogTag & { count: number }>)

  // Sort by count and return top tags
  return Object.values(tagCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

// Admin Functions

export async function getAllBlogPosts(filters: BlogPostFilters = {}) {
  const supabase = await createClient()
  const {
    status,
    category_slug,
    search,
    page = 1,
    limit = 20
  } = filters

  let query = supabase
    .from('blog_posts')
    .select(`
      *,
      category:blog_categories(id, name, slug),
      author:profiles(id, full_name)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  if (category_slug) {
    const category = await getBlogCategoryBySlug(category_slug)
    if (category) {
      query = query.eq('category_id', category.id)
    }
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`)
  }

  const from = (page - 1) * limit
  const to = from + limit - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) throw error

  return {
    posts: data as BlogPost[],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit)
  }
}

export async function getBlogPostById(id: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('blog_posts')
    .select(`
      *,
      category:blog_categories(*),
      author:profiles(id, full_name, avatar_url)
    `)
    .eq('id', id)
    .single()

  if (error) throw error

  // Get tags
  const { data: tagData } = await supabase
    .from('blog_post_tags')
    .select('tag_id')
    .eq('post_id', data.id)

  // Get related products
  const { data: productData } = await supabase
    .from('blog_post_products')
    .select('product_id, display_order')
    .eq('post_id', data.id)
    .order('display_order', { ascending: true })

  return {
    ...data,
    tag_ids: tagData?.map(t => t.tag_id) || [],
    product_ids: productData?.map(p => p.product_id) || []
  }
}

export interface CreateBlogPostInput {
  title: string
  slug: string
  excerpt?: string
  content: string
  featured_image_url?: string
  category_id?: string
  author_id?: string
  status?: 'draft' | 'published' | 'archived'
  published_at?: string
  meta_title?: string
  meta_description?: string
  canonical_url?: string
  og_image_url?: string
  is_featured?: boolean
  allow_comments?: boolean
  tag_ids?: string[]
  product_ids?: string[]
}

export async function createBlogPost(input: CreateBlogPostInput) {
  const supabase = await createClient()
  const { tag_ids, product_ids, ...postData } = input

  // Set published_at if publishing
  if (postData.status === 'published' && !postData.published_at) {
    postData.published_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .insert(postData)
    .select()
    .single()

  if (error) throw error

  // Add tags
  if (tag_ids && tag_ids.length > 0) {
    await supabase
      .from('blog_post_tags')
      .insert(tag_ids.map(tag_id => ({ post_id: data.id, tag_id })))
  }

  // Add related products
  if (product_ids && product_ids.length > 0) {
    await supabase
      .from('blog_post_products')
      .insert(product_ids.map((product_id, index) => ({
        post_id: data.id,
        product_id,
        display_order: index
      })))
  }

  return data
}

export async function updateBlogPost(id: string, input: Partial<CreateBlogPostInput>) {
  const supabase = await createClient()
  const { tag_ids, product_ids, ...postData } = input

  // Set published_at if publishing for first time
  if (postData.status === 'published') {
    const existing = await getBlogPostById(id)
    if (existing.status !== 'published' && !postData.published_at) {
      postData.published_at = new Date().toISOString()
    }
  }

  const { data, error } = await supabase
    .from('blog_posts')
    .update(postData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error

  // Update tags
  if (tag_ids !== undefined) {
    await supabase.from('blog_post_tags').delete().eq('post_id', id)
    if (tag_ids.length > 0) {
      await supabase
        .from('blog_post_tags')
        .insert(tag_ids.map(tag_id => ({ post_id: id, tag_id })))
    }
  }

  // Update related products
  if (product_ids !== undefined) {
    await supabase.from('blog_post_products').delete().eq('post_id', id)
    if (product_ids.length > 0) {
      await supabase
        .from('blog_post_products')
        .insert(product_ids.map((product_id, index) => ({
          post_id: id,
          product_id,
          display_order: index
        })))
    }
  }

  return data
}

export async function deleteBlogPost(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('blog_posts')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Category Admin Functions

export async function getAllBlogCategories() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('blog_categories')
    .select('*')
    .order('display_order', { ascending: true })

  if (error) throw error
  return data as BlogCategory[]
}

export async function createBlogCategory(input: { name: string; slug: string } & Partial<Omit<BlogCategory, 'name' | 'slug'>>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('blog_categories')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateBlogCategory(id: string, input: Partial<BlogCategory>) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('blog_categories')
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteBlogCategory(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('blog_categories')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Tag Admin Functions

export async function createBlogTag(input: { name: string; slug: string }) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('blog_tags')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteBlogTag(id: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('blog_tags')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// SEO Helpers

export async function getAllPublishedPostSlugs() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getAllCategorySlugs() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('blog_categories')
    .select('slug, updated_at')
    .eq('is_active', true)

  if (error) throw error
  return data
}
