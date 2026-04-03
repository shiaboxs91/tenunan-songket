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
| 4 | Advanced Search | Partial (basic) | HIGH | Medium |
| 5 | Loyalty Program & Points | Missing | MEDIUM | Large |
| 6 | Live Chat & Customer Support | Partial (WhatsApp mobile) | MEDIUM | Medium |
| 7 | Product Recommendations | Partial (basic) | MEDIUM | Medium |
| 8 | Flash Sales & Promotions | Partial (coupons only) | MEDIUM | Medium |
| 9 | Order Tracking | Partial (manual) | HIGH | Medium |
| 11 | Product Bundles | Missing | MEDIUM | Medium |
| 12 | Blog & Content | Missing | LOW | Medium |
| 14 | Analytics Dashboard | Partial (basic) | LOW | Medium |

### Implementation Timeline

| Phase | Duration | Modules |
|-------|----------|---------|
| Phase 1 | 2-3 minggu | Product Variants (backend + frontend) |
| Phase 2 | 1-2 minggu | Order Tracking Enhancement |
| Phase 3 | 2-3 minggu | Loyalty Program & Points |
| Phase 4 | 1-2 minggu | Product Recommendations Enhancement |
| Phase 5 | 2 minggu | Blog & Content CMS |
| Phase 6 | 1-2 minggu | Advanced Search |
| Phase 7 | 1 minggu | Live Chat & Customer Support |
| Phase 8 | 1-2 minggu | Flash Sales & Promotions |
| Phase 9 | 1-2 minggu | Product Bundles |
| Phase 10 | 1 minggu | Analytics Dashboard Enhancement |

**Total Estimated:** 14-20 minggu

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

## Phase 6: Advanced Search

### Current State
- Basic search input di Header
- Search query diteruskan ke `/products?q=xxx`
- Filter kategori, harga, stok sudah ada di ProductFilters
- Tidak ada autocomplete, history, atau voice search

### Goals
- Autocomplete suggestions saat mengetik
- Search history untuk user (localStorage + database untuk logged in)
- Voice search support (Web Speech API)
- Popular/trending searches
- Recent searches display

### Database Schema

```sql
-- Migration: create_search_tables

-- Search History (untuk logged-in users)
CREATE TABLE search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  query VARCHAR(255) NOT NULL,
  results_count INT DEFAULT 0,
  searched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Popular Searches (aggregated)
CREATE TABLE popular_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query VARCHAR(255) NOT NULL UNIQUE,
  search_count INT DEFAULT 1,
  last_searched_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Search Suggestions (curated by admin)
CREATE TABLE search_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  keyword VARCHAR(255) NOT NULL,
  display_text VARCHAR(255),          -- Optional display text
  category_id UUID REFERENCES categories(id),
  priority INT DEFAULT 0,             -- Higher = shown first
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_search_history_user ON search_history(user_id);
CREATE INDEX idx_search_history_query ON search_history(query);
CREATE INDEX idx_popular_searches_count ON popular_searches(search_count DESC);
CREATE INDEX idx_search_suggestions_keyword ON search_suggestions(keyword);

-- Function to update popular searches
CREATE OR REPLACE FUNCTION update_popular_search(search_query VARCHAR)
RETURNS void AS $$
BEGIN
  INSERT INTO popular_searches (query, search_count, last_searched_at)
  VALUES (LOWER(TRIM(search_query)), 1, NOW())
  ON CONFLICT (query)
  DO UPDATE SET 
    search_count = popular_searches.search_count + 1,
    last_searched_at = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
```

### Components to Create

```
src/components/search/
├── SearchAutocomplete.tsx    # Main search with autocomplete dropdown
├── SearchSuggestions.tsx     # Dropdown showing suggestions
├── SearchHistory.tsx         # Recent searches list
├── PopularSearches.tsx       # Trending/popular searches
├── VoiceSearchButton.tsx     # Microphone button for voice input
└── SearchResultsFilter.tsx   # Filters within search results

src/hooks/
├── useSearchHistory.ts       # Manage search history (localStorage + API)
├── useSearchSuggestions.ts   # Fetch autocomplete suggestions
└── useVoiceSearch.ts         # Voice recognition hook
```

### API Endpoints

```typescript
// src/lib/supabase/search.ts

// Get autocomplete suggestions
getSearchSuggestions(query: string, limit?: number): Promise<SearchSuggestion[]>

// Get popular searches
getPopularSearches(limit?: number): Promise<PopularSearch[]>

// Save search to history
saveSearchHistory(userId: string | null, query: string, resultsCount: number): Promise<void>

// Get user's search history
getUserSearchHistory(userId: string, limit?: number): Promise<SearchHistory[]>

// Clear user's search history
clearSearchHistory(userId: string): Promise<void>

// Admin: Manage curated suggestions
createSearchSuggestion(data: CreateSuggestionInput): Promise<SearchSuggestion>
updateSearchSuggestion(id: string, data: UpdateSuggestionInput): Promise<void>
deleteSearchSuggestion(id: string): Promise<void>
```

### UI Specifications

#### Search Autocomplete

```
┌─────────────────────────────────────────────────────────────┐
│ 🔍 [Cari songket...                        ] [🎤] [Search] │
├─────────────────────────────────────────────────────────────┤
│ Pencarian Terakhir:                          [Hapus Semua] │
│ • songket merah                                             │
│ • kain bertabur                                             │
│ • si pugut                                                  │
├─────────────────────────────────────────────────────────────┤
│ Pencarian Populer:                                          │
│ • songket perkahwinan    🔥 120 pencarian                  │
│ • kain tenunan emas      🔥 98 pencarian                   │
│ • songket brunei         🔥 87 pencarian                   │
├─────────────────────────────────────────────────────────────┤
│ Saran:                                                      │
│ • "songket" dalam Kategori Bertabur                        │
│ • "songket" dalam Kategori Si Pugut                        │
└─────────────────────────────────────────────────────────────┘
```

#### Voice Search Flow

```
┌──────────────────────────────────────┐
│          🎤 Mendengarkan...          │
│                                      │
│     [Animated sound waves]           │
│                                      │
│     "songket merah"                  │
│     (transcription preview)          │
│                                      │
│     [Batal]                          │
└──────────────────────────────────────┘
```

### Voice Search Implementation

```typescript
// src/hooks/useVoiceSearch.ts
import { useState, useCallback, useEffect } from 'react';

interface UseVoiceSearchReturn {
  isListening: boolean;
  transcript: string;
  isSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
  error: string | null;
}

export function useVoiceSearch(): UseVoiceSearchReturn {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const isSupported = typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const startListening = useCallback(() => {
    if (!isSupported) {
      setError('Voice search tidak didukung di browser ini');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'ms-MY'; // Malay
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setTranscript(transcript);
    };
    recognition.onerror = (event) => {
      setError(event.error);
      setIsListening(false);
    };

    recognition.start();
  }, [isSupported]);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  return { isListening, transcript, isSupported, startListening, stopListening, error };
}
```

### Tasks Checklist

#### Database (Day 1)
- [ ] Create search_history table
- [ ] Create popular_searches table
- [ ] Create search_suggestions table
- [ ] Add RLS policies
- [ ] Create update_popular_search function

#### Backend (Day 2-3)
- [ ] Create search service (`src/lib/supabase/search.ts`)
- [ ] Create API endpoints for suggestions
- [ ] Implement search history tracking
- [ ] Add search analytics trigger

#### Frontend (Day 4-7)
- [ ] Create SearchAutocomplete component
- [ ] Create SearchSuggestions dropdown
- [ ] Create SearchHistory component
- [ ] Create VoiceSearchButton component
- [ ] Implement useVoiceSearch hook
- [ ] Implement useSearchHistory hook
- [ ] Integrate with Header search

#### Admin (Day 8)
- [ ] Create search suggestions management page
- [ ] Create popular searches analytics view

---

## Phase 7: Live Chat & Customer Support

### Current State
- WhatsApp button exists di mobile (`WhatsAppButton.tsx`)
- Tidak ada live chat widget
- Tidak ada chatbot atau FAQ bot
- Tidak ada support ticket system

### Goals
- WhatsApp integration untuk desktop juga
- Live chat widget (Tawk.to / Crisp / custom)
- Simple FAQ chatbot
- Contact form dengan ticket system

### Options Analysis

| Solution | Cost | Effort | Features |
|----------|------|--------|----------|
| Tawk.to | Free | Low | Live chat, mobile app, triggers |
| Crisp | Free-$25/mo | Low | Live chat, chatbot, CRM |
| WhatsApp Business API | Pay-per-msg | Medium | Official API, templates |
| Custom WebSocket Chat | Free | High | Full control, complex |

**Recommendation:** Tawk.to (free) + WhatsApp button enhancement

### Components to Create

```
src/components/support/
├── LiveChatWidget.tsx        # Tawk.to/Crisp embed wrapper
├── WhatsAppButton.tsx        # Enhanced (desktop + mobile)
├── ContactForm.tsx           # Contact/support form
├── FAQChatbot.tsx            # Simple FAQ bot (optional)
└── SupportTicketList.tsx     # User's ticket history

src/app/(store)/
├── contact/page.tsx          # Contact us page
└── support/page.tsx          # Support center
```

### Database Schema (for Contact Form)

```sql
-- Migration: create_support_tables

-- Support Tickets
CREATE TABLE support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number VARCHAR(20) NOT NULL UNIQUE, -- "TKT-20260403-001"
  user_id UUID REFERENCES profiles(id),
  guest_email VARCHAR(255),
  guest_name VARCHAR(255),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  category VARCHAR(50),                      -- "order", "product", "shipping", "other"
  status VARCHAR(20) DEFAULT 'open',         -- "open", "in_progress", "resolved", "closed"
  priority VARCHAR(10) DEFAULT 'normal',     -- "low", "normal", "high", "urgent"
  order_id UUID REFERENCES orders(id),       -- Link to related order
  assigned_to UUID REFERENCES profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ticket Replies
CREATE TABLE ticket_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),      -- null = admin/system
  is_admin BOOLEAN DEFAULT false,
  message TEXT NOT NULL,
  attachments JSONB,                         -- [{url, filename, size}]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_tickets_number ON support_tickets(ticket_number);
CREATE INDEX idx_ticket_replies_ticket ON ticket_replies(ticket_id);

-- Generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.ticket_number := 'TKT-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
    LPAD(NEXTVAL('ticket_number_seq')::TEXT, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE ticket_number_seq START 1;

CREATE TRIGGER set_ticket_number
BEFORE INSERT ON support_tickets
FOR EACH ROW
EXECUTE FUNCTION generate_ticket_number();
```

### Tawk.to Integration

```typescript
// src/components/support/LiveChatWidget.tsx
"use client";

import { useEffect } from 'react';

interface LiveChatWidgetProps {
  propertyId: string;    // From Tawk.to dashboard
  widgetId: string;
}

export function LiveChatWidget({ propertyId, widgetId }: LiveChatWidgetProps) {
  useEffect(() => {
    // Load Tawk.to script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');
    document.head.appendChild(script);

    return () => {
      // Cleanup
      document.head.removeChild(script);
    };
  }, [propertyId, widgetId]);

  return null; // Widget renders itself
}

// Usage in layout.tsx:
// <LiveChatWidget propertyId="xxx" widgetId="default" />
```

### Enhanced WhatsApp Button

```typescript
// src/components/support/WhatsAppButton.tsx
"use client";

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WhatsAppButtonProps {
  phoneNumber: string;      // With country code, e.g., "6281234567890"
  message?: string;
  variant?: 'floating' | 'inline';
  showOnDesktop?: boolean;
}

export function WhatsAppButton({ 
  phoneNumber, 
  message = "Halo, saya ingin bertanya tentang produk Tenunan Songket.",
  variant = 'floating',
  showOnDesktop = true
}: WhatsAppButtonProps) {
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  if (variant === 'floating') {
    return (
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg transition-all hover:scale-110 ${showOnDesktop ? '' : 'md:hidden'}`}
        aria-label="Chat via WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    );
  }

  return (
    <Button asChild variant="outline" className="gap-2">
      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="h-4 w-4" />
        Chat WhatsApp
      </a>
    </Button>
  );
}
```

### UI Specifications

#### Contact Page

```
┌─────────────────────────────────────────────────────────────┐
│ 📞 Hubungi Kami                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────┐  ┌─────────────────────┐           │
│ │ 💬 WhatsApp         │  │ 📧 Email            │           │
│ │ +673 XXX XXXX       │  │ support@tenunan.com │           │
│ │ [Chat Sekarang]     │  │ [Kirim Email]       │           │
│ └─────────────────────┘  └─────────────────────┘           │
│                                                             │
│ ─────────────────── atau ───────────────────               │
│                                                             │
│ Kirim Pesan:                                                │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Nama*          [                                      ] ││
│ │ Email*         [                                      ] ││
│ │ Kategori       [ Pilih kategori...               ▼   ] ││
│ │ No. Pesanan    [                       ] (opsional)   ││
│ │ Pesan*         [                                      ] ││
│ │                [                                      ] ││
│ │                [                                      ] ││
│ │                                                         ││
│ │                              [Kirim Pesan]              ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Tasks Checklist

#### Database (Day 1)
- [ ] Create support_tickets table
- [ ] Create ticket_replies table
- [ ] Add ticket number generator
- [ ] Add RLS policies

#### Backend (Day 2)
- [ ] Create support ticket service
- [ ] Create API for ticket CRUD
- [ ] Create email notification for new tickets

#### Frontend (Day 3-5)
- [ ] Enhance WhatsAppButton for desktop
- [ ] Create ContactForm component
- [ ] Create contact page
- [ ] Integrate Tawk.to widget (optional)
- [ ] Create ticket history for logged-in users

#### Admin (Day 6-7)
- [ ] Create ticket management page
- [ ] Create ticket detail/reply page
- [ ] Add ticket stats to dashboard

---

## Phase 8: Flash Sales & Promotions

### Current State
- Coupon system exists (percentage/fixed discounts)
- Hero banner slides untuk promotional banners
- Tidak ada countdown timer
- Tidak ada flash sale page
- Tidak ada urgency indicators (limited stock)

### Goals
- Flash sale dengan countdown timer
- Dedicated flash sale page
- Stock urgency badges ("Sisa 5!")
- Scheduled promotions
- Banner dengan countdown

### Database Schema

```sql
-- Migration: create_flash_sales

-- Flash Sales / Promotions
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  banner_image_url TEXT,
  discount_type VARCHAR(20) NOT NULL,    -- "percentage", "fixed"
  discount_value DECIMAL(12,2) NOT NULL,
  min_purchase DECIMAL(12,2),
  max_discount DECIMAL(12,2),            -- Cap for percentage discounts
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN DEFAULT true,
  show_countdown BOOLEAN DEFAULT true,
  priority INT DEFAULT 0,                 -- Higher = more prominent
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products in Promotion
CREATE TABLE promotion_products (
  promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  special_price DECIMAL(12,2),           -- Override promotion discount
  max_quantity INT,                       -- Limit per customer
  total_stock INT,                        -- Limited stock for flash sale
  sold_count INT DEFAULT 0,
  PRIMARY KEY (promotion_id, product_id)
);

-- Indexes
CREATE INDEX idx_promotions_dates ON promotions(starts_at, ends_at);
CREATE INDEX idx_promotions_active ON promotions(is_active) WHERE is_active = true;
CREATE INDEX idx_promotion_products_product ON promotion_products(product_id);

-- View for active promotions
CREATE VIEW active_promotions AS
SELECT * FROM promotions
WHERE is_active = true
  AND starts_at <= NOW()
  AND ends_at > NOW();
```

### Components to Create

```
src/components/promotion/
├── CountdownTimer.tsx        # Animated countdown component
├── FlashSaleBanner.tsx       # Banner with countdown
├── FlashSaleCard.tsx         # Product card with urgency
├── StockUrgency.tsx          # "Sisa 5 lagi!" badge
├── PromotionBadge.tsx        # "SALE -50%" badge
└── PromotionProgress.tsx     # Stock progress bar

src/app/(store)/
├── flash-sale/page.tsx       # Flash sale listing
└── promo/[slug]/page.tsx     # Specific promotion page

src/app/admin/
└── promotions/
    ├── page.tsx              # Promotions list
    ├── new/page.tsx          # Create promotion
    └── [id]/edit/page.tsx    # Edit promotion
```

### Countdown Timer Component

```typescript
// src/components/promotion/CountdownTimer.tsx
"use client";

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  endTime: Date;
  onExpire?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function CountdownTimer({ endTime, onExpire, size = 'md' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endTime.getTime() - new Date().getTime();
      
      if (difference <= 0) {
        onExpire?.();
        return null;
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onExpire]);

  if (!timeLeft) {
    return <span className="text-red-500 font-medium">Berakhir!</span>;
  }

  const sizeClasses = {
    sm: 'text-xs gap-1',
    md: 'text-sm gap-2',
    lg: 'text-lg gap-3',
  };

  const boxClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
  };

  return (
    <div className={`flex items-center ${sizeClasses[size]}`}>
      <TimeBox value={timeLeft.days} label="Hari" className={boxClasses[size]} />
      <span className="text-muted-foreground">:</span>
      <TimeBox value={timeLeft.hours} label="Jam" className={boxClasses[size]} />
      <span className="text-muted-foreground">:</span>
      <TimeBox value={timeLeft.minutes} label="Min" className={boxClasses[size]} />
      <span className="text-muted-foreground">:</span>
      <TimeBox value={timeLeft.seconds} label="Det" className={boxClasses[size]} />
    </div>
  );
}

function TimeBox({ value, label, className }: { value: number; label: string; className: string }) {
  return (
    <div className={`flex flex-col items-center justify-center bg-primary text-primary-foreground rounded ${className}`}>
      <span className="font-bold">{value.toString().padStart(2, '0')}</span>
      <span className="text-[10px] opacity-80">{label}</span>
    </div>
  );
}
```

### Stock Urgency Component

```typescript
// src/components/promotion/StockUrgency.tsx
"use client";

import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StockUrgencyProps {
  stock: number;
  soldCount?: number;
  totalStock?: number;
  threshold?: number;    // Show urgency when stock <= threshold
}

export function StockUrgency({ stock, soldCount, totalStock, threshold = 10 }: StockUrgencyProps) {
  if (stock > threshold && !totalStock) return null;

  const showProgress = totalStock && soldCount !== undefined;
  const percentage = showProgress ? (soldCount / totalStock) * 100 : 0;

  return (
    <div className="space-y-1">
      {stock <= threshold && stock > 0 && (
        <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400">
          <Flame className="h-4 w-4 animate-pulse" />
          <span className="text-sm font-medium">
            Sisa {stock} lagi!
          </span>
        </div>
      )}
      
      {showProgress && (
        <div className="space-y-1">
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={cn(
                "h-full transition-all duration-500",
                percentage > 80 ? "bg-red-500" : percentage > 50 ? "bg-orange-500" : "bg-green-500"
              )}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Terjual {soldCount} dari {totalStock}
          </p>
        </div>
      )}
    </div>
  );
}
```

### UI Specifications

#### Flash Sale Page

```
┌─────────────────────────────────────────────────────────────┐
│ ⚡ FLASH SALE                                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ [Banner Image - Flash Sale]                             ││
│ │                                                         ││
│ │ BERAKHIR DALAM:                                         ││
│ │ ┌────┐ : ┌────┐ : ┌────┐ : ┌────┐                      ││
│ │ │ 02 │   │ 14 │   │ 35 │   │ 42 │                      ││
│ │ │Hari│   │Jam │   │Min │   │Det │                      ││
│ │ └────┘   └────┘   └────┘   └────┘                      ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│ │ [Image]      │ │ [Image]      │ │ [Image]      │        │
│ │ ┌──────────┐ │ │ ┌──────────┐ │ │ ┌──────────┐ │        │
│ │ │ -50% OFF │ │ │ │ -30% OFF │ │ │ │ -40% OFF │ │        │
│ │ └──────────┘ │ │ └──────────┘ │ │ └──────────┘ │        │
│ │ Product Name │ │ Product Name │ │ Product Name │        │
│ │ ̶R̶p̶ ̶2̶,̶0̶0̶0̶,̶0̶0̶0̶│ │ ̶R̶p̶ ̶1̶,̶5̶0̶0̶,̶0̶0̶0̶│ │ ̶R̶p̶ ̶1̶,̶8̶0̶0̶,̶0̶0̶0̶│        │
│ │ Rp 1,000,000 │ │ Rp 1,050,000 │ │ Rp 1,080,000 │        │
│ │              │ │              │ │              │        │
│ │ 🔥 Sisa 5!  │ │ ████████░░   │ │ 🔥 Sisa 3!  │        │
│ │              │ │ 80% terjual  │ │              │        │
│ │ [Beli]       │ │ [Beli]       │ │ [Beli]       │        │
│ └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Tasks Checklist

#### Database (Day 1)
- [ ] Create promotions table
- [ ] Create promotion_products table
- [ ] Add active_promotions view
- [ ] Add RLS policies

#### Backend (Day 2-3)
- [ ] Create promotions service
- [ ] Create API for promotions
- [ ] Add promotion price calculation to products
- [ ] Add stock validation for flash sale

#### Frontend (Day 4-7)
- [ ] Create CountdownTimer component
- [ ] Create StockUrgency component
- [ ] Create FlashSaleBanner component
- [ ] Create flash-sale page
- [ ] Integrate urgency indicators in ProductCard
- [ ] Add promotion badges

#### Admin (Day 8-10)
- [ ] Create promotions management page
- [ ] Create promotion editor
- [ ] Add product selector for promotions
- [ ] Add promotion scheduling

---

## Phase 9: Product Bundles

### Current State
- Tidak ada sistem bundle
- Tidak ada "Frequently bought together"
- Tidak ada gift sets
- Tidak ada bundle discounts

### Goals
- Bundle products dengan diskon
- "Sering Dibeli Bersamaan" dengan "Tambah Semua"
- Gift sets/paket hadiah
- Admin dapat membuat dan mengelola bundles

### Database Schema

```sql
-- Migration: create_product_bundles

-- Product Bundles
CREATE TABLE product_bundles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  bundle_type VARCHAR(20) NOT NULL,       -- "fixed", "gift_set", "dynamic"
  discount_type VARCHAR(20),              -- "percentage", "fixed"
  discount_value DECIMAL(12,2),           -- Discount when buying bundle
  bundle_price DECIMAL(12,2),             -- Or fixed bundle price
  is_active BOOLEAN DEFAULT true,
  display_on_product BOOLEAN DEFAULT true, -- Show on product pages
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bundle Items
CREATE TABLE bundle_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bundle_id UUID NOT NULL REFERENCES product_bundles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INT DEFAULT 1,
  is_optional BOOLEAN DEFAULT false,      -- For customizable bundles
  display_order INT DEFAULT 0,
  UNIQUE(bundle_id, product_id)
);

-- Dynamic Bundles (auto-generated from purchase patterns)
CREATE TABLE dynamic_bundle_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  suggested_product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  co_purchase_count INT DEFAULT 0,        -- Times bought together
  score DECIMAL(5,4) DEFAULT 0,           -- Association score
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, suggested_product_id)
);

-- Indexes
CREATE INDEX idx_product_bundles_active ON product_bundles(is_active) WHERE is_active = true;
CREATE INDEX idx_bundle_items_bundle ON bundle_items(bundle_id);
CREATE INDEX idx_bundle_items_product ON bundle_items(product_id);
CREATE INDEX idx_dynamic_bundle_product ON dynamic_bundle_suggestions(product_id);

-- Function to update dynamic bundle suggestions from order data
CREATE OR REPLACE FUNCTION update_bundle_suggestions()
RETURNS void AS $$
BEGIN
  -- Clear old suggestions
  TRUNCATE dynamic_bundle_suggestions;
  
  -- Calculate co-purchase patterns
  INSERT INTO dynamic_bundle_suggestions (product_id, suggested_product_id, co_purchase_count, score)
  SELECT 
    oi1.product_id,
    oi2.product_id,
    COUNT(*) as co_purchase_count,
    COUNT(*)::decimal / GREATEST(
      (SELECT COUNT(DISTINCT order_id) FROM order_items WHERE product_id = oi1.product_id),
      1
    ) as score
  FROM order_items oi1
  JOIN order_items oi2 ON oi1.order_id = oi2.order_id AND oi1.product_id != oi2.product_id
  JOIN orders o ON o.id = oi1.order_id AND o.status NOT IN ('cancelled')
  GROUP BY oi1.product_id, oi2.product_id
  HAVING COUNT(*) >= 3  -- Minimum 3 co-purchases
  ON CONFLICT (product_id, suggested_product_id)
  DO UPDATE SET 
    co_purchase_count = EXCLUDED.co_purchase_count,
    score = EXCLUDED.score,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
```

### Components to Create

```
src/components/bundle/
├── BundleCard.tsx            # Bundle product card
├── BundleItems.tsx           # List of items in bundle
├── BundlePrice.tsx           # Price breakdown & savings
├── AddBundleToCart.tsx       # "Add All to Cart" button
├── FrequentlyBoughtTogether.tsx  # Dynamic suggestions
└── GiftSetCard.tsx           # Special card for gift sets

src/app/(store)/
├── bundles/page.tsx          # Bundle listing
└── bundles/[slug]/page.tsx   # Bundle detail

src/app/admin/
└── bundles/
    ├── page.tsx              # Bundles list
    ├── new/page.tsx          # Create bundle
    └── [id]/edit/page.tsx    # Edit bundle
```

### Frequently Bought Together Component

```typescript
// src/components/bundle/FrequentlyBoughtTogether.tsx
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Plus, Check, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/components/cart/CartProvider';
import { Product } from '@/lib/types';

interface FrequentlyBoughtTogetherProps {
  currentProduct: Product;
  suggestedProducts: Product[];
  bundleDiscount?: number;  // Percentage discount when buying together
}

export function FrequentlyBoughtTogether({
  currentProduct,
  suggestedProducts,
  bundleDiscount = 10
}: FrequentlyBoughtTogetherProps) {
  const { addItem } = useCart();
  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    suggestedProducts.map(p => p.id)
  );

  if (suggestedProducts.length === 0) return null;

  const allProducts = [currentProduct, ...suggestedProducts.filter(p => selectedProducts.includes(p.id))];
  const totalPrice = allProducts.reduce((sum, p) => sum + p.price, 0);
  const discountedPrice = totalPrice * (1 - bundleDiscount / 100);
  const savings = totalPrice - discountedPrice;

  const handleToggle = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleAddAll = () => {
    allProducts.forEach(product => {
      addItem(product, 1);
    });
  };

  return (
    <div className="border rounded-lg p-4 bg-card">
      <h3 className="font-semibold text-lg mb-4">Sering Dibeli Bersamaan</h3>
      
      <div className="flex items-center gap-2 flex-wrap">
        {/* Current Product */}
        <div className="relative w-20 h-20 border rounded-lg overflow-hidden">
          <Image
            src={currentProduct.image || '/images/placeholder.jpg'}
            alt={currentProduct.title}
            fill
            className="object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-xs text-center py-0.5">
            Produk ini
          </div>
        </div>

        {suggestedProducts.map((product, index) => (
          <div key={product.id} className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-muted-foreground" />
            <div 
              className={`relative w-20 h-20 border rounded-lg overflow-hidden cursor-pointer ${
                selectedProducts.includes(product.id) ? 'ring-2 ring-primary' : 'opacity-50'
              }`}
              onClick={() => handleToggle(product.id)}
            >
              <Image
                src={product.image || '/images/placeholder.jpg'}
                alt={product.title}
                fill
                className="object-cover"
              />
              {selectedProducts.includes(product.id) && (
                <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-0.5">
                  <Check className="h-3 w-3" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Price Summary */}
      <div className="mt-4 space-y-1">
        <div className="flex justify-between text-sm">
          <span>Total ({allProducts.length} produk):</span>
          <span className="line-through text-muted-foreground">{formatPrice(totalPrice)}</span>
        </div>
        <div className="flex justify-between text-sm font-medium text-green-600">
          <span>Hemat {bundleDiscount}%:</span>
          <span>-{formatPrice(savings)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg">
          <span>Harga Paket:</span>
          <span className="text-primary">{formatPrice(discountedPrice)}</span>
        </div>
      </div>

      <Button 
        onClick={handleAddAll} 
        className="w-full mt-4 gap-2"
        disabled={allProducts.length < 2}
      >
        <ShoppingCart className="h-4 w-4" />
        Tambah Semua ke Keranjang
      </Button>
    </div>
  );
}
```

### UI Specifications

#### Bundle Detail Page

```
┌─────────────────────────────────────────────────────────────┐
│ 🎁 Paket Perkahwinan Lengkap                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌───────────────────────────────────────────────────────┐  │
│ │ [Bundle Image - All products together]                │  │
│ └───────────────────────────────────────────────────────┘  │
│                                                             │
│ Isi Paket:                                                  │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ ☑ 1x Songket Bertabur Emas     Rp 2,500,000            ││
│ │ ☑ 1x Selendang Matching        Rp 800,000              ││
│ │ ☑ 1x Kotak Hadiah Premium      Rp 200,000              ││
│ │ ☑ 1x Kartu Ucapan Custom       Rp 50,000               ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Total Normal:     ̶R̶p̶ ̶3̶,̶5̶5̶0̶,̶0̶0̶0̶                        ││
│ │ Diskon Paket:     -Rp 550,000 (15%)                    ││
│ │ ─────────────────────────────────────────              ││
│ │ Harga Paket:      Rp 3,000,000                         ││
│ │                                                         ││
│ │ [🛒 Tambah Paket ke Keranjang]                         ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Tasks Checklist

#### Database (Day 1-2)
- [ ] Create product_bundles table
- [ ] Create bundle_items table
- [ ] Create dynamic_bundle_suggestions table
- [ ] Add RLS policies
- [ ] Create update_bundle_suggestions function

#### Backend (Day 3-4)
- [ ] Create bundle service
- [ ] Create API for bundles
- [ ] Implement bundle price calculation
- [ ] Create cron job for dynamic suggestions

#### Frontend (Day 5-8)
- [ ] Create BundleCard component
- [ ] Create FrequentlyBoughtTogether component
- [ ] Create bundles listing page
- [ ] Create bundle detail page
- [ ] Integrate suggestions on product page
- [ ] Add bundle to cart functionality

#### Admin (Day 9-10)
- [ ] Create bundle management page
- [ ] Create bundle editor
- [ ] Add product selector
- [ ] Add gift set templates

---

## Phase 10: Analytics Dashboard Enhancement

### Current State
- Admin dashboard dengan stats dasar (orders, revenue, customers, products)
- Sales chart (7d/30d/90d)
- Top products
- Order status summary (pie chart)
- Recent orders
- Stock alerts
- Meta Pixel tracking untuk Facebook

### Goals
- Conversion funnel visualization
- Customer insights & demographics
- Traffic sources report
- Product performance analytics
- Cart abandonment tracking
- Export reports to Excel/PDF

### Database Schema

```sql
-- Migration: enhance_analytics

-- Page Views (for traffic analysis)
CREATE TABLE page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  session_id VARCHAR(100),
  page_path VARCHAR(255) NOT NULL,
  page_title VARCHAR(255),
  referrer VARCHAR(500),
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  device_type VARCHAR(20),              -- "mobile", "tablet", "desktop"
  browser VARCHAR(50),
  country_code VARCHAR(2),
  viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversion Events
CREATE TABLE conversion_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  session_id VARCHAR(100),
  event_type VARCHAR(50) NOT NULL,      -- "view_product", "add_to_cart", "begin_checkout", "purchase"
  product_id UUID REFERENCES products(id),
  order_id UUID REFERENCES orders(id),
  event_value DECIMAL(12,2),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Daily Aggregated Stats (for faster queries)
CREATE TABLE daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  total_orders INT DEFAULT 0,
  total_revenue DECIMAL(12,2) DEFAULT 0,
  total_customers INT DEFAULT 0,
  new_customers INT DEFAULT 0,
  returning_customers INT DEFAULT 0,
  total_page_views INT DEFAULT 0,
  unique_visitors INT DEFAULT 0,
  product_views INT DEFAULT 0,
  add_to_carts INT DEFAULT 0,
  checkouts_started INT DEFAULT 0,
  checkouts_completed INT DEFAULT 0,
  cart_abandonment_rate DECIMAL(5,2),
  average_order_value DECIMAL(12,2),
  top_products JSONB,                   -- [{product_id, sold, revenue}]
  top_categories JSONB,
  traffic_sources JSONB,                -- [{source, count}]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cart Abandonment Tracking
CREATE TABLE abandoned_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  guest_email VARCHAR(255),
  cart_items JSONB NOT NULL,            -- Snapshot of cart items
  cart_total DECIMAL(12,2) NOT NULL,
  abandoned_at TIMESTAMPTZ DEFAULT NOW(),
  recovery_email_sent BOOLEAN DEFAULT false,
  recovered BOOLEAN DEFAULT false,
  recovered_order_id UUID REFERENCES orders(id)
);

-- Indexes
CREATE INDEX idx_page_views_date ON page_views(viewed_at);
CREATE INDEX idx_page_views_session ON page_views(session_id);
CREATE INDEX idx_conversion_events_type ON conversion_events(event_type);
CREATE INDEX idx_conversion_events_date ON conversion_events(created_at);
CREATE INDEX idx_daily_stats_date ON daily_stats(date);
CREATE INDEX idx_abandoned_carts_date ON abandoned_carts(abandoned_at);

-- Function to aggregate daily stats
CREATE OR REPLACE FUNCTION aggregate_daily_stats(target_date DATE)
RETURNS void AS $$
DECLARE
  stats RECORD;
BEGIN
  -- Calculate stats for the day
  SELECT
    COUNT(DISTINCT o.id) as total_orders,
    COALESCE(SUM(o.total), 0) as total_revenue,
    COUNT(DISTINCT o.user_id) as total_customers,
    COUNT(DISTINCT CASE WHEN p.created_at::date = target_date THEN p.id END) as new_customers,
    AVG(o.total) as avg_order_value
  INTO stats
  FROM orders o
  LEFT JOIN profiles p ON p.id = o.user_id
  WHERE o.created_at::date = target_date
    AND o.status NOT IN ('cancelled');

  -- Upsert daily stats
  INSERT INTO daily_stats (
    date, total_orders, total_revenue, total_customers, 
    new_customers, average_order_value
  )
  VALUES (
    target_date, stats.total_orders, stats.total_revenue, 
    stats.total_customers, stats.new_customers, stats.avg_order_value
  )
  ON CONFLICT (date)
  DO UPDATE SET
    total_orders = EXCLUDED.total_orders,
    total_revenue = EXCLUDED.total_revenue,
    total_customers = EXCLUDED.total_customers,
    new_customers = EXCLUDED.new_customers,
    average_order_value = EXCLUDED.average_order_value,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
```

### Components to Create/Enhance

```
src/components/admin/analytics/
├── ConversionFunnel.tsx      # Visual funnel chart
├── TrafficSources.tsx        # Traffic source breakdown
├── CustomerInsights.tsx      # Demographics & behavior
├── ProductPerformance.tsx    # Product-level analytics
├── CartAbandonment.tsx       # Abandonment tracking
├── RevenueChart.tsx          # Enhanced revenue chart
├── ExportButton.tsx          # Export to Excel/PDF
└── DateRangePicker.tsx       # Custom date range selector

src/app/admin/analytics/
├── page.tsx                  # Analytics overview
├── traffic/page.tsx          # Traffic analysis
├── products/page.tsx         # Product performance
├── customers/page.tsx        # Customer insights
└── conversions/page.tsx      # Conversion tracking
```

### Conversion Funnel Component

```typescript
// src/components/admin/analytics/ConversionFunnel.tsx
"use client";

interface FunnelStep {
  name: string;
  value: number;
  color: string;
}

interface ConversionFunnelProps {
  steps: FunnelStep[];
}

export function ConversionFunnel({ steps }: ConversionFunnelProps) {
  const maxValue = Math.max(...steps.map(s => s.value));

  return (
    <div className="space-y-3">
      <h3 className="font-semibold">Conversion Funnel</h3>
      <div className="space-y-2">
        {steps.map((step, index) => {
          const width = (step.value / maxValue) * 100;
          const conversionRate = index > 0 
            ? ((step.value / steps[index - 1].value) * 100).toFixed(1)
            : '100';

          return (
            <div key={step.name} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{step.name}</span>
                <span className="font-medium">{step.value.toLocaleString()}</span>
              </div>
              <div className="relative h-8 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                <div
                  className="h-full transition-all duration-500 flex items-center justify-end pr-2"
                  style={{ width: `${width}%`, backgroundColor: step.color }}
                >
                  {index > 0 && (
                    <span className="text-xs text-white font-medium">
                      {conversionRate}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Usage:
// <ConversionFunnel steps={[
//   { name: 'Lihat Produk', value: 10000, color: '#3B82F6' },
//   { name: 'Tambah ke Keranjang', value: 2500, color: '#8B5CF6' },
//   { name: 'Mulai Checkout', value: 1200, color: '#EC4899' },
//   { name: 'Selesai Pembelian', value: 800, color: '#10B981' },
// ]} />
```

### UI Specifications

#### Analytics Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ 📊 Analytics Dashboard                    [Export] [7d ▼]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────┐│
│ │ Pengunjung  │ │ Pesanan     │ │ Revenue     │ │ Conv.   ││
│ │ 12,450      │ │ 342         │ │ Rp 856M     │ │ 2.75%   ││
│ │ ↑ 12%       │ │ ↑ 8%        │ │ ↑ 15%       │ │ ↑ 0.3%  ││
│ └─────────────┘ └─────────────┘ └─────────────┘ └─────────┘│
│                                                             │
│ ┌─────────────────────────────────┬─────────────────────────┐
│ │ Conversion Funnel               │ Traffic Sources         │
│ │                                 │                         │
│ │ Lihat Produk    ██████████ 10K │ Direct      45%         │
│ │ Add to Cart     █████ 2.5K     │ Google      30%         │
│ │ Checkout        ███ 1.2K       │ Facebook    15%         │
│ │ Purchase        ██ 800         │ Instagram   8%          │
│ │                                 │ Others      2%          │
│ └─────────────────────────────────┴─────────────────────────┘
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐│
│ │ Revenue Trend                                           ││
│ │                    📈                                   ││
│ │ [Revenue Chart - Line graph over selected period]       ││
│ │                                                         ││
│ └─────────────────────────────────────────────────────────┘│
│                                                             │
│ ┌─────────────────────────────────┬─────────────────────────┐
│ │ Top Products                    │ Cart Abandonment        │
│ │ 1. Songket Bertabur   Rp 125M  │ Rate: 68%               │
│ │ 2. Si Pugut Emas      Rp 98M   │ ───────────────         │
│ │ 3. Kain Sinjang       Rp 76M   │ Total: 234 carts        │
│ │ 4. Songket Perak      Rp 65M   │ Value: Rp 456M          │
│ │ 5. Selendang          Rp 45M   │ [Send Recovery Emails]  │
│ └─────────────────────────────────┴─────────────────────────┘
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Tasks Checklist

#### Database (Day 1-2)
- [ ] Create page_views table
- [ ] Create conversion_events table
- [ ] Create daily_stats table
- [ ] Create abandoned_carts table
- [ ] Add aggregation function

#### Backend (Day 3-4)
- [ ] Create analytics service
- [ ] Create tracking API endpoint
- [ ] Implement daily aggregation cron
- [ ] Create export functions (Excel/PDF)

#### Frontend - Tracking (Day 5)
- [ ] Implement page view tracking
- [ ] Implement conversion event tracking
- [ ] Track cart abandonment

#### Frontend - Dashboard (Day 6-8)
- [ ] Create ConversionFunnel component
- [ ] Create TrafficSources component
- [ ] Create CustomerInsights component
- [ ] Create ProductPerformance page
- [ ] Enhance existing dashboard
- [ ] Add export functionality
- [ ] Add date range picker

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

# Phase 6 - Advanced Search
# No new deps needed (Web Speech API is built-in)

# Phase 7 - Live Chat
# No new deps (Tawk.to is external script)

# Phase 8 - Flash Sales
# No new deps needed

# Phase 9 - Product Bundles
# No new deps needed

# Phase 10 - Analytics
npm install xlsx             # For Excel export
npm install @react-pdf/renderer  # For PDF export (optional)
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
│   │   │   ├── loyalty/page.tsx        # Phase 3
│   │   │   └── referrals/page.tsx      # Phase 3
│   │   ├── blog/
│   │   │   ├── page.tsx                # Phase 5
│   │   │   ├── [slug]/page.tsx         # Phase 5
│   │   │   └── category/[slug]/page.tsx # Phase 5
│   │   ├── track/
│   │   │   └── [orderNumber]/page.tsx  # Phase 2
│   │   ├── flash-sale/page.tsx         # Phase 8
│   │   ├── bundles/
│   │   │   ├── page.tsx                # Phase 9
│   │   │   └── [slug]/page.tsx         # Phase 9
│   │   ├── contact/page.tsx            # Phase 7
│   │   └── support/page.tsx            # Phase 7
│   └── admin/
│       ├── blog/
│       │   ├── page.tsx                # Phase 5
│       │   ├── new/page.tsx            # Phase 5
│       │   ├── [id]/edit/page.tsx      # Phase 5
│       │   └── categories/page.tsx     # Phase 5
│       ├── loyalty/
│       │   ├── page.tsx                # Phase 3
│       │   ├── tiers/page.tsx          # Phase 3
│       │   └── rules/page.tsx          # Phase 3
│       ├── promotions/
│       │   ├── page.tsx                # Phase 8
│       │   ├── new/page.tsx            # Phase 8
│       │   └── [id]/edit/page.tsx      # Phase 8
│       ├── bundles/
│       │   ├── page.tsx                # Phase 9
│       │   ├── new/page.tsx            # Phase 9
│       │   └── [id]/edit/page.tsx      # Phase 9
│       ├── analytics/
│       │   ├── page.tsx                # Phase 10
│       │   ├── traffic/page.tsx        # Phase 10
│       │   ├── products/page.tsx       # Phase 10
│       │   ├── customers/page.tsx      # Phase 10
│       │   └── conversions/page.tsx    # Phase 10
│       ├── support/
│       │   ├── page.tsx                # Phase 7
│       │   └── [id]/page.tsx           # Phase 7
│       └── search/
│           └── suggestions/page.tsx    # Phase 6
├── components/
│   ├── product/
│   │   ├── VariantSelector.tsx         # Phase 1
│   │   └── VariantSwatch.tsx           # Phase 1
│   ├── order/
│   │   └── TrackingTimeline.tsx        # Phase 2
│   ├── loyalty/
│   │   ├── PointsBalance.tsx           # Phase 3
│   │   ├── TierBadge.tsx               # Phase 3
│   │   └── RedeemPoints.tsx            # Phase 3
│   ├── recommendations/
│   │   ├── FrequentlyBoughtTogether.tsx # Phase 4
│   │   └── RecentlyViewed.tsx          # Phase 4
│   ├── blog/
│   │   ├── BlogCard.tsx                # Phase 5
│   │   └── BlogContent.tsx             # Phase 5
│   ├── search/
│   │   ├── SearchAutocomplete.tsx      # Phase 6
│   │   ├── SearchSuggestions.tsx       # Phase 6
│   │   ├── VoiceSearchButton.tsx       # Phase 6
│   │   └── SearchHistory.tsx           # Phase 6
│   ├── support/
│   │   ├── LiveChatWidget.tsx          # Phase 7
│   │   ├── WhatsAppButton.tsx          # Phase 7 (enhanced)
│   │   └── ContactForm.tsx             # Phase 7
│   ├── promotion/
│   │   ├── CountdownTimer.tsx          # Phase 8
│   │   ├── FlashSaleBanner.tsx         # Phase 8
│   │   └── StockUrgency.tsx            # Phase 8
│   ├── bundle/
│   │   ├── BundleCard.tsx              # Phase 9
│   │   ├── FrequentlyBoughtTogether.tsx # Phase 9
│   │   └── AddBundleToCart.tsx         # Phase 9
│   └── admin/analytics/
│       ├── ConversionFunnel.tsx        # Phase 10
│       ├── TrafficSources.tsx          # Phase 10
│       └── ExportButton.tsx            # Phase 10
├── lib/
│   ├── supabase/
│   │   ├── variants.ts                 # Phase 1
│   │   ├── loyalty.ts                  # Phase 3
│   │   ├── recommendations.ts          # Phase 4
│   │   ├── blog.ts                     # Phase 5
│   │   ├── search.ts                   # Phase 6
│   │   ├── support.ts                  # Phase 7
│   │   ├── promotions.ts               # Phase 8
│   │   ├── bundles.ts                  # Phase 9
│   │   └── analytics.ts                # Phase 10
│   └── shipping/
│       └── tracking.ts                 # Phase 2
└── hooks/
    ├── useRecentlyViewed.ts            # Phase 4
    ├── useTrackProductView.ts          # Phase 4
    ├── useSearchHistory.ts             # Phase 6
    ├── useVoiceSearch.ts               # Phase 6
    └── useAnalyticsTracking.ts         # Phase 10
```

### B. Database Tables Summary

| Phase | New Tables |
|-------|------------|
| 1 | variant_types, variant_options, product_variants, product_variant_values, product_variant_types |
| 2 | order_tracking_events, tracking_notifications |
| 3 | loyalty_tiers, loyalty_profiles, loyalty_transactions, loyalty_earning_rules, loyalty_redemption_rules |
| 4 | product_views, product_associations, user_preferences |
| 5 | blog_categories, blog_tags, blog_posts, blog_post_tags, blog_post_products |
| 6 | search_history, popular_searches, search_suggestions |
| 7 | support_tickets, ticket_replies |
| 8 | promotions, promotion_products |
| 9 | product_bundles, bundle_items, dynamic_bundle_suggestions |
| 10 | page_views, conversion_events, daily_stats, abandoned_carts |

### C. Multi-language Notes

**Supported Languages:**
- Malay (ms) - Default
- English (en)

**NOT Supported (by design):**
- Indonesian (id) - Target market is Brunei/Malaysia, not Indonesia

All new components and pages should use `useTranslations()` hook from next-intl and add translations to both `src/i18n/messages/ms.json` and `src/i18n/messages/en.json`.

---

**Document Version:** 1.1  
**Last Updated:** 2026-04-03  
**Author:** OpenCode Assistant

## Revision History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-04-03 | Initial document with Phase 1-5 |
| 1.1 | 2026-04-03 | Added Phase 6-10 (Advanced Search, Live Chat, Flash Sales, Product Bundles, Analytics Enhancement) |
