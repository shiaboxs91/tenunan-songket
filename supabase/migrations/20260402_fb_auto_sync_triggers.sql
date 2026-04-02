-- Auto-sync trigger: Mark products for FB sync when updated
-- This creates a database trigger that automatically queues products for Facebook sync

-- Function to mark product for sync
CREATE OR REPLACE FUNCTION trigger_fb_product_sync()
RETURNS TRIGGER AS $$
BEGIN
  -- Only trigger on significant changes (not just view counts etc)
  IF (TG_OP = 'UPDATE' AND (
    OLD.title IS DISTINCT FROM NEW.title OR
    OLD.description IS DISTINCT FROM NEW.description OR
    OLD.price IS DISTINCT FROM NEW.price OR
    OLD.sale_price IS DISTINCT FROM NEW.sale_price OR
    OLD.stock IS DISTINCT FROM NEW.stock OR
    OLD.is_active IS DISTINCT FROM NEW.is_active
  )) OR TG_OP = 'INSERT' THEN
    -- Check if auto_sync is enabled
    IF EXISTS (
      SELECT 1 FROM fb_catalog_config 
      WHERE is_active = true AND auto_sync_enabled = true
    ) THEN
      -- Upsert sync status to pending
      INSERT INTO fb_catalog_products (product_id, sync_status, updated_at)
      VALUES (NEW.id, 'pending', NOW())
      ON CONFLICT (product_id) 
      DO UPDATE SET sync_status = 'pending', updated_at = NOW();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on products table
DROP TRIGGER IF EXISTS on_product_change_sync_fb ON products;
CREATE TRIGGER on_product_change_sync_fb
  AFTER INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION trigger_fb_product_sync();

-- Function to mark product for deletion from FB when product is deleted/deactivated
CREATE OR REPLACE FUNCTION trigger_fb_product_delete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_deleted = true OR NEW.is_active = false THEN
    -- Mark for deletion in FB
    UPDATE fb_catalog_products
    SET sync_status = 'pending_delete', updated_at = NOW()
    WHERE product_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for product deletion/deactivation
DROP TRIGGER IF EXISTS on_product_delete_sync_fb ON products;
CREATE TRIGGER on_product_delete_sync_fb
  AFTER UPDATE ON products
  FOR EACH ROW
  WHEN (NEW.is_deleted = true OR NEW.is_active = false)
  EXECUTE FUNCTION trigger_fb_product_delete();

-- Add index for faster pending sync lookups
CREATE INDEX IF NOT EXISTS idx_fb_catalog_products_sync_status 
ON fb_catalog_products(sync_status) WHERE sync_status = 'pending';

COMMENT ON FUNCTION trigger_fb_product_sync IS 'Automatically marks products for Facebook catalog sync when product data changes';
COMMENT ON FUNCTION trigger_fb_product_delete IS 'Marks products for deletion from Facebook catalog when product is deleted or deactivated';
