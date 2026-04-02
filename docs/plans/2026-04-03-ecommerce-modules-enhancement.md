# E-Commerce Modules Enhancement Plan

**Project:** Tenunan Songket Online Store  
**Date:** 2026-04-03  
**Version:** 1.0  
**Status:** Planning

---

## Executive Summary

Plan lengkap untuk mengimplementasikan dan meningkatkan modul-modul e-commerce agar toko online menjadi lebih profesional dan modern. Berdasarkan audit, beberapa modul sudah ada (Reviews, Wishlist), beberapa partial (Variants, Recommendations, Order Tracking), dan beberapa belum ada (Loyalty Program, Blog).

### Module Status Overview

| # | Module | Current Status | Priority | Effort |
|---|--------|---------------|----------|--------|
| 3 | Product Variants | Partial (UI only) | HIGH | Large |
| 5 | Loyalty Program & Points | Missing | MEDIUM | Large |
| 7 | Product Recommendations | Partial (basic) | MEDIUM | Medium |
| 9 | Order Tracking | Partial (manual) | HIGH | Medium |
| 12 | Blog & Content | Missing | LOW | Medium |

### Implementation Timeline

| Phase | Duration | Modules |
|-------|----------|---------|
| Phase 1 | 2-3 minggu | Product Variants (backend + frontend) |
| Phase 2 | 1-2 minggu | Order Tracking Enhancement |
| Phase 3 | 2-3 minggu | Loyalty Program & Points |
| Phase 4 | 1-2 minggu | Product Recommendations Enhancement |
| Phase 5 | 2 minggu | Blog & Content CMS |

**Total Estimated:** 8-12 minggu

---

## Phase 1: Product Variants System

### Current State
- UI selector exists di `ProductActions.tsx` dengan hardcoded variants
- Tidak ada database tables untuk variants
- Variant tidak disimpan ke cart atau order
- Tidak ada stock per variant

### Goals
- Full variant system dengan database support
- Multiple variant types (size, color, material, motif)
- Variant-specific pricing dan stock
- Visual swatches untuk color/material
- Variant selection terintegrasi dengan cart & order

### Database Schema

```sql
-- Migration: create_product_variants_tables

-- Variant Types (e.g., Size, Color, Motif)
CREATE TABLE variant_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,           -- "Ukuran", "Warna", "Motif"
  slug VARCHAR(100) NOT NULL UNIQUE,    -- "ukuran", "warna", "motif"
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Variant Options (e.g., S, M, L, XL for Size)
CREATE TABLE variant_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_type_id UUID NOT NULL REFERENCES variant_types(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,           -- "Small", "Medium", "Large"
  value VARCHAR(100),                   -- "S", "M", "L" (for display)
  color_hex VARCHAR(7),                 -- "#FF5733" (for color swatches)
  image_url TEXT,                       -- For material/motif swatches
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Variants (combinations for a specific product)
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku VARCHAR(100),                     -- Unique SKU per variant
  price DECIMAL(12,2),                  -- Override product price (null = use product price)
  sale_price DECIMAL(12,2),             -- Override sale price
  stock INT DEFAULT 0,
  weight DECIMAL(8,2),                  -- Override weight if different
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Variant Combination Values (links variant to its options)
CREATE TABLE product_variant_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  variant_option_id UUID NOT NULL REFERENCES variant_options(id) ON DELETE CASCADE,
  UNIQUE(product_variant_id, variant_option_id)
);

-- Product to Variant Types (which variant types apply to which product)
CREATE TABLE product_variant_types (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_type_id UUID NOT NULL REFERENCES variant_types(id) ON DELETE CASCADE,
  display_order INT DEFAULT 0,
  PRIMARY KEY (product_id, variant_type_id)
);

-- Indexes
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
CREATE INDEX idx_variant_options_type ON variant_options(variant_type_id);
CREATE INDEX idx_product_variant_values_variant ON product_variant_values(product_variant_id);

-- Update cart_items to support variants
ALTER TABLE cart_items ADD COLUMN variant_id UUID REFERENCES product_variants(id);

-- Update order_items to support variants  
ALTER TABLE order_items ADD COLUMN variant_id UUID REFERENCES product_variants(id);
ALTER TABLE order_items ADD COLUMN variant_info JSONB; -- Store variant details snapshot
```

### Seed Data (Example)

```sql
-- Variant Types
INSERT INTO variant_types (name, slug, display_order) VALUES
('Ukuran', 'ukuran', 1),
('Motif', 'motif', 2),
('Warna Benang', 'warna-benang', 3);

-- Variant Options - Ukuran
INSERT INTO variant_options (variant_type_id, name, value, display_order)
SELECT id, 'Kecil (2m x 1m)', 'S', 1 FROM variant_types WHERE slug = 'ukuran'
UNION ALL
SELECT id, 'Sedang (2.5m x 1.2m)', 'M', 2 FROM variant_types WHERE slug = 'ukuran'
UNION ALL
SELECT id, 'Besar (3m x 1.5m)', 'L', 3 FROM variant_types WHERE slug = 'ukuran';

-- Variant Options - Motif (for Songket)
INSERT INTO variant_options (variant_type_id, name, value, display_order)
SELECT id, 'Original', 'original', 1 FROM variant_types WHERE slug = 'motif'
UNION ALL
SELECT id, 'Lepus', 'lepus', 2 FROM variant_types WHERE slug = 'motif'
UNION ALL
SELECT id, 'Nago Besaung', 'nago-besaung', 3 FROM variant_types WHERE slug = 'motif'
UNION ALL
SELECT id, 'Bungo Mawar', 'bungo-mawar', 4 FROM variant_types WHERE slug = 'motif';

-- Variant Options - Warna Benang
INSERT INTO variant_options (variant_type_id, name, value, color_hex, display_order)
SELECT id, 'Emas', 'emas', '#FFD700', 1 FROM variant_types WHERE slug = 'warna-benang'
UNION ALL
SELECT id, 'Perak', 'perak', '#C0C0C0', 2 FROM variant_types WHERE slug = 'warna-benang'
UNION ALL
SELECT id, 'Merah', 'merah', '#DC143C', 3 FROM variant_types WHERE slug = 'warna-benang'
UNION ALL
SELECT id, 'Hijau', 'hijau', '#228B22', 4 FROM variant_types WHERE slug = 'warna-benang';
```

### Components to Create/Modify

#### New Components

```
src/components/product/
├── VariantSelector.tsx       # Main variant selection UI
├── VariantSwatch.tsx         # Color/image swatch component
├── VariantDropdown.tsx       # Dropdown for size/motif
├── VariantPriceDisplay.tsx   # Shows price based on selected variant
└── VariantStockIndicator.tsx # Shows stock for selected variant

src/components/admin/products/
├── VariantManager.tsx        # Admin UI to manage variants
├── VariantTypeSelector.tsx   # Select which variant types for product
├── VariantCombinationGrid.tsx # Grid to set price/stock per combination
└── BulkVariantEditor.tsx     # Bulk edit prices/stock
```

#### Modify Existing

```
src/components/product/ProductActions.tsx
- Replace hardcoded variants with dynamic VariantSelector
- Pass selected variant to addToCart

src/components/cart/CartItem.tsx
- Display variant info (e.g., "Ukuran: M, Motif: Lepus")
- Show variant price

src/app/(store)/checkout/page.tsx
- Pass variant_id to order creation
- Display variant info in order summary

src/app/admin/products/[id]/edit/page.tsx
- Add VariantManager component
- Enable/disable variant system per product
```

### API Endpoints

```typescript
// src/lib/supabase/variants.ts

// Get variant types (for admin)
getVariantTypes(): Promise<VariantType[]>

// Get variant options for a type
getVariantOptions(typeId: string): Promise<VariantOption[]>

// Get all variants for a product
getProductVariants(productId: string): Promise<ProductVariant[]>

// Get specific variant by option combination
getVariantByCombination(productId: string, optionIds: string[]): Promise<ProductVariant | null>

// Check variant stock
checkVariantStock(variantId: string, quantity: number): Promise<boolean>

// Admin: Create/Update/Delete variants
createProductVariant(data: CreateVariantInput): Promise<ProductVariant>
updateProductVariant(id: string, data: UpdateVariantInput): Promise<ProductVariant>
deleteProductVariant(id: string): Promise<void>

// Admin: Bulk update prices/stock
bulkUpdateVariants(variants: BulkVariantUpdate[]): Promise<void>
```

### TypeScript Types

```typescript
// src/lib/types/variants.ts

export interface VariantType {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
  isActive: boolean;
  options?: VariantOption[];
}

export interface VariantOption {
  id: string;
  variantTypeId: string;
  name: string;
  value: string;
  colorHex?: string;
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku?: string;
  price?: number;
  salePrice?: number;
  stock: number;
  weight?: number;
  isActive: boolean;
  options: VariantOption[]; // The combination of options
}

export interface SelectedVariant {
  variantId: string;
  options: { typeSlug: string; optionId: string; optionName: string }[];
  price: number;
  stock: number;
}
```

### UI/UX Specifications

#### Product Page Variant Selector

```
┌─────────────────────────────────────────────┐
│ Ukuran:                                     │
│ ┌─────┐ ┌─────┐ ┌─────┐                    │
│ │  S  │ │  M  │ │  L  │  <- Size buttons   │
│ └─────┘ └─────┘ └─────┘                    │
│                                             │
│ Motif:                                      │
│ ┌──────────────────────────────────┐       │
│ │ Original                       ▼ │       │
│ └──────────────────────────────────┘       │
│                                             │
│ Warna Benang:                               │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐                    │
│ │ ◉ │ │ ◉ │ │ ◉ │ │ ◉ │  <- Color swatches│
│ │Ems│ │Prk│ │Mrh│ │Hjau│                   │
│ └───┘ └───┘ └───┘ └───┘                    │
│                                             │
│ Harga: Rp 2,500,000                        │
│ Stok: 5 tersedia                           │
│                                             │
│ ┌─────────────────────────────────────┐    │
│ │      Tambah ke Keranjang            │    │
│ └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
```

#### Admin Variant Manager

```
┌─────────────────────────────────────────────────────────────┐
│ Kelola Varian Produk                                        │
├─────────────────────────────────────────────────────────────┤
│ Tipe Varian yang Aktif:                                     │
│ ☑ Ukuran   ☑ Motif   ☐ Warna Benang                        │
├─────────────────────────────────────────────────────────────┤
│ Kombinasi Varian:                                           │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ SKU        │ Ukuran │ Motif    │ Harga    │ Stok │ ⚙ │  │
│ ├────────────┼────────┼──────────┼──────────┼──────┼───┤  │
│ │ SNG-001-S  │ S      │ Original │ 2,000,000│  10  │ ✎ │  │
│ │ SNG-001-M  │ M      │ Original │ 2,500,000│   5  │ ✎ │  │
│ │ SNG-001-L  │ L      │ Original │ 3,000,000│   3  │ ✎ │  │
│ │ SNG-002-S  │ S      │ Lepus    │ 2,200,000│   8  │ ✎ │  │
│ │ ...        │ ...    │ ...      │ ...      │ ...  │   │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ [+ Tambah Kombinasi]  [Bulk Edit]  [Auto-Generate]          │
└─────────────────────────────────────────────────────────────┘
```

### Tasks Checklist

#### Database (Day 1-2)
- [ ] Create migration for variant tables
- [ ] Add variant_id to cart_items
- [ ] Add variant_id and variant_info to order_items
- [ ] Create seed data for variant types
- [ ] Add RLS policies for variants

#### Backend/API (Day 3-5)
- [ ] Create `src/lib/supabase/variants.ts`
- [ ] Create TypeScript types
- [ ] Update cart functions to handle variants
- [ ] Update order creation to save variant info
- [ ] Create admin API for variant management
- [ ] Regenerate Supabase types

#### Frontend - Customer (Day 6-8)
- [ ] Create VariantSelector component
- [ ] Create VariantSwatch component
- [ ] Integrate with ProductActions
- [ ] Update CartItem to show variant
- [ ] Update checkout to pass variant
- [ ] Update order confirmation display

#### Frontend - Admin (Day 9-12)
- [ ] Create VariantManager component
- [ ] Create VariantCombinationGrid
- [ ] Add to product edit page
- [ ] Create bulk edit functionality
- [ ] Add variant types management page

#### Testing (Day 13-14)
- [ ] Test variant selection flow
- [ ] Test cart with variants
- [ ] Test checkout with variants
- [ ] Test admin variant management
- [ ] Test stock validation per variant

---

## Phase 2: Order Tracking Enhancement

### Current State
- Basic tracking dengan `tracking_number` field
- Manual input di admin
- Status steps visualization exists
- Tidak ada integrasi kurir API
- Tidak ada notifikasi ke customer

### Goals
- Integrasi dengan API kurir (JNE, J&T, POS, dll)
- Real-time tracking page untuk customer
- Notifikasi status via WhatsApp/Email
- Estimated delivery time
- Tracking history timeline

### Database Schema

```sql
-- Migration: enhance_order_tracking

-- Shipping Providers Enhancement
ALTER TABLE shipping_providers ADD COLUMN api_code VARCHAR(50);
ALTER TABLE shipping_providers ADD COLUMN api_credentials JSONB;
ALTER TABLE shipping_providers ADD COLUMN tracking_url_template TEXT;
-- e.g., "https://cekresi.com/?noresi={tracking_number}"

-- Order Tracking Events (detailed history)
CREATE TABLE order_tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  shipping_id UUID REFERENCES shippings(id),
  status VARCHAR(50) NOT NULL,        -- "picked_up", "in_transit", "out_for_delivery", "delivered"
  location VARCHAR(255),              -- "Jakarta Hub", "Brunei Customs"
  description TEXT,                   -- "Paket telah sampai di gudang transit"
  event_time TIMESTAMPTZ NOT NULL,
  raw_data JSONB,                     -- Raw response from courier API
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notification Logs
CREATE TABLE tracking_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  notification_type VARCHAR(20) NOT NULL, -- "whatsapp", "email", "sms"
  status VARCHAR(20) NOT NULL,           -- "pending", "sent", "failed"
  message TEXT,
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tracking_events_order ON order_tracking_events(order_id);
CREATE INDEX idx_tracking_events_time ON order_tracking_events(event_time);
CREATE INDEX idx_tracking_notifications_order ON tracking_notifications(order_id);

-- Add estimated delivery to shippings
ALTER TABLE shippings ADD COLUMN estimated_delivery_at TIMESTAMPTZ;
```

### Courier API Integration

#### Supported Couriers

| Courier | API | Region |
|---------|-----|--------|
| RajaOngkir | REST API | Indonesia |
| Shipper | REST API | Indonesia |
| JNE | REST API | Indonesia |
| J&T Express | REST API | SEA |
| POS Malaysia | REST API | Malaysia |
| Brunei Post | Manual | Brunei |

#### API Service Structure

```typescript
// src/lib/shipping/tracking.ts

interface TrackingProvider {
  name: string;
  getTrackingInfo(trackingNumber: string): Promise<TrackingResult>;
  getEstimatedDelivery(origin: string, destination: string, service: string): Promise<Date>;
}

interface TrackingResult {
  trackingNumber: string;
  status: TrackingStatus;
  estimatedDelivery?: Date;
  events: TrackingEvent[];
  rawData: unknown;
}

interface TrackingEvent {
  status: string;
  description: string;
  location?: string;
  timestamp: Date;
}

// Implementations
class RajaOngkirProvider implements TrackingProvider { ... }
class JNEProvider implements TrackingProvider { ... }
class ShipperProvider implements TrackingProvider { ... }

// Factory
function getTrackingProvider(courier: string): TrackingProvider {
  switch (courier.toLowerCase()) {
    case 'jne': return new JNEProvider();
    case 'jnt': return new ShipperProvider();
    default: return new GenericProvider();
  }
}
```

### Components to Create

```
src/components/order/
├── TrackingTimeline.tsx      # Visual timeline of tracking events
├── TrackingMap.tsx           # Map showing package location (optional)
├── DeliveryEstimate.tsx      # Shows estimated delivery date
├── TrackingRefresh.tsx       # Button to refresh tracking
└── TrackingNotification.tsx  # Notification preferences

src/app/(store)/track/
└── [orderNumber]/page.tsx    # Public tracking page

src/app/admin/orders/[id]/
└── tracking/page.tsx         # Admin tracking management
```

### Notification System

```typescript
// src/lib/notifications/tracking.ts

interface TrackingNotificationService {
  sendWhatsApp(phone: string, message: string): Promise<void>;
  sendEmail(email: string, subject: string, body: string): Promise<void>;
  sendSMS(phone: string, message: string): Promise<void>;
}

// Templates
const NOTIFICATION_TEMPLATES = {
  shipped: {
    whatsapp: "Pesanan #{orderNumber} telah dikirim!\n\nNo Resi: {trackingNumber}\nKurir: {courier}\n\nLacak: {trackingUrl}",
    email: { subject: "Pesanan Anda Telah Dikirim", template: "shipped" }
  },
  out_for_delivery: {
    whatsapp: "Pesanan #{orderNumber} sedang dalam perjalanan ke alamat Anda hari ini!",
    email: { subject: "Pesanan Dalam Pengiriman", template: "out_for_delivery" }
  },
  delivered: {
    whatsapp: "Pesanan #{orderNumber} telah sampai! Terima kasih telah berbelanja.",
    email: { subject: "Pesanan Telah Diterima", template: "delivered" }
  }
};
```

### UI Specifications

#### Customer Tracking Page

```
┌─────────────────────────────────────────────────────────────┐
│ 📦 Lacak Pesanan                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Order: #TS-20260403-001                                     │
│ Resi: JNE123456789                                          │
│ Kurir: JNE - REG                                            │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Estimasi Tiba: Jumat, 5 April 2026                      ││
│ │ Status: Dalam Perjalanan                                ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Timeline:                                                   │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ ● 03 Apr 14:30 - Paket dalam perjalanan ke kota tujuan  ││
│ │ │               Jakarta Hub → Bandar Seri Begawan       ││
│ │ │                                                       ││
│ │ ● 03 Apr 10:15 - Paket telah sampai di gudang transit   ││
│ │ │               Jakarta Sorting Center                  ││
│ │ │                                                       ││
│ │ ● 02 Apr 18:00 - Paket telah dipickup oleh kurir        ││
│ │ │               Tangerang                               ││
│ │ │                                                       ││
│ │ ○ 02 Apr 15:30 - Pesanan dikirim                        ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ [🔄 Refresh Tracking]                                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Tasks Checklist

#### Database (Day 1)
- [ ] Create order_tracking_events table
- [ ] Create tracking_notifications table
- [ ] Add columns to shippings table
- [ ] Update shipping_providers with API info

#### Backend (Day 2-4)
- [ ] Create tracking provider interface
- [ ] Implement RajaOngkir provider
- [ ] Create tracking sync service
- [ ] Create notification service (WhatsApp/Email)
- [ ] Create cron job for auto-refresh tracking

#### Frontend - Customer (Day 5-6)
- [ ] Create TrackingTimeline component
- [ ] Create public tracking page
- [ ] Add tracking link to order detail
- [ ] Add notification preferences

#### Frontend - Admin (Day 7)
- [ ] Add tracking management to order detail
- [ ] Create manual event entry
- [ ] Show notification history

#### Integrations (Day 8-10)
- [ ] WhatsApp Business API setup (or Twilio)
- [ ] Email templates (SendGrid/Resend)
- [ ] Test with real courier APIs

---

## Phase 3: Loyalty Program & Points

### Goals
- Earn points dari setiap pembelian
- Points dapat ditukar dengan diskon
- Tier levels dengan benefits berbeda
- Birthday rewards
- Referral points
- Points expiry system

### Database Schema

```sql
-- Migration: create_loyalty_program

-- Loyalty Tiers
CREATE TABLE loyalty_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,            -- "Bronze", "Silver", "Gold", "Platinum"
  slug VARCHAR(50) NOT NULL UNIQUE,
  min_points INT NOT NULL,              -- Minimum lifetime points to reach tier
  points_multiplier DECIMAL(3,2) DEFAULT 1.0, -- 1.5x points for Gold
  discount_percentage DECIMAL(5,2) DEFAULT 0, -- Additional discount
  benefits JSONB,                       -- List of benefits
  badge_image_url TEXT,
  color_hex VARCHAR(7),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Loyalty Profiles
CREATE TABLE loyalty_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  current_tier_id UUID REFERENCES loyalty_tiers(id),
  current_points INT DEFAULT 0,         -- Redeemable points
  lifetime_points INT DEFAULT 0,        -- Total ever earned (for tier calculation)
  referral_code VARCHAR(20) UNIQUE,     -- User's referral code
  referred_by UUID REFERENCES profiles(id), -- Who referred this user
  birthday DATE,
  birthday_reward_claimed_year INT,     -- Last year birthday reward claimed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Points Transactions
CREATE TABLE loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,            -- "earn", "redeem", "expire", "bonus", "referral"
  points INT NOT NULL,                  -- Positive for earn, negative for redeem
  balance_after INT NOT NULL,           -- Points balance after transaction
  description TEXT,
  order_id UUID REFERENCES orders(id),  -- If from purchase
  coupon_id UUID REFERENCES coupons(id),-- If redeemed for coupon
  expires_at TIMESTAMPTZ,               -- When these points expire
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Points Earning Rules
CREATE TABLE loyalty_earning_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  rule_type VARCHAR(30) NOT NULL,       -- "purchase", "review", "referral", "birthday", "signup"
  points_value INT,                     -- Fixed points
  points_percentage DECIMAL(5,2),       -- % of order total as points
  min_order_amount DECIMAL(12,2),       -- Minimum order to earn
  max_points_per_order INT,             -- Cap points per order
  conditions JSONB,                     -- Additional conditions
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Points Redemption Rules
CREATE TABLE loyalty_redemption_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  points_required INT NOT NULL,
  reward_type VARCHAR(30) NOT NULL,     -- "discount_fixed", "discount_percentage", "free_shipping"
  reward_value DECIMAL(12,2) NOT NULL,  -- Amount or percentage
  min_order_amount DECIMAL(12,2),
  max_discount DECIMAL(12,2),
  conditions JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_loyalty_profiles_user ON loyalty_profiles(user_id);
CREATE INDEX idx_loyalty_transactions_user ON loyalty_transactions(user_id);
CREATE INDEX idx_loyalty_transactions_type ON loyalty_transactions(type);
CREATE INDEX idx_loyalty_transactions_expires ON loyalty_transactions(expires_at) WHERE expires_at IS NOT NULL;

-- Generate referral code function
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS VARCHAR(20) AS $$
DECLARE
  chars VARCHAR(36) := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result VARCHAR(20) := '';
  i INT;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * 36 + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create loyalty profile on user signup
CREATE OR REPLACE FUNCTION create_loyalty_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO loyalty_profiles (user_id, referral_code, current_tier_id)
  SELECT NEW.id, generate_referral_code(), lt.id
  FROM loyalty_tiers lt
  WHERE lt.min_points = 0
  LIMIT 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_created
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION create_loyalty_profile();
```

### Seed Data

```sql
-- Loyalty Tiers
INSERT INTO loyalty_tiers (name, slug, min_points, points_multiplier, discount_percentage, benefits, color_hex, display_order) VALUES
('Bronze', 'bronze', 0, 1.0, 0, '["Akses member area", "Newsletter eksklusif"]', '#CD7F32', 1),
('Silver', 'silver', 5000, 1.25, 5, '["Semua benefit Bronze", "Diskon 5% semua produk", "Early access sale", "Birthday reward"]', '#C0C0C0', 2),
('Gold', 'gold', 15000, 1.5, 10, '["Semua benefit Silver", "Diskon 10% semua produk", "Free shipping", "Priority support"]', '#FFD700', 3),
('Platinum', 'platinum', 50000, 2.0, 15, '["Semua benefit Gold", "Diskon 15% semua produk", "Exclusive products", "Personal stylist"]', '#E5E4E2', 4);

-- Earning Rules
INSERT INTO loyalty_earning_rules (name, rule_type, points_percentage, min_order_amount, is_active) VALUES
('Poin Pembelian', 'purchase', 5, 100000, true); -- 5% of order as points

INSERT INTO loyalty_earning_rules (name, rule_type, points_value, is_active) VALUES
('Bonus Pendaftaran', 'signup', 500, true),
('Review Produk', 'review', 100, true),
('Bonus Referral', 'referral', 1000, true),
('Hadiah Ulang Tahun', 'birthday', 500, true);

-- Redemption Rules
INSERT INTO loyalty_redemption_rules (name, points_required, reward_type, reward_value, min_order_amount) VALUES
('Diskon Rp 50,000', 1000, 'discount_fixed', 50000, 200000),
('Diskon Rp 100,000', 2000, 'discount_fixed', 100000, 400000),
('Diskon 10%', 1500, 'discount_percentage', 10, 300000),
('Gratis Ongkir', 500, 'free_shipping', 0, 100000);
```

### Components to Create

```
src/components/loyalty/
├── PointsBalance.tsx         # Current points display
├── TierBadge.tsx             # Tier badge with icon
├── TierProgress.tsx          # Progress bar to next tier
├── PointsHistory.tsx         # Transaction history
├── RedeemPoints.tsx          # Redemption UI in checkout
├── ReferralCard.tsx          # Share referral code
├── EarningRules.tsx          # How to earn points
└── BirthdayReward.tsx        # Birthday claim component

src/app/(store)/account/
├── loyalty/page.tsx          # Main loyalty dashboard
└── referrals/page.tsx        # Referral tracking

src/app/admin/
├── loyalty/page.tsx          # Loyalty program management
├── loyalty/tiers/page.tsx    # Manage tiers
├── loyalty/rules/page.tsx    # Manage earning/redemption rules
└── loyalty/members/page.tsx  # View all members and points
```

### API/Services

```typescript
// src/lib/supabase/loyalty.ts

// User functions
getLoyaltyProfile(userId: string): Promise<LoyaltyProfile>
getPointsBalance(userId: string): Promise<number>
getPointsHistory(userId: string, options: PaginationOptions): Promise<LoyaltyTransaction[]>
getReferralStats(userId: string): Promise<ReferralStats>

// Points operations
earnPoints(userId: string, type: EarnType, orderId?: string): Promise<void>
redeemPoints(userId: string, ruleId: string): Promise<RedemptionResult>
processPointsExpiry(): Promise<void> // Cron job

// Checkout integration
getAvailableRedemptions(userId: string, orderTotal: number): Promise<RedemptionOption[]>
applyPointsRedemption(userId: string, redemptionId: string, orderId: string): Promise<void>

// Admin functions
getAllMembers(options: FilterOptions): Promise<LoyaltyMember[]>
adjustPoints(userId: string, points: number, reason: string): Promise<void>
updateTierRules(tierId: string, rules: TierRules): Promise<void>
```

### UI Specifications

#### Account Loyalty Page

```
┌─────────────────────────────────────────────────────────────┐
│ 🏆 Program Loyalitas                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │  🥇 GOLD MEMBER                                         ││
│ │                                                         ││
│ │  Poin Anda: 12,500                                      ││
│ │                                                         ││
│ │  ████████████████░░░░░░  15,000 poin ke Platinum       ││
│ │  83% tercapai                                           ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Benefits Anda:                                              │
│ ✓ Diskon 10% semua produk                                   │
│ ✓ Gratis ongkir                                             │
│ ✓ Priority support                                          │
│                                                             │
│ ┌─────────────────┬─────────────────┐                      │
│ │ Tukar Poin      │ Ajak Teman      │                      │
│ │ [Lihat Hadiah]  │ [Bagikan Link]  │                      │
│ └─────────────────┴─────────────────┘                      │
│                                                             │
│ Riwayat Poin:                                               │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ + 250 pts  │ Pembelian #TS-001     │ 3 Apr 2026         ││
│ │ - 1000 pts │ Tukar diskon Rp50,000 │ 1 Apr 2026         ││
│ │ + 100 pts  │ Review produk         │ 28 Mar 2026        ││
│ │ + 500 pts  │ Referral bonus        │ 25 Mar 2026        ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

#### Checkout Points Redemption

```
┌─────────────────────────────────────────────────────────────┐
│ 🎁 Tukar Poin Anda                                          │
│                                                             │
│ Poin tersedia: 12,500                                       │
│                                                             │
│ ○ Diskon Rp 50,000 (1,000 poin)                            │
│ ● Diskon Rp 100,000 (2,000 poin)  ← Selected               │
│ ○ Diskon 10% (1,500 poin)                                   │
│ ○ Gratis Ongkir (500 poin)                                  │
│                                                             │
│ [Terapkan]                                                  │
└─────────────────────────────────────────────────────────────┘
```

### Tasks Checklist

#### Database (Day 1-2)
- [ ] Create all loyalty tables
- [ ] Create seed data for tiers and rules
- [ ] Add trigger for profile creation
- [ ] Add RLS policies

#### Backend (Day 3-6)
- [ ] Create loyalty service (`src/lib/supabase/loyalty.ts`)
- [ ] Implement points earning on order completion
- [ ] Implement points redemption
- [ ] Create referral system
- [ ] Create birthday reward claim
- [ ] Create points expiry cron job

#### Frontend - Customer (Day 7-10)
- [ ] Create loyalty dashboard page
- [ ] Create PointsBalance component
- [ ] Create TierProgress component
- [ ] Create PointsHistory component
- [ ] Add redemption to checkout
- [ ] Create referral sharing page

#### Frontend - Admin (Day 11-13)
- [ ] Create admin loyalty dashboard
- [ ] Create tier management page
- [ ] Create rules management
- [ ] Create member list with search

#### Testing (Day 14)
- [ ] Test points earning flow
- [ ] Test redemption flow
- [ ] Test tier upgrades
- [ ] Test referral system

---

## Phase 4: Product Recommendations Enhancement

### Current State
- Basic "Produk Serupa" by same category
- No personalization
- No "frequently bought together"

### Goals
- "Sering Dibeli Bersamaan" based on order data
- "Pelanggan Juga Melihat" based on views
- Recently viewed products
- Personalized homepage recommendations
- Cross-sell in cart page

### Database Schema

```sql
-- Migration: enhance_recommendations

-- Product Views Tracking
CREATE TABLE product_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  session_id VARCHAR(100),             -- For anonymous users
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product Associations (pre-computed)
CREATE TABLE product_associations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  associated_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  association_type VARCHAR(30) NOT NULL, -- "bought_together", "viewed_together", "similar"
  score DECIMAL(5,4) DEFAULT 0,          -- Association strength (0-1)
  purchase_count INT DEFAULT 0,          -- Times bought together
  view_count INT DEFAULT 0,              -- Times viewed in same session
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, associated_product_id, association_type)
);

-- User Preferences (for personalization)
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_preferences JSONB DEFAULT '{}', -- {"category_id": score}
  price_range_preference JSONB,            -- {"min": 100000, "max": 500000}
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX idx_product_views_product ON product_views(product_id);
CREATE INDEX idx_product_views_user ON product_views(user_id);
CREATE INDEX idx_product_views_session ON product_views(session_id);
CREATE INDEX idx_product_views_time ON product_views(viewed_at);
CREATE INDEX idx_product_associations_product ON product_associations(product_id);
CREATE INDEX idx_product_associations_type ON product_associations(association_type);

-- Function to update associations (run periodically)
CREATE OR REPLACE FUNCTION update_product_associations()
RETURNS void AS $$
BEGIN
  -- Update "bought_together" based on order items
  INSERT INTO product_associations (product_id, associated_product_id, association_type, purchase_count, score)
  SELECT 
    oi1.product_id,
    oi2.product_id,
    'bought_together',
    COUNT(*),
    COUNT(*)::decimal / GREATEST(
      (SELECT COUNT(DISTINCT order_id) FROM order_items WHERE product_id = oi1.product_id),
      1
    )
  FROM order_items oi1
  JOIN order_items oi2 ON oi1.order_id = oi2.order_id AND oi1.product_id != oi2.product_id
  GROUP BY oi1.product_id, oi2.product_id
  ON CONFLICT (product_id, associated_product_id, association_type)
  DO UPDATE SET 
    purchase_count = EXCLUDED.purchase_count,
    score = EXCLUDED.score,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
```

### Components to Create

```
src/components/recommendations/
├── FrequentlyBoughtTogether.tsx  # "Sering Dibeli Bersamaan"
├── CustomersAlsoViewed.tsx       # "Pelanggan Juga Melihat"
├── RecentlyViewed.tsx            # "Baru Dilihat"
├── PersonalizedPicks.tsx         # "Pilihan Untuk Anda"
├── CartRecommendations.tsx       # Cross-sell di cart
└── RecommendationCarousel.tsx    # Reusable carousel

src/hooks/
├── useRecentlyViewed.ts          # LocalStorage hook
└── useTrackProductView.ts        # Track view event
```

### API/Services

```typescript
// src/lib/recommendations.ts

// Track product view
trackProductView(productId: string, userId?: string, sessionId?: string): Promise<void>

// Get recommendations
getFrequentlyBoughtTogether(productId: string, limit?: number): Promise<Product[]>
getCustomersAlsoViewed(productId: string, limit?: number): Promise<Product[]>
getRelatedByCategory(productId: string, limit?: number): Promise<Product[]>
getPersonalizedRecommendations(userId: string, limit?: number): Promise<Product[]>
getCartRecommendations(productIds: string[], limit?: number): Promise<Product[]>

// Recently viewed (client-side)
getRecentlyViewed(): Product[] // From localStorage
addToRecentlyViewed(product: Product): void
```

### UI Specifications

#### Product Page Recommendations

```
┌─────────────────────────────────────────────────────────────┐
│ Sering Dibeli Bersamaan                                     │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐               │
│ │  Img   │ │  Img   │ │  Img   │ │  Img   │               │
│ │Product1│ │Product2│ │Product3│ │Product4│               │
│ │Rp xxx  │ │Rp xxx  │ │Rp xxx  │ │Rp xxx  │               │
│ └────────┘ └────────┘ └────────┘ └────────┘               │
│                                                             │
│ [Tambah Semua ke Keranjang - Rp xxx]                       │
└─────────────────────────────────────────────────────────────┘
```

#### Cart Cross-sell

```
┌─────────────────────────────────────────────────────────────┐
│ Lengkapi Pembelian Anda                                     │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ [Img] Selendang Songket     Rp 500,000    [+ Tambah]    ││
│ │ [Img] Kotak Hadiah Premium  Rp 150,000    [+ Tambah]    ││
│ └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

### Tasks Checklist

#### Database (Day 1)
- [ ] Create product_views table
- [ ] Create product_associations table
- [ ] Create user_preferences table
- [ ] Create association update function

#### Backend (Day 2-3)
- [ ] Create tracking service
- [ ] Create recommendation queries
- [ ] Set up cron job for association updates
- [ ] Create API endpoints

#### Frontend (Day 4-6)
- [ ] Create RecommendationCarousel component
- [ ] Add FrequentlyBoughtTogether to product page
- [ ] Add RecentlyViewed component
- [ ] Add CartRecommendations to cart page
- [ ] Implement view tracking hook

#### Analytics (Day 7)
- [ ] Track recommendation clicks
- [ ] Track "add all to cart" usage
- [ ] Create A/B testing setup (optional)

---

## Phase 5: Blog & Content CMS

### Goals
- Full blog system dengan categories dan tags
- Rich text editor (MDX support)
- SEO-optimized articles
- Related products in articles
- Admin content management

### Database Schema

```sql
-- Migration: create_blog_system

-- Blog Categories
CREATE TABLE blog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Tags
CREATE TABLE blog_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL,
  slug VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog Posts
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT,                         -- Short summary
  content TEXT NOT NULL,                -- MDX content
  featured_image_url TEXT,
  category_id UUID REFERENCES blog_categories(id),
  author_id UUID REFERENCES profiles(id),
  status VARCHAR(20) DEFAULT 'draft',   -- "draft", "published", "archived"
  published_at TIMESTAMPTZ,
  meta_title VARCHAR(255),
  meta_description TEXT,
  view_count INT DEFAULT 0,
  reading_time_minutes INT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Post Tags (many-to-many)
CREATE TABLE blog_post_tags (
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES blog_tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

-- Related Products in Posts
CREATE TABLE blog_post_products (
  post_id UUID NOT NULL REFERENCES blog_posts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  display_order INT DEFAULT 0,
  PRIMARY KEY (post_id, product_id)
);

-- Indexes
CREATE INDEX idx_blog_posts_status ON blog_posts(status);
CREATE INDEX idx_blog_posts_category ON blog_posts(category_id);
CREATE INDEX idx_blog_posts_published ON blog_posts(published_at);
CREATE INDEX idx_blog_posts_featured ON blog_posts(is_featured) WHERE is_featured = true;
```

### Seed Data

```sql
-- Blog Categories
INSERT INTO blog_categories (name, slug, description, display_order) VALUES
('Panduan Pemilihan', 'panduan-pemilihan', 'Tips memilih kain songket yang tepat', 1),
('Cara Perawatan', 'cara-perawatan', 'Panduan merawat kain tenunan', 2),
('Sejarah & Budaya', 'sejarah-budaya', 'Artikel tentang sejarah dan budaya tenun', 3),
('Inspirasi Gaya', 'inspirasi-gaya', 'Ide pemakaian kain songket', 4),
('Behind The Scenes', 'behind-the-scenes', 'Proses pembuatan kain tenunan', 5);

-- Blog Tags
INSERT INTO blog_tags (name, slug) VALUES
('songket', 'songket'),
('tenunan', 'tenunan'),
('perkahwinan', 'perkahwinan'),
('hari raya', 'hari-raya'),
('tips', 'tips'),
('tutorial', 'tutorial'),
('tradisi', 'tradisi'),
('melayu', 'melayu');
```

### Components to Create

```
src/components/blog/
├── BlogCard.tsx              # Blog post card
├── BlogGrid.tsx              # Grid of posts
├── BlogSidebar.tsx           # Categories, tags, recent posts
├── BlogContent.tsx           # MDX renderer
├── RelatedProducts.tsx       # Product carousel in post
├── ShareButtons.tsx          # Social share buttons
├── AuthorCard.tsx            # Author info
├── TableOfContents.tsx       # Auto-generated TOC
└── ReadingProgress.tsx       # Reading progress bar

src/app/(store)/blog/
├── page.tsx                  # Blog listing
├── [slug]/page.tsx           # Single post
└── category/[slug]/page.tsx  # Category archive

src/app/admin/blog/
├── page.tsx                  # Posts list
├── new/page.tsx              # Create post
├── [id]/edit/page.tsx        # Edit post
├── categories/page.tsx       # Manage categories
└── tags/page.tsx             # Manage tags
```

### Rich Text Editor

```typescript
// Using @tiptap/react for rich text editing

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'

// Custom extensions
import ProductEmbed from './extensions/ProductEmbed'
import YouTubeEmbed from './extensions/YouTubeEmbed'
```

### UI Specifications

#### Blog Listing Page

```
┌─────────────────────────────────────────────────────────────┐
│ 📚 Blog & Artikel                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Featured Post:                                              │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ [Large Featured Image]                                  ││
│ │ Cara Memilih Kain Songket untuk Perkahwinan             ││
│ │ Tips lengkap memilih songket yang tepat...              ││
│ │ 5 min read | 2 Apr 2026 | Panduan Pemilihan             ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ Kategori: [Semua] [Panduan] [Perawatan] [Sejarah] [Gaya]   │
│                                                             │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│ │ [Image]      │ │ [Image]      │ │ [Image]      │        │
│ │ Title...     │ │ Title...     │ │ Title...     │        │
│ │ Excerpt...   │ │ Excerpt...   │ │ Excerpt...   │        │
│ │ 3 min | Date │ │ 4 min | Date │ │ 2 min | Date │        │
│ └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                             │
│ [Load More]                                                 │
└─────────────────────────────────────────────────────────────┘
```

#### Single Post Page

```
┌─────────────────────────────────────────────────────────────┐
│ ← Kembali ke Blog                                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ Panduan Pemilihan                                           │
│ # Cara Memilih Kain Songket untuk Perkahwinan              │
│                                                             │
│ [Author Avatar] Nama Author | 5 April 2026 | 5 min read    │
│                                                             │
│ [Featured Image - Full Width]                               │
│                                                             │
│ ┌───────────┐                                              │
│ │ Daftar Isi│  ┌──────────────────────────────────────┐   │
│ │ 1. Intro  │  │ Article content here...               │   │
│ │ 2. Tips   │  │                                       │   │
│ │ 3. Motif  │  │ ## Heading                            │   │
│ │ 4. Warna  │  │ Paragraph text...                     │   │
│ └───────────┘  │                                       │   │
│                │ [Product Embed - Songket XYZ]          │   │
│                │                                       │   │
│                └──────────────────────────────────────┘   │
│                                                             │
│ Produk Terkait:                                             │
│ ┌────────┐ ┌────────┐ ┌────────┐                          │
│ │Product1│ │Product2│ │Product3│                          │
│ └────────┘ └────────┘ └────────┘                          │
│                                                             │
│ Tags: #songket #perkahwinan #tips                          │
│                                                             │
│ Share: [FB] [WA] [Twitter] [Copy Link]                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### SEO Considerations

```typescript
// generateMetadata for blog posts
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      images: [post.featuredImageUrl],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.featuredImageUrl],
    },
  };
}

// JSON-LD for articles
const articleJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: post.title,
  description: post.excerpt,
  image: post.featuredImageUrl,
  datePublished: post.publishedAt,
  dateModified: post.updatedAt,
  author: {
    '@type': 'Person',
    name: post.author.name,
  },
  publisher: {
    '@type': 'Organization',
    name: 'Tenunan Songket',
    logo: { '@type': 'ImageObject', url: '/logo.png' },
  },
};
```

### Tasks Checklist

#### Database (Day 1-2)
- [ ] Create blog tables
- [ ] Create seed data for categories
- [ ] Add RLS policies

#### Backend (Day 3-4)
- [ ] Create blog service (`src/lib/supabase/blog.ts`)
- [ ] Create API for posts CRUD
- [ ] Create view counting
- [ ] Create sitemap for blog posts

#### Frontend - Public (Day 5-7)
- [ ] Create blog listing page
- [ ] Create single post page
- [ ] Create category archive
- [ ] Add BlogContent (MDX renderer)
- [ ] Add related products component
- [ ] Add share buttons
- [ ] Add reading progress bar

#### Frontend - Admin (Day 8-10)
- [ ] Create posts list page
- [ ] Create post editor with TipTap
- [ ] Create image upload
- [ ] Create product embed feature
- [ ] Create categories management
- [ ] Create tags management

#### SEO (Day 11)
- [ ] Add generateMetadata
- [ ] Add JSON-LD for articles
- [ ] Add to sitemap.ts
- [ ] Add canonical URLs

---

## Technical Requirements

### Dependencies to Install

```bash
# Phase 1 - Variants
# No new deps needed

# Phase 2 - Order Tracking
npm install @upstash/qstash  # For cron jobs
npm install resend           # For email notifications
# Or use existing email service

# Phase 3 - Loyalty
# No new deps needed

# Phase 4 - Recommendations
# No new deps needed

# Phase 5 - Blog
npm install @tiptap/react @tiptap/starter-kit
npm install @tiptap/extension-image @tiptap/extension-link
npm install @tiptap/extension-placeholder @tiptap/extension-youtube
npm install gray-matter       # For MDX frontmatter (optional)
npm install reading-time      # Calculate reading time
```

### Environment Variables

```env
# Phase 2 - Order Tracking
RAJAONGKIR_API_KEY=xxx
SHIPPER_API_KEY=xxx
WHATSAPP_API_KEY=xxx
TWILIO_ACCOUNT_SID=xxx
TWILIO_AUTH_TOKEN=xxx

# Phase 3 - Loyalty (if using external rewards)
# Usually no external deps

# Phase 5 - Blog (for image upload)
# Already using Supabase Storage
```

### Supabase Edge Functions Needed

```
supabase/functions/
├── update-product-associations/  # Cron: Update recommendation associations
├── process-points-expiry/        # Cron: Expire old points
├── sync-tracking-status/         # Cron: Fetch tracking from couriers
└── send-tracking-notification/   # Webhook: Send notifications
```

### Cron Jobs Schedule

| Function | Schedule | Description |
|----------|----------|-------------|
| update-product-associations | Daily 2 AM | Recalculate product associations |
| process-points-expiry | Daily 1 AM | Expire old loyalty points |
| sync-tracking-status | Every 4 hours | Fetch tracking updates from couriers |

---

## Risk Assessment

### High Risk
- **Courier API Integration**: APIs may have rate limits, downtime, or change
  - Mitigation: Build fallback to manual tracking, cache responses
  
- **Points System Abuse**: Users may try to game referral/points
  - Mitigation: Add verification, rate limits, fraud detection

### Medium Risk
- **Variant Complexity**: Many variants can slow down pages
  - Mitigation: Lazy load variants, pagination
  
- **Blog Content Quality**: Need consistent content creation
  - Mitigation: Plan content calendar, consider guest posts

### Low Risk
- **Recommendation Cold Start**: New products have no data
  - Mitigation: Fall back to category-based recommendations

---

## Success Metrics

### Phase 1 - Variants
- [ ] 100% products can have variants configured
- [ ] Cart/order correctly saves variant info
- [ ] Admin can manage variants efficiently

### Phase 2 - Order Tracking
- [ ] 80%+ orders have tracking auto-updated
- [ ] Customer tracking page load time <2s
- [ ] Notification delivery rate >95%

### Phase 3 - Loyalty
- [ ] 50%+ registered users enrolled in program
- [ ] 20%+ checkouts use points redemption
- [ ] Referral system generates 10%+ new users

### Phase 4 - Recommendations
- [ ] "Bought together" CTR >5%
- [ ] Cart recommendations add 10%+ to AOV
- [ ] Recommendation sections load <500ms

### Phase 5 - Blog
- [ ] 10+ published articles in first month
- [ ] Blog traffic >5% of total site traffic
- [ ] Product click-through from blog >3%

---

## Appendix

### A. File Structure After Implementation

```
src/
├── app/
│   ├── (store)/
│   │   ├── account/
│   │   │   ├── loyalty/page.tsx        # NEW
│   │   │   └── referrals/page.tsx      # NEW
│   │   ├── blog/
│   │   │   ├── page.tsx                # NEW
│   │   │   ├── [slug]/page.tsx         # NEW
│   │   │   └── category/[slug]/page.tsx # NEW
│   │   └── track/
│   │       └── [orderNumber]/page.tsx  # NEW
│   └── admin/
│       ├── blog/
│       │   ├── page.tsx                # NEW
│       │   ├── new/page.tsx            # NEW
│       │   ├── [id]/edit/page.tsx      # NEW
│       │   └── categories/page.tsx     # NEW
│       └── loyalty/
│           ├── page.tsx                # NEW
│           ├── tiers/page.tsx          # NEW
│           └── rules/page.tsx          # NEW
├── components/
│   ├── product/
│   │   ├── VariantSelector.tsx         # NEW
│   │   └── VariantSwatch.tsx           # NEW
│   ├── order/
│   │   └── TrackingTimeline.tsx        # NEW
│   ├── loyalty/
│   │   ├── PointsBalance.tsx           # NEW
│   │   ├── TierBadge.tsx               # NEW
│   │   └── RedeemPoints.tsx            # NEW
│   ├── recommendations/
│   │   ├── FrequentlyBoughtTogether.tsx # NEW
│   │   └── RecentlyViewed.tsx          # NEW
│   └── blog/
│       ├── BlogCard.tsx                # NEW
│       └── BlogContent.tsx             # NEW
├── lib/
│   ├── supabase/
│   │   ├── variants.ts                 # NEW
│   │   ├── loyalty.ts                  # NEW
│   │   ├── recommendations.ts          # NEW
│   │   └── blog.ts                     # NEW
│   └── shipping/
│       └── tracking.ts                 # NEW
└── hooks/
    ├── useRecentlyViewed.ts            # NEW
    └── useTrackProductView.ts          # NEW
```

### B. Database Tables Summary

| Phase | New Tables |
|-------|------------|
| 1 | variant_types, variant_options, product_variants, product_variant_values, product_variant_types |
| 2 | order_tracking_events, tracking_notifications |
| 3 | loyalty_tiers, loyalty_profiles, loyalty_transactions, loyalty_earning_rules, loyalty_redemption_rules |
| 4 | product_views, product_associations, user_preferences |
| 5 | blog_categories, blog_tags, blog_posts, blog_post_tags, blog_post_products |

---

**Document Version:** 1.0  
**Last Updated:** 2026-04-03  
**Author:** OpenCode Assistant
