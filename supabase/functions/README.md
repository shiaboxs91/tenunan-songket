# Supabase Edge Functions

This directory contains Supabase Edge Functions for the Tenunan Songket e-commerce platform.

## Functions

### 1. cancel-expired-orders

Automatically cancels orders that have been in `pending_payment` status for more than 24 hours.

**Features:**
- Finds orders older than 24 hours with pending payment
- Updates order status to `cancelled`
- Restores inventory for cancelled items
- Sends notification to user

**Schedule:** Runs every hour

### 2. aggregate-daily-stats

Aggregates daily statistics for analytics and reporting.

**Features:**
- Calculates total orders and revenue
- Counts total items sold
- Identifies new customers
- Calculates average order value
- Stores data in `daily_stats` table

**Schedule:** Runs daily at 1 AM

## Setup

### Prerequisites

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

### Deploy Functions

Deploy all functions:
```bash
supabase functions deploy
```

Deploy specific function:
```bash
supabase functions deploy cancel-expired-orders
supabase functions deploy aggregate-daily-stats
```

### Setup Cron Jobs

1. Enable pg_cron extension in Supabase Dashboard:
   - Go to Database > Extensions
   - Search for "pg_cron"
   - Enable the extension

2. Enable pg_net extension (for HTTP requests):
   - Go to Database > Extensions
   - Search for "pg_net"
   - Enable the extension

3. Create cron jobs by running this SQL in the SQL Editor:

```sql
-- Cancel expired orders (runs every hour)
SELECT cron.schedule(
  'cancel-expired-orders',
  '0 * * * *',
  $$
  SELECT
    net.http_post(
      url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/cancel-expired-orders',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
    ) as request_id;
  $$
);

-- Aggregate daily stats (runs daily at 1 AM)
SELECT cron.schedule(
  'aggregate-daily-stats',
  '0 1 * * *',
  $$
  SELECT
    net.http_post(
      url:='https://YOUR_PROJECT_REF.supabase.co/functions/v1/aggregate-daily-stats',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
    ) as request_id;
  $$
);
```

**Important:** Replace `YOUR_PROJECT_REF` and `YOUR_SERVICE_ROLE_KEY` with your actual values.

### View Cron Jobs

To see all scheduled jobs:
```sql
SELECT * FROM cron.job;
```

To see job run history:
```sql
SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
```

### Delete Cron Jobs

To remove a cron job:
```sql
SELECT cron.unschedule('cancel-expired-orders');
SELECT cron.unschedule('aggregate-daily-stats');
```

## Local Development

### Run Functions Locally

1. Start Supabase locally:
```bash
supabase start
```

2. Serve functions:
```bash
supabase functions serve
```

3. Test function:
```bash
curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/cancel-expired-orders' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json'
```

## Environment Variables

Functions automatically have access to:
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key for admin access
- `SUPABASE_ANON_KEY` - Anonymous key for public access

## Database Requirements

### Tables Required

- `orders` - Order records
- `order_items` - Order line items
- `products` - Product inventory
- `notifications` - User notifications
- `daily_stats` - Aggregated statistics

### Functions Required

- `restore_inventory(p_product_id, p_quantity)` - Restores product stock

## Monitoring

Monitor function execution:
1. Go to Edge Functions in Supabase Dashboard
2. Click on function name
3. View logs and metrics

Monitor cron jobs:
```sql
-- View recent job runs
SELECT 
  job_id,
  job_name,
  status,
  start_time,
  end_time,
  return_message
FROM cron.job_run_details 
ORDER BY start_time DESC 
LIMIT 20;
```

## Troubleshooting

### Function not running
- Check function logs in Supabase Dashboard
- Verify environment variables are set
- Test function manually via HTTP request

### Cron job not executing
- Verify pg_cron extension is enabled
- Check cron job schedule syntax
- View job_run_details for error messages
- Ensure pg_net extension is enabled

### Permission errors
- Verify service role key is correct
- Check RLS policies on affected tables
- Ensure function has necessary permissions

## Security

- Functions use service role key for admin access
- Always validate input data
- Use RLS policies for data protection
- Never expose service role key in client code
- Monitor function logs for suspicious activity
