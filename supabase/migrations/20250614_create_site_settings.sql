-- Create site_settings table for storing site configuration
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment for documentation
COMMENT ON TABLE site_settings IS 'Stores site configuration settings like general info, contact, social media, and SEO';

-- Create index on key for faster lookups
CREATE INDEX idx_site_settings_key ON site_settings(key);

-- Enable RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Allow admins to read all settings
CREATE POLICY "Admins can read site settings" ON site_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Allow admins to insert settings
CREATE POLICY "Admins can insert site settings" ON site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: Allow admins to update settings
CREATE POLICY "Admins can update site settings" ON site_settings
  FOR UPDATE
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

-- Policy: Allow public read for certain settings (for frontend)
CREATE POLICY "Public can read public settings" ON site_settings
  FOR SELECT
  TO anon
  USING (key IN ('general', 'contact', 'social', 'seo'));

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_site_settings_updated_at();

-- Insert default settings
INSERT INTO site_settings (key, value) VALUES
  ('general', '{
    "site_name": "Tenunan Songket",
    "tagline": "Keindahan Warisan Budaya Nusantara",
    "logo_url": "/images/logo.png",
    "favicon_url": "/favicon.ico"
  }'::jsonb),
  ('contact', '{
    "email": "info@tenunansongket.com",
    "phone": "+673 123 4567",
    "whatsapp": "+673 123 4567",
    "address": "Bandar Seri Begawan, Brunei Darussalam"
  }'::jsonb),
  ('social', '{
    "instagram": "https://instagram.com/tenunansongket",
    "facebook": "https://facebook.com/tenunansongket",
    "twitter": "",
    "tiktok": ""
  }'::jsonb),
  ('seo', '{
    "meta_title": "Tenunan Songket - Keindahan Warisan Budaya Nusantara",
    "meta_description": "Temukan koleksi kain songket asli dengan motif tradisional yang indah. Kualitas terbaik dengan harga terjangkau.",
    "keywords": ["songket", "kain tradisional", "tenun", "budaya nusantara", "kerajinan tangan"]
  }'::jsonb);
