import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const id = (await params).id

    // Check admin session
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .select(`
        *,
        category:blog_categories(id, name)
      `)
      .eq('id', id)
      .single()

    if (error) throw error

    if (!data) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // For MVP editing, just return basic data
    return NextResponse.json(data)
  } catch (error) {
    console.error('GET /api/admin/blog/[id] Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const id = (await params).id
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Filter allowed fields
    const allowedFields = [
      'title', 'slug', 'excerpt', 'content', 'featured_image_url', 
      'category_id', 'status', 'meta_title', 'meta_description', 
      'canonical_url', 'og_image_url', 'reading_time_minutes', 
      'is_featured', 'allow_comments'
    ]

    const updateData: Record<string, any> = {}
    
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key]
      }
    }

    // Ensure slug is properly formatted if updating
    if (updateData.slug) {
      updateData.slug = updateData.slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString()

    // Handle publishing state
    if (updateData.status === 'published') {
      // Check existing status to avoid overwriting original published date
      const { data: existing } = await supabase
        .from('blog_posts')
        .select('status, published_at')
        .eq('id', id)
        .single()
        
      if (existing && existing.status !== 'published' && !existing.published_at) {
        updateData.published_at = new Date().toISOString()
      }
    }

    const { data, error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation (slug)
        return NextResponse.json({ error: 'Slug is already used. Please choose another.' }, { status: 400 })
      }
      throw error
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('PATCH /api/admin/blog/[id] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient()
    const id = (await params).id
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('DELETE /api/admin/blog/[id] Error:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}