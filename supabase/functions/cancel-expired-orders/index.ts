// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Order {
  id: string
  order_number: string
  user_id: string
  status: string
  created_at: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key for admin access
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Calculate expiration time (24 hours ago)
    const expirationTime = new Date()
    expirationTime.setHours(expirationTime.getHours() - 24)

    console.log(`Checking for orders older than ${expirationTime.toISOString()}`)

    // Find all pending_payment orders older than 24 hours
    const { data: expiredOrders, error: fetchError } = await supabase
      .from('orders')
      .select('id, order_number, user_id, status, created_at')
      .eq('status', 'pending_payment')
      .lt('created_at', expirationTime.toISOString())

    if (fetchError) {
      console.error('Error fetching expired orders:', fetchError)
      throw fetchError
    }

    if (!expiredOrders || expiredOrders.length === 0) {
      console.log('No expired orders found')
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No expired orders found',
          cancelled: 0
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    console.log(`Found ${expiredOrders.length} expired orders`)

    // Cancel each expired order
    const cancelledOrders: string[] = []
    const errors: string[] = []

    for (const order of expiredOrders as Order[]) {
      try {
        // Update order status to cancelled
        const { error: updateError } = await supabase
          .from('orders')
          .update({ 
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('id', order.id)

        if (updateError) {
          console.error(`Error cancelling order ${order.order_number}:`, updateError)
          errors.push(`${order.order_number}: ${updateError.message}`)
          continue
        }

        // Restore inventory for cancelled order
        const { data: orderItems, error: itemsError } = await supabase
          .from('order_items')
          .select('product_id, quantity')
          .eq('order_id', order.id)

        if (itemsError) {
          console.error(`Error fetching items for order ${order.order_number}:`, itemsError)
          errors.push(`${order.order_number}: Failed to restore inventory`)
          continue
        }

        // Restore stock for each item
        for (const item of orderItems || []) {
          await supabase.rpc('restore_inventory', {
            p_product_id: item.product_id,
            p_quantity: item.quantity
          })
        }

        // Create notification for user
        await supabase
          .from('notifications')
          .insert({
            user_id: order.user_id,
            type: 'order_cancelled',
            title: 'Pesanan Dibatalkan',
            message: `Pesanan ${order.order_number} telah dibatalkan karena pembayaran tidak diterima dalam 24 jam`,
            data: { order_id: order.id, order_number: order.order_number, reason: 'payment_timeout' },
            is_read: false
          })

        cancelledOrders.push(order.order_number)
        console.log(`Successfully cancelled order ${order.order_number}`)
      } catch (error) {
        console.error(`Error processing order ${order.order_number}:`, error)
        errors.push(`${order.order_number}: ${error.message}`)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Cancelled ${cancelledOrders.length} expired orders`,
        cancelled: cancelledOrders.length,
        orders: cancelledOrders,
        errors: errors.length > 0 ? errors : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in cancel-expired-orders function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/cancel-expired-orders' \
    --header 'Authorization: Bearer YOUR_ANON_KEY' \
    --header 'Content-Type: application/json'

  To setup as a cron job in Supabase:
  
  1. Go to Database > Extensions and enable pg_cron
  2. Run this SQL:

  SELECT cron.schedule(
    'cancel-expired-orders',
    '0 * * * *', -- Run every hour
    $$
    SELECT
      net.http_post(
        url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/cancel-expired-orders',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
      ) as request_id;
    $$
  );

*/
