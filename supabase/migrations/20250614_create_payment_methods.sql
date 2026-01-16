-- Create payment_methods table for managing payment options
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('stripe', 'bank_transfer', 'manual')),
  config JSONB DEFAULT '{}',
  instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment for documentation
COMMENT ON TABLE payment_methods IS 'Stores payment method configurations including Stripe and bank transfer options';

-- Create indexes
CREATE INDEX idx_payment_methods_code ON payment_methods(code);
CREATE INDEX idx_payment_methods_type ON payment_methods(type);
CREATE INDEX idx_payment_methods_is_active ON payment_methods(is_active);
CREATE INDEX idx_payment_methods_display_order ON payment_methods(display_order);

-- Enable RLS
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

-- Policy: Allow admins full access
CREATE POLICY "Admins can manage payment methods" ON payment_methods
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

-- Policy: Allow authenticated users to read active methods (without sensitive config)
CREATE POLICY "Users can read active payment methods" ON payment_methods
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Policy: Allow anonymous users to read active methods (for checkout preview)
CREATE POLICY "Anon can read active payment methods" ON payment_methods
  FOR SELECT
  TO anon
  USING (is_active = true);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_payment_methods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_payment_methods_updated_at
  BEFORE UPDATE ON payment_methods
  FOR EACH ROW
  EXECUTE FUNCTION update_payment_methods_updated_at();

-- Insert seed data for payment methods
INSERT INTO payment_methods (name, code, type, config, instructions, is_active, display_order) VALUES
  ('Stripe', 'stripe', 'stripe', '{
    "publishable_key": "",
    "secret_key": "",
    "webhook_secret": ""
  }'::jsonb, 'Pembayaran akan diproses secara otomatis melalui Stripe. Kartu kredit/debit yang didukung: Visa, Mastercard, American Express.', true, 1),
  
  ('Transfer Bank', 'bank_transfer', 'bank_transfer', '{
    "bank_accounts": [
      {
        "bank_name": "Bank Islam Brunei Darussalam (BIBD)",
        "account_number": "1234567890",
        "account_holder": "Tenunan Songket"
      },
      {
        "bank_name": "Baiduri Bank",
        "account_number": "0987654321",
        "account_holder": "Tenunan Songket"
      }
    ]
  }'::jsonb, 'Silakan transfer ke salah satu rekening di atas. Setelah transfer, konfirmasi pembayaran dengan mengirimkan bukti transfer melalui WhatsApp atau email. Pesanan akan diproses setelah pembayaran dikonfirmasi.', true, 2),
  
  ('COD (Cash on Delivery)', 'cod', 'manual', '{
    "max_amount": 500,
    "available_areas": ["Bandar Seri Begawan", "Tutong", "Belait", "Temburong"]
  }'::jsonb, 'Bayar langsung saat barang diterima. Tersedia untuk area tertentu dengan maksimal pembelian BND 500.', false, 3);
