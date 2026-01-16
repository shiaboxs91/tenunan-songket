# Dokumen Desain: Admin Panel Enhancement

## Gambaran Umum

Dokumen ini menjelaskan desain teknis untuk peningkatan panel admin toko e-commerce Tenunan Songket. Peningkatan mencakup dashboard modern dengan visualisasi data, sidebar dengan tema budaya, manajemen pengguna lengkap, pengaturan ekspedisi dan pembayaran, serta manajemen versi aplikasi.

## Arsitektur

### Struktur Komponen

```
src/
├── app/admin/
│   ├── layout.tsx                    # Layout admin dengan sidebar baru
│   ├── page.tsx                      # Dashboard utama (enhanced)
│   ├── users/
│   │   ├── page.tsx                  # Daftar pelanggan
│   │   └── admins/
│   │       └── page.tsx              # Daftar & kelola admin
│   ├── settings/
│   │   ├── page.tsx                  # Pengaturan situs
│   │   ├── shipping/
│   │   │   └── page.tsx              # Pengaturan ekspedisi
│   │   ├── payments/
│   │   │   └── page.tsx              # Pengaturan pembayaran
│   │   └── version/
│   │       └── page.tsx              # Manajemen versi
│   └── ... (existing pages)
├── components/admin/
│   ├── AdminSidebar.tsx              # Sidebar redesigned
│   ├── DashboardStats.tsx            # Stats cards (enhanced)
│   ├── SalesChart.tsx                # NEW: Grafik penjualan
│   ├── StockAlerts.tsx               # NEW: Alert stok rendah
│   ├── TopProducts.tsx               # NEW: Produk terlaris
│   ├── OrderStatusSummary.tsx        # NEW: Ringkasan status pesanan
│   ├── AdminForm.tsx                 # NEW: Form tambah admin
│   ├── ShippingProviderList.tsx      # NEW: Daftar ekspedisi
│   ├── PaymentMethodList.tsx         # NEW: Daftar pembayaran
│   ├── SiteSettingsForm.tsx          # NEW: Form pengaturan situs
│   └── VersionManager.tsx            # NEW: Manajemen versi
└── lib/supabase/
    ├── admin.ts                      # Enhanced admin functions
    ├── settings.ts                   # NEW: Site settings functions
    ├── shipping-settings.ts          # NEW: Shipping provider functions
    └── payment-settings.ts           # NEW: Payment settings functions
```

### Database Schema (Tabel Baru)

```sql
-- Tabel pengaturan situs
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(100) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel penyedia ekspedisi
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

-- Tabel metode pembayaran
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'stripe', 'bank_transfer', 'manual'
  config JSONB DEFAULT '{}',
  instructions TEXT,
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel versi aplikasi
CREATE TABLE app_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version VARCHAR(20) NOT NULL,
  release_notes TEXT,
  is_mandatory BOOLEAN DEFAULT false,
  is_current BOOLEAN DEFAULT false,
  released_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Komponen dan Antarmuka

### 1. AdminSidebar (Redesigned)

```typescript
interface SidebarMenuItem {
  name: string
  href: string
  icon: LucideIcon
  badge?: number
}

interface SidebarMenuGroup {
  title: string
  items: SidebarMenuItem[]
}

// Menu groups structure
const menuGroups: SidebarMenuGroup[] = [
  {
    title: 'Utama',
    items: [
      { name: 'Dashboard', href: '/admin', icon: LayoutDashboard }
    ]
  },
  {
    title: 'Katalog',
    items: [
      { name: 'Produk', href: '/admin/products', icon: Package },
      { name: 'Kategori', href: '/admin/categories', icon: FolderTree }
    ]
  },
  {
    title: 'Penjualan',
    items: [
      { name: 'Pesanan', href: '/admin/orders', icon: ShoppingCart },
      { name: 'Kupon', href: '/admin/coupons', icon: Tag }
    ]
  },
  {
    title: 'Pengguna',
    items: [
      { name: 'Admin', href: '/admin/users/admins', icon: Shield },
      { name: 'Pelanggan', href: '/admin/users', icon: Users }
    ]
  },
  {
    title: 'Pengaturan',
    items: [
      { name: 'Ekspedisi', href: '/admin/settings/shipping', icon: Truck },
      { name: 'Pembayaran', href: '/admin/settings/payments', icon: CreditCard },
      { name: 'Situs', href: '/admin/settings', icon: Settings },
      { name: 'Versi', href: '/admin/settings/version', icon: GitBranch }
    ]
  }
]
```

### 2. Dashboard Components

```typescript
// SalesChart Props
interface SalesChartProps {
  data: Array<{
    date: string
    revenue: number
    orders: number
  }>
  period: '7d' | '30d' | '90d'
}

// StockAlerts Props
interface StockAlertsProps {
  products: Array<{
    id: string
    title: string
    stock: number
    threshold: number
  }>
}

// TopProducts Props
interface TopProductsProps {
  products: Array<{
    id: string
    title: string
    sold: number
    revenue: number
    image_url: string
  }>
  period: '7d' | '30d' | '90d'
}

// OrderStatusSummary Props
interface OrderStatusSummaryProps {
  counts: Record<string, number>
  // pending, processing, shipped, delivered, cancelled
}
```

### 3. Settings Interfaces

```typescript
// Site Settings
interface SiteSettings {
  general: {
    site_name: string
    tagline: string
    logo_url: string
    favicon_url: string
  }
  contact: {
    email: string
    phone: string
    whatsapp: string
    address: string
  }
  social: {
    instagram: string
    facebook: string
    twitter: string
    tiktok: string
  }
  seo: {
    meta_title: string
    meta_description: string
    keywords: string[]
  }
}

// Shipping Provider
interface ShippingProvider {
  id: string
  name: string
  code: string
  logo_url: string
  services: Array<{
    code: string
    name: string
    estimated_days: string
    base_cost: number
  }>
  is_active: boolean
  display_order: number
}

// Payment Method
interface PaymentMethod {
  id: string
  name: string
  code: string
  type: 'stripe' | 'bank_transfer' | 'manual'
  config: {
    // For Stripe
    publishable_key?: string
    secret_key?: string
    // For Bank Transfer
    bank_accounts?: Array<{
      bank_name: string
      account_number: string
      account_holder: string
    }>
  }
  instructions: string
  is_active: boolean
  display_order: number
}

// App Version
interface AppVersion {
  id: string
  version: string
  release_notes: string
  is_mandatory: boolean
  is_current: boolean
  released_at: string
}
```

## Model Data

### Enhanced Dashboard Stats

```typescript
interface EnhancedDashboardStats {
  // Existing
  totalOrders: number
  totalRevenue: number
  totalCustomers: number
  totalProducts: number
  recentOrders: RecentOrder[]
  salesData: SalesDataPoint[]
  
  // New
  revenueComparison: {
    today: number
    yesterday: number
    thisWeek: number
    lastWeek: number
    thisMonth: number
    lastMonth: number
  }
  orderStatusCounts: Record<string, number>
  lowStockProducts: LowStockProduct[]
  topProducts: TopProduct[]
}

interface LowStockProduct {
  id: string
  title: string
  slug: string
  stock: number
  reserved_stock: number
  available_stock: number
  image_url: string
}

interface TopProduct {
  id: string
  title: string
  slug: string
  sold: number
  revenue: number
  image_url: string
}
```

### Admin User Management

```typescript
interface AdminUserCreate {
  email: string
  password: string
  full_name: string
}

interface AdminUserUpdate {
  full_name?: string
  is_active?: boolean
}

// Functions
async function createAdminUser(data: AdminUserCreate): Promise<{ success: boolean; error?: string }>
async function updateAdminUser(userId: string, data: AdminUserUpdate): Promise<boolean>
async function deleteAdminUser(userId: string): Promise<{ success: boolean; error?: string }>
async function getAdminUsers(): Promise<AdminUser[]>
```

## Properti Kebenaran

*Properti kebenaran adalah karakteristik atau perilaku yang harus benar di semua eksekusi valid dari sistem. Properti berfungsi sebagai jembatan antara spesifikasi yang dapat dibaca manusia dan jaminan kebenaran yang dapat diverifikasi mesin.*

### Property 1: Low Stock Products Filtering
*For any* set of products with varying stock levels and a given threshold, the low stock alert function SHALL return only products where `stock < threshold`, and the result set SHALL contain all such products.
**Validates: Requirements 1.4**

### Property 2: Revenue Period Comparison Calculation
*For any* set of order data with timestamps and amounts, the revenue comparison function SHALL correctly calculate totals for today, yesterday, this week, last week, this month, and last month periods, where each period's total equals the sum of order amounts within that period's date range.
**Validates: Requirements 1.5**

### Property 3: Top Products Sorting
*For any* set of products with sales data, the top products function SHALL return products sorted by total sold in descending order, limited to the specified count (default 5).
**Validates: Requirements 1.6**

### Property 4: Order Status Aggregation
*For any* set of orders with various statuses, the status summary function SHALL return accurate counts where the sum of all status counts equals the total number of orders.
**Validates: Requirements 1.7**

### Property 5: Recent Orders Sorting
*For any* set of orders, the recent orders function SHALL return orders sorted by created_at in descending order (newest first).
**Validates: Requirements 1.3**

### Property 6: Role-Based User Filtering
*For any* set of users with different roles, filtering by role 'admin' SHALL return only users with role='admin', and filtering by role 'customer' SHALL return only users with role='customer'.
**Validates: Requirements 3.1, 3.4**

### Property 7: User Search Functionality
*For any* search query string and set of users, the search function SHALL return only users where the name or email contains the query string (case-insensitive).
**Validates: Requirements 3.5**

### Property 8: Admin Creation with Correct Role
*For any* valid admin creation request, after successful creation, querying the user SHALL return a profile with role='admin'.
**Validates: Requirements 3.3**

### Property 9: Role Update Persistence
*For any* user and valid role value, after updating the user's role, querying the user SHALL return the new role value.
**Validates: Requirements 3.8**

### Property 10: Settings CRUD Round-Trip
*For any* valid settings object (shipping provider, payment method, or site settings), saving then retrieving the settings SHALL return an equivalent object.
**Validates: Requirements 4.3, 6.6**

### Property 11: Active Items Filter for Checkout
*For any* set of shipping providers or payment methods with varying is_active status, the checkout options function SHALL return only items where is_active=true.
**Validates: Requirements 4.7, 5.6**

### Property 12: Stripe API Key Security
*For any* payment method configuration containing Stripe secret_key, the client-facing API response SHALL NOT include the secret_key field.
**Validates: Requirements 5.4**

### Property 13: Multiple Services Per Shipping Provider
*For any* shipping provider with multiple services, saving and retrieving the provider SHALL preserve all services with their respective codes, names, estimated_days, and base_cost values.
**Validates: Requirements 4.5**

### Property 14: Multiple Bank Accounts Per Payment Method
*For any* bank transfer payment method with multiple bank accounts, saving and retrieving the method SHALL preserve all bank accounts with their respective bank_name, account_number, and account_holder values.
**Validates: Requirements 5.5**

### Property 15: Mandatory Version Update Enforcement
*For any* app version marked as is_mandatory=true and is_current=true, the version check function SHALL return requires_update=true for any client version less than the current version.
**Validates: Requirements 7.3**

### Property 16: Version Comparison for Update Check
*For any* two semantic version strings, the version comparison function SHALL correctly determine if the client version is less than, equal to, or greater than the server version.
**Validates: Requirements 7.4**

## Penanganan Error

### Dashboard Errors
- Jika gagal memuat statistik dashboard, tampilkan pesan error dengan opsi retry
- Jika data chart kosong, tampilkan placeholder "Belum ada data penjualan"
- Jika gagal memuat low stock products, tampilkan warning tanpa mengganggu dashboard lain

### User Management Errors
- Jika gagal membuat admin (email sudah ada), tampilkan pesan "Email sudah terdaftar"
- Jika mencoba menghapus admin terakhir, tampilkan pesan "Tidak dapat menghapus admin terakhir"
- Jika gagal update role, tampilkan pesan error dengan detail

### Settings Errors
- Jika gagal menyimpan pengaturan, tampilkan pesan error dan pertahankan form state
- Jika upload logo gagal, tampilkan pesan "Gagal mengupload gambar" dengan alasan
- Jika Stripe API key tidak valid, tampilkan pesan "API key tidak valid"

### Version Management Errors
- Jika gagal membuat versi baru, tampilkan pesan error
- Jika format versi tidak valid (bukan semver), tampilkan pesan "Format versi tidak valid (gunakan x.y.z)"

## Strategi Pengujian

### Unit Tests
- Test fungsi kalkulasi revenue comparison
- Test fungsi filtering low stock products
- Test fungsi sorting top products
- Test fungsi aggregasi order status
- Test fungsi search users
- Test fungsi version comparison
- Test validasi form inputs

### Property-Based Tests
Menggunakan library `fast-check` untuk TypeScript:

1. **Dashboard Data Tests**
   - Property 1-5: Test dengan generated order dan product data

2. **User Management Tests**
   - Property 6-9: Test dengan generated user data dan role combinations

3. **Settings Tests**
   - Property 10-14: Test dengan generated settings objects

4. **Version Tests**
   - Property 15-16: Test dengan generated version strings

### Integration Tests
- Test CRUD operations untuk shipping providers
- Test CRUD operations untuk payment methods
- Test CRUD operations untuk site settings
- Test admin user creation flow
- Test version update flow

### E2E Tests (Manual/Playwright)
- Test sidebar navigation
- Test dashboard responsiveness
- Test form submissions
- Test error states

