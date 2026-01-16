import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Use service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// PUT - Update admin (name and/or password)
export async function PUT(request: NextRequest) {
  try {
    const { user_id, full_name, new_password } = await request.json()

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID wajib diisi' },
        { status: 400 }
      )
    }

    // Update password if provided
    if (new_password) {
      if (new_password.length < 8) {
        return NextResponse.json(
          { error: 'Password minimal 8 karakter' },
          { status: 400 }
        )
      }

      const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(
        user_id,
        { password: new_password }
      )

      if (authError) {
        console.error('Auth update error:', authError)
        return NextResponse.json(
          { error: 'Gagal mengubah password: ' + authError.message },
          { status: 400 }
        )
      }
    }

    // Update profile name if provided
    if (full_name !== undefined) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({ full_name })
        .eq('user_id', user_id)

      if (profileError) {
        console.error('Profile update error:', profileError)
        return NextResponse.json(
          { error: 'Gagal mengubah nama: ' + profileError.message },
          { status: 400 }
        )
      }
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Update admin error:', error)
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}

// POST - Create new admin
export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name } = await request.json()

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: 'Email, password, dan nama lengkap wajib diisi' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password minimal 8 karakter' },
        { status: 400 }
      )
    }

    // Create user with admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Gagal membuat user' },
        { status: 500 }
      )
    }

    // Create or update profile with admin role
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        user_id: authData.user.id,
        full_name,
        role: 'admin'
      }, {
        onConflict: 'user_id'
      })

    if (profileError) {
      console.error('Profile error:', profileError)
      // Rollback: delete the auth user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      return NextResponse.json(
        { error: 'Gagal membuat profile: ' + profileError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        full_name
      }
    })
  } catch (error: any) {
    console.error('Create admin error:', error)
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan' },
      { status: 500 }
    )
  }
}
