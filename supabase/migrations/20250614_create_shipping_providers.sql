-- Create shipping_providers table for managing shipping options
CREATE TABLE shipping_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  logo_url TEXT,
  services JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment for documentation
COMMENT ON TABLE shipping_providers IS 'Stores shipping provider configurations with their services';

-- Create indexes
CREATE INDEX idx_shipping_providers_code ON shipping_providers(code);
CREATE INDEX idx_shipping_providers_is_active ON shipping_providers(is_active);
CREATE INDEX idx_shipping_providers_display_order ON shipping_providers(display_order);

-- Enable RLS
ALTER TABLE shipping_providers ENABLE ROW LEVEL SECURITY;

-- Policy: Allow admins full access
CREATE POLICY "Admins can manage shipping providers" ON shipping_providers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Allow authenticated users to read active providers
CREATE POLICY "Users can read active shipping providers" ON shipping_providers
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policy: Allow anonymous users to read active providers (for checkout preview)
CREATE POLICY "Anon can read active shipping providers" ON shipping_providers
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_shipping_providers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_shipping_providers_updated_at
  BEFORE UPDATE ON shipping_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_shipping_providers_updated_at();

-- Insert seed data for Indonesian shipping providers
INSERT INTO shipping_providers (name, code, logo_url, services, is_active, display_order) VALUES
  ('JNE', 'jne', '/images/shipping/jne.png', '[
    {"code": "REG", "name": "JNE Reguler", "estimated_days": "2-3", "base_cost": 15000},
    {"code": "YES", "name": "JNE YES", "estimated_days": "1", "base_cost": 25000},
    {"code": "OKE", "name": "JNE OKE", "estimated_days": "3-5", "base_cost": 12000}
  ]'::jsonb, true, 1),
  
  ('J&T Express', 'jnt', '/images/shipping/jnt.png', '[
    {"code": "EZ", "name": "J&T EZ", "estimated_days": "2-3", "base_cost": 14000},
    {"code": "EXPRESS", "name": "J&T Express", "estimated_days": "1-2", "base_cost": 20000}
  ]'::jsonb, true, 2),
  
  ('SiCepat', 'sicepat', '/images/shipping/sicepat.png', '[
    {"code": "REG", "name": "SiCepat Reguler", "estimated_days": "2-3", "base_cost": 13000},
    {"code": "BEST", "name": "SiCepat BEST", "estimated_days": "1-2", "base_cost": 18000},
    {"code": "HALU", "name": "SiCepat HALU", "estimated_days": "1", "base_cost": 30000}
  ]'::jsonb, true, 3),
  
  ('Pos Indonesia', 'pos', '/images/shipping/pos.png', '[
    {"code": "KILAT", "name": "Pos Kilat Khusus", "estimated_days": "2-4", "base_cost": 15000},
    {"code": "EXPRESS", "name": "Pos Express", "estimated_days": "1-2", "base_cost": 22000}
  ]'::jsonb, true, 4),
  
  ('Anteraja', 'anteraja', '/images/shipping/anteraja.png', '[
    {"code": "REG", "name": "Anteraja Reguler", "estimated_days": "2-3", "base_cost": 14000},
    {"code": "NEXT", "name": "Anteraja Next Day", "estimated_days": "1", "base_cost": 25000},
    {"code": "SAME", "name": "Anteraja Same Day", "estimated_days": "0", "base_cost": 40000}
  ]'::jsonb, true, 5),
  
  ('Ninja Express', 'ninja', '/images/shipping/ninja.png', '[
    {"code": "STD", "name": "Ninja Standard", "estimated_days": "2-3", "base_cost": 15000},
    {"code": "NEXT", "name": "Ninja Next Day", "estimated_days": "1", "base_cost": 28000}
  ]'::jsonb, true, 6);
