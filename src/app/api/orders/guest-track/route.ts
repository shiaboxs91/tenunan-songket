import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/orders/guest-track?email=x&order_number=TS-xxx&token=uuid
 *
 * Guest order tracking — requires email + order_number + guest_token.
 * Semua tiga harus cocok. Tidak expose data ke anon REST API langsung.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const email = searchParams.get('email')?.trim().toLowerCase()
  const order_number = searchParams.get('order_number')?.trim().toUpperCase()
  const token = searchParams.get('token')?.trim()

  if (!email || !order_number || !token) {
    return NextResponse.json(
      { error: 'Email, nomor order, dan token wajib diisi' },
      { status: 400 }
    )
  }

  // Validasi format UUID token
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(token)) {
    return NextResponse.json({ error: 'Token tidak valid' }, { status: 400 })
  }

  // Gunakan service role untuk query server-side — tidak expose ke client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )

  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select(`
        id, order_number, status, subtotal, discount, shipping_cost,
        total, currency, shipping_address, notes,
        created_at, paid_at, shipped_at, delivered_at,
        items:order_items(
          id, product_id, product_title, quantity, price, variant_info
        ),
        payment:payments(status, payment_method)
      `)
      .eq('order_number', order_number)
      .eq('guest_email', email)
      .eq('guest_token', token)
      .is('user_id', null)
      .single()

    if (error || !order) {
      // Jangan bedakan "tidak ditemukan" vs "token salah" — cegah enumeration
      return NextResponse.json(
        { error: 'Order tidak ditemukan. Periksa kembali email, nomor order, dan token.' },
        { status: 404 }
      )
    }

    return NextResponse.json({ order })
  } catch (err) {
    console.error('Guest track error:', err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
