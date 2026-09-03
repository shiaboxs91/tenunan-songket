import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return { authError: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single()
  if (!profile || profile.role !== 'admin') return { authError: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  return { authError: null }
}

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching blog categories:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const { authError } = await requireAdmin()
  if (authError) return authError

  try {
    const supabase = await createClient()
    const body = await request.json()

    const { name, slug, description, image_url, meta_title, meta_description, is_active } = body

    if (!name || !slug) {
      return NextResponse.json(
        { message: 'Name dan slug harus diisi' },
        { status: 400 }
      )
    }

    // Check for duplicate slug
    const { data: existing } = await supabase
      .from('blog_categories')
      .select('id')
      .eq('slug', slug)
      .single()

    if (existing) {
      return NextResponse.json(
        { message: 'Slug sudah digunakan' },
        { status: 400 }
      )
    }

    // Get max display_order
    const { data: maxOrder } = await supabase
      .from('blog_categories')
      .select('display_order')
      .order('display_order', { ascending: false })
      .limit(1)
      .single()

    const display_order = (maxOrder?.display_order ?? -1) + 1

    const { data, error } = await supabase
      .from('blog_categories')
      .insert({
        name,
        slug,
        description: description || null,
        image_url: image_url || null,
        meta_title: meta_title || null,
        meta_description: meta_description || null,
        is_active: is_active ?? true,
        display_order
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating blog category:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
