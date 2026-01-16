-- Create app_versions table for managing application versions and cache busting
CREATE TABLE app_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version VARCHAR(20) NOT NULL,
  release_notes TEXT,
  is_mandatory BOOLEAN DEFAULT false,
  is_current BOOLEAN DEFAULT false,
  released_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment for documentation
COMMENT ON TABLE app_versions IS 'Stores application version history for cache management and forced updates';

-- Create indexes
CREATE INDEX idx_app_versions_version ON app_versions(version);
CREATE INDEX idx_app_versions_is_current ON app_versions(is_current);
CREATE INDEX idx_app_versions_released_at ON app_versions(released_at DESC);

-- Enable RLS
ALTER TABLE app_versions ENABLE ROW LEVEL SECURITY;

-- Policy: Allow admins full access
CREATE POLICY "Admins can manage app versions" ON app_versions
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

-- Policy: Allow everyone to read versions (for version checking)
CREATE POLICY "Anyone can read app versions" ON app_versions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Anon can read app versions" ON app_versions
  FOR SELECT
  TO anon
  USING (true);

-- Function to ensure only one current version
CREATE OR REPLACE FUNCTION ensure_single_current_version()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_current = true THEN
    UPDATE app_versions SET is_current = false WHERE id != NEW.id AND is_current = true;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_single_current_version
  BEFORE INSERT OR UPDATE ON app_versions
  FOR EACH ROW
  WHEN (NEW.is_current = true)
  EXECUTE FUNCTION ensure_single_current_version();

-- Insert initial version
INSERT INTO app_versions (version, release_notes, is_mandatory, is_current, released_at) VALUES
  ('1.0.0', 'Versi awal Tenunan Songket E-commerce:
- Katalog produk songket
- Keranjang belanja
- Checkout dengan Stripe
- Manajemen akun pelanggan
- Panel admin dasar', false, true, NOW());
