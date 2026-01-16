-- Create hero_slides table
CREATE TABLE IF NOT EXISTS hero_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for active slides ordered by order_index
CREATE INDEX IF NOT EXISTS idx_hero_slides_active_order 
ON hero_slides(is_active, order_index) 
WHERE is_active = true;

-- Add RLS policies
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

-- Allow public read access to active slides
CREATE POLICY "Public can view active hero slides"
ON hero_slides FOR SELECT
TO public
USING (is_active = true);

-- Allow authenticated users with admin role to manage slides
CREATE POLICY "Admins can manage hero slides"
ON hero_slides FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);

-- Insert default slides
INSERT INTO hero_slides (title, description, image_url, order_index, is_active) VALUES
('Tenunan Songket Collection', 'Koleksi tenunan songket tradisional', 'https://tenunansongket.com/wp-content/uploads/2020/08/Untitled-Facebook-Cover-6-1.webp', 1, true),
('Model Songket Elegant', 'Model songket yang elegan dan mewah', 'https://tenunansongket.com/wp-content/uploads/2023/09/were-open-1pm-till-late-14.png', 2, true),
('Songket Fashion', 'Fashion songket untuk acara istimewa', 'https://tenunansongket.com/wp-content/uploads/2023/09/were-open-1pm-till-late-10.png', 3, true)
ON CONFLICT DO NOTHING;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_hero_slides_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hero_slides_updated_at
BEFORE UPDATE ON hero_slides
FOR EACH ROW
EXECUTE FUNCTION update_hero_slides_updated_at();

-- Add comment
COMMENT ON TABLE hero_slides IS 'Hero slider images for homepage';
