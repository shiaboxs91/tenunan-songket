-- Add countries column to shipping_providers table
-- This allows filtering providers by destination country at checkout

ALTER TABLE shipping_providers 
ADD COLUMN IF NOT EXISTS countries text[] DEFAULT '{}';

-- Add comment for documentation
COMMENT ON COLUMN shipping_providers.countries IS 'Array of ISO country codes where this provider is available (e.g., MY, SG, BN)';

-- Update existing providers with default countries
UPDATE shipping_providers SET countries = ARRAY['MY'] WHERE code IN ('skynet', 'sky');
UPDATE shipping_providers SET countries = ARRAY['SG'] WHERE code = 'sf-express';
UPDATE shipping_providers SET countries = ARRAY['MY', 'SG', 'BN', 'ID'] WHERE code = 'aramex';
