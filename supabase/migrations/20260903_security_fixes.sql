-- =============================================================
-- Security fixes 2026-09-03
-- Ref: docs/AUDIT.md — P0-1, P0-3
-- =============================================================

-- P0-1: Tambah guest_token ke orders untuk secure guest tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_token UUID DEFAULT gen_random_uuid();

-- Hapus policy anon SELECT yang bocor (expose PII semua guest)
DROP POLICY IF EXISTS "Allow guest order view by email" ON orders;
DROP POLICY IF EXISTS "Allow guest order items view" ON order_items;
DROP POLICY IF EXISTS "Allow guest payments view" ON payments;

-- Ganti dengan policy berbasis guest_token
CREATE POLICY "Guest can view own order by token"
ON orders FOR SELECT TO anon
USING (
  user_id IS NULL
  AND guest_token IS NOT NULL
  AND guest_token::text = current_setting('app.current_guest_token', true)
);

CREATE POLICY "Guest can view own order items by token"
ON order_items FOR SELECT TO anon
USING (
  order_id IN (
    SELECT id FROM orders
    WHERE user_id IS NULL
      AND guest_token IS NOT NULL
      AND guest_token::text = current_setting('app.current_guest_token', true)
  )
);

CREATE POLICY "Guest can view own payments by token"
ON payments FOR SELECT TO anon
USING (
  order_id IN (
    SELECT id FROM orders
    WHERE user_id IS NULL
      AND guest_token IS NOT NULL
      AND guest_token::text = current_setting('app.current_guest_token', true)
  )
);

-- P0-3: Hapus policy anon UPDATE site_settings (DoS vector)
DROP POLICY IF EXISTS "Public can update server status" ON site_settings;
DROP POLICY IF EXISTS "Admins can update site settings" ON site_settings;

CREATE POLICY "Admin can update site settings"
ON site_settings FOR UPDATE TO authenticated
USING (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles
  WHERE profiles.user_id = auth.uid() AND profiles.role = 'admin'
));
