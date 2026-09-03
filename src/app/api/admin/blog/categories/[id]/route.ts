import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type RouteContext = {
  params: Promise<{ id: string }>
}

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { authError: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single()
  if (!profile || profile.role !== 'admin') return { authError: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  return { authError: null }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { authError } = await requireAdmin()
  if (authError) return authError

  try {
    const { id } = await context.params
    const supabase = await createClient()
    const body = await request.json()

    const { name, slug, description, image_url, meta_title, meta_description, is_active } = body

    // Check for duplicate slug if slug is being changed
    if (slug) {
      const { data: existing } = await supabase
        .from('blog_categories')
        .select('id')
        .eq('slug', slug)
        .neq('id', id)
        .single()

      if (existing) {
        return NextResponse.json(
          { message: 'Slug sudah digunakan' },
          { status: 400 }
        )
      }
    }

    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (name !== undefined) updateData.name = name
    if (slug !== undefined) updateData.slug = slug
    if (description !== undefined) updateData.description = description || null
    if (image_url !== undefined) updateData.image_url = image_url || null
    if (meta_title !== undefined) updateData.meta_title = meta_title || null
    if (meta_description !== undefined) updateData.meta_description = meta_description || null
    if (is_active !== undefined) updateData.is_active = is_active

    const { data, error } = await supabase
      .from('blog_categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating blog category:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { authError } = await requireAdmin()
  if (authError) return authError

  try {
    const { id } = await context.params
    const supabase = await createClient()

    // Check if category has posts
    const { count } = await supabase
      .from('blog_posts')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id)

    if (count && count > 0) {
      return NextResponse.json(
        { message: `Tidak dapat menghapus. Kategori memiliki ${count} artikel.` },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('blog_categories')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting blog category:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
