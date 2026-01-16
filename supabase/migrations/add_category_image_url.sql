-- Add image_url column to categories table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'categories' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE categories ADD COLUMN image_url TEXT;
    COMMENT ON COLUMN categories.image_url IS 'URL or path to category image';
  END IF;
END $$;

-- Update existing categories with image URLs from the JSON file
-- These URLs should be replaced with Supabase Storage URLs after migration
UPDATE categories SET image_url = 
  CASE name
    WHEN 'Songket Lepas' THEN 'https://tenunansongket.com/wp-content/uploads/2020/08/Untitled-Facebook-Cover-6-1.webp'
    WHEN 'Songket Bercorak' THEN 'https://tenunansongket.com/wp-content/uploads/2023/09/were-open-1pm-till-late-14.png'
    WHEN 'Songket Penuh' THEN 'https://tenunansongket.com/wp-content/uploads/2023/09/were-open-1pm-till-late-10.png'
    WHEN 'Kain Ela' THEN 'https://tenunansongket.com/wp-content/uploads/2020/08/Untitled-Facebook-Cover-6-1.webp'
    WHEN 'Kain Cindai' THEN 'https://tenunansongket.com/wp-content/uploads/2023/09/were-open-1pm-till-late-14.png'
    WHEN 'Kain Telepuk' THEN 'https://tenunansongket.com/wp-content/uploads/2023/09/were-open-1pm-till-late-10.png'
    WHEN 'Kain Limar' THEN 'https://tenunansongket.com/wp-content/uploads/2020/08/Untitled-Facebook-Cover-6-1.webp'
    WHEN 'Kain Pelangi' THEN 'https://tenunansongket.com/wp-content/uploads/2023/09/were-open-1pm-till-late-14.png'
    ELSE '/images/placeholder-product.svg'
  END
WHERE image_url IS NULL;
