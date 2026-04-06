import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function PATCH(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { ids, status } = await request.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 })
    }

    if (!status || !['draft', 'published', 'archived'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const updateData: Record<string, any> = {
      status,
      updated_at: new Date().toISOString()
    }

    if (status === 'published') {
      updateData.published_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .in('id', ids)

    if (error) throw error

    return NextResponse.json({ success: true, count: ids.length })
  } catch (error) {
    console.error('PATCH /api/admin/blog/bulk Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { ids } = await request.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 })
    }

    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .in('id', ids)

    if (error) throw error

    return NextResponse.json({ success: true, count: ids.length })
  } catch (error) {
    console.error('DELETE /api/admin/blog/bulk Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}