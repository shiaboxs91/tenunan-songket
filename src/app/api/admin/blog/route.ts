import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    // Check admin session
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || 'all'
    const category = searchParams.get('category') || 'all'
    
    const offset = (page - 1) * limit

    let query = supabase
      .from('blog_posts')
      .select(`
        id, title, slug, status, view_count, created_at, published_at,
        category:blog_categories(name)
      `, { count: 'exact' })

    if (search) {
      query = query.ilike('title', `%${search}%`)
    }

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    if (category !== 'all') {
      query = query.eq('category_id', category)
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error

    return NextResponse.json({
      posts: data || [],
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit),
      page,
    })
  } catch (error) {
    console.error('GET /api/admin/blog Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validation
    if (!body.title || !body.slug || !body.content) {
      return NextResponse.json({ error: 'Title, slug, and content are required' }, { status: 400 })
    }

    // Generate unique slug if not provided properly
    let slug = body.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

    const postData = {
      title: body.title,
      slug,
      excerpt: body.excerpt || '',
      content: body.content,
      featured_image_url: body.featured_image_url || null,
      category_id: body.category_id || null,
      author_id: session.user.id, // Set the current user as author
      status: body.status || 'draft',
      meta_title: body.meta_title || null,
      meta_description: body.meta_description || null,
      canonical_url: body.canonical_url || null,
      og_image_url: body.og_image_url || null,
      reading_time_minutes: body.reading_time_minutes || null,
      is_featured: body.is_featured || false,
      allow_comments: body.allow_comments !== undefined ? body.allow_comments : true,
    }

    // Set published_at if publishing for the first time
    if (postData.status === 'published') {
      postData.published_at = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .insert(postData)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation (slug)
        return NextResponse.json({ error: 'Slug is already used. Please choose another.' }, { status: 400 })
      }
      throw error
    }

    // We'll skip complex relations like tags and products for MVP post creation to ensure it doesn't break
    
    return NextResponse.json(data)
  } catch (error: any) {
    console.error('POST /api/admin/blog Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}