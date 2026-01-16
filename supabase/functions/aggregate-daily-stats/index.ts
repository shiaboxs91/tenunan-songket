// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DailyStats {
  date: string
  total_orders: number
  total_revenue: number
  total_items_sold: number
  new_customers: number
  average_order_value: number
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

    // Get yesterday's date
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)
    
    const startOfDay = yesterday.toISOString()
    const endOfDay = new Date(yesterday)
    endOfDay.setHours(23, 59, 59, 999)
    const endOfDayStr = endOfDay.toISOString()

    const dateStr = yesterday.toISOString().split('T')[0]

    console.log(`Aggregating stats for ${dateStr}`)

    // Check if stats already exist for this date
    const { data: existingStats } = await supabase
      .from('daily_stats')
      .select('date')
      .eq('date', dateStr)
      .single()

    if (existingStats) {
      console.log(`Stats already exist for ${dateStr}`)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `Stats already exist for ${dateStr}`,
          date: dateStr
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    // Get total orders and revenue for the day
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('id, total, user_id')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDayStr)
      .neq('status', 'cancelled')

    if (ordersError) {
      console.error('Error fetching orders:', ordersError)
      throw ordersError
    }

    const totalOrders = orders?.length || 0
    const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total), 0) || 0
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

    // Get total items sold
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('quantity, order_id')
      .in('order_id', orders?.map(o => o.id) || [])

    if (itemsError) {
      console.error('Error fetching order items:', itemsError)
      throw itemsError
    }

    const totalItemsSold = orderItems?.reduce((sum, item) => sum + item.quantity, 0) || 0

    // Get new customers (first order on this day)
    const uniqueUserIds = [...new Set(orders?.map(o => o.user_id) || [])]
    let newCustomers = 0

    for (const userId of uniqueUserIds) {
      const { data: previousOrders } = await supabase
        .from('orders')
        .select('id')
        .eq('user_id', userId)
        .lt('created_at', startOfDay)
        .limit(1)

      if (!previousOrders || previousOrders.length === 0) {
        newCustomers++
      }
    }

    // Insert daily stats
    const stats: DailyStats = {
      date: dateStr,
      total_orders: totalOrders,
      total_revenue: totalRevenue,
      total_items_sold: totalItemsSold,
      new_customers: newCustomers,
      average_order_value: averageOrderValue
    }

    const { error: insertError } = await supabase
      .from('daily_stats')
      .insert(stats)

    if (insertError) {
      console.error('Error inserting daily stats:', insertError)
      throw insertError
    }

    console.log(`Successfully aggregated stats for ${dateStr}:`, stats)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully aggregated stats for ${dateStr}`,
        stats
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in aggregate-daily-stats function:', error)
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

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/aggregate-daily-stats' \
    --header 'Authorization: Bearer YOUR_ANON_KEY' \
    --header 'Content-Type: application/json'

  To setup as a cron job in Supabase:
  
  1. Go to Database > Extensions and enable pg_cron
  2. Run this SQL:

  SELECT cron.schedule(
    'aggregate-daily-stats',
    '0 1 * * *', -- Run daily at 1 AM
    $$
    SELECT
      net.http_post(
        url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/aggregate-daily-stats',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
      ) as request_id;
    $$
  );

*/
