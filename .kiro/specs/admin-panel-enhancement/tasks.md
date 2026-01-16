# Rencana Implementasi: Admin Panel Enhancement

## Gambaran Umum

Implementasi peningkatan panel admin Tenunan Songket mencakup dashboard modern, sidebar dengan tema budaya, manajemen pengguna, pengaturan ekspedisi/pembayaran, dan manajemen versi aplikasi.

## Tasks

- [x] 1. Setup Database Schema dan Migrasi
  - [x] 1.1 Buat migrasi SQL untuk tabel `site_settings`
    - Buat tabel dengan kolom: id, key, value (JSONB), created_at, updated_at
    - Tambahkan unique constraint pada key
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.8_
  
  - [x] 1.2 Buat migrasi SQL untuk tabel `shipping_providers`
    - Buat tabel dengan kolom: id, name, code, logo_url, services (JSONB), is_active, display_order, created_at, updated_at
    - Tambahkan unique constraint pada code
    - Insert data seed untuk ekspedisi Indonesia (JNE, J&T, SiCepat, Pos Indonesia, Anteraja, Ninja Express)
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 1.3 Buat migrasi SQL untuk tabel `payment_methods`
    - Buat tabel dengan kolom: id, name, code, type, config (JSONB), instructions, is_active, display_order, created_at, updated_at
    - Tambahkan unique constraint pada code
    - Insert data seed untuk Stripe dan Bank Transfer
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [x] 1.4 Buat migrasi SQL untuk tabel `app_versions`
    - Buat tabel dengan kolom: id, version, release_notes, is_mandatory, is_current, released_at, created_at
    - Insert versi awal 1.0.0
    - _Requirements: 7.1, 7.2_
  
  - [x] 1.5 Update `src/lib/supabase/types.ts` dengan tipe baru
    - Tambahkan interface untuk semua tabel baru
    - _Requirements: All_

- [x] 2. Implementasi Supabase Functions untuk Settings
  - [x] 2.1 Buat `src/lib/supabase/settings.ts` untuk site settings
    - Implementasi getSiteSettings(), updateSiteSettings()
    - Implementasi uploadLogo() dengan Supabase Storage
    - _Requirements: 6.1, 6.5, 6.6_
  
  - [x] 2.2 Write property test untuk site settings round-trip
    - **Property 10: Settings CRUD Round-Trip**
    - **Validates: Requirements 6.6**
  
  - [x] 2.3 Buat `src/lib/supabase/shipping-settings.ts`
    - Implementasi getShippingProviders(), createShippingProvider(), updateShippingProvider(), deleteShippingProvider()
    - Implementasi getActiveShippingProviders() untuk checkout
    - _Requirements: 4.1, 4.3, 4.4, 4.5, 4.7_
  
  - [x] 2.4 Write property test untuk shipping providers
    - **Property 11: Active Items Filter for Checkout**
    - **Property 13: Multiple Services Per Shipping Provider**
    - **Validates: Requirements 4.5, 4.7**
  
  - [x] 2.5 Buat `src/lib/supabase/payment-settings.ts`
    - Implementasi getPaymentMethods(), createPaymentMethod(), updatePaymentMethod(), deletePaymentMethod()
    - Implementasi getActivePaymentMethods() untuk checkout (tanpa secret keys)
    - _Requirements: 5.1, 5.4, 5.5, 5.6_
  
  - [x] 2.6 Write property test untuk payment methods
    - **Property 12: Stripe API Key Security**
    - **Property 14: Multiple Bank Accounts Per Payment Method**
    - **Validates: Requirements 5.4, 5.5**

- [x] 3. Checkpoint - Pastikan semua migrasi dan functions berjalan
  - Jalankan migrasi di Supabase
  - Verifikasi tabel terbuat dengan benar
  - Test functions dasar
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Implementasi Enhanced Dashboard
  - [x] 4.1 Update `src/lib/supabase/admin.ts` dengan fungsi dashboard baru
    - Tambahkan getLowStockProducts(threshold)
    - Tambahkan getTopProducts(limit, period)
    - Tambahkan getRevenueComparison()
    - Update getDashboardStats() untuk include data baru
    - _Requirements: 1.4, 1.5, 1.6, 1.7_
  
  - [x] 4.2 Write property tests untuk dashboard functions
    - **Property 1: Low Stock Products Filtering**
    - **Property 2: Revenue Period Comparison Calculation**
    - **Property 3: Top Products Sorting**
    - **Property 4: Order Status Aggregation**
    - **Property 5: Recent Orders Sorting**
    - **Validates: Requirements 1.3, 1.4, 1.5, 1.6, 1.7**
  
  - [x] 4.3 Buat komponen `src/components/admin/SalesChart.tsx`
    - Gunakan Recharts untuk visualisasi
    - Support period selector (7d, 30d, 90d)
    - Tampilkan revenue dan orders dalam dual-axis chart
    - _Requirements: 1.2_
  
  - [x] 4.4 Buat komponen `src/components/admin/StockAlerts.tsx`
    - Tampilkan daftar produk dengan stok rendah
    - Include link ke halaman edit produk
    - _Requirements: 1.4_
  
  - [x] 4.5 Buat komponen `src/components/admin/TopProducts.tsx`
    - Tampilkan top 5 produk dengan gambar, nama, sold, revenue
    - Support period selector
    - _Requirements: 1.6_
  
  - [x] 4.6 Buat komponen `src/components/admin/OrderStatusSummary.tsx`
    - Tampilkan donut/pie chart untuk distribusi status
    - Tampilkan count per status
    - _Requirements: 1.7_
  
  - [x] 4.7 Update `src/components/admin/DashboardStats.tsx`
    - Redesign dengan tema amber/gold
    - Tambahkan comparison indicators (up/down arrows)
    - _Requirements: 1.1, 1.8_
  
  - [x] 4.8 Update `src/app/admin/page.tsx` dengan layout dashboard baru
    - Integrate semua komponen baru
    - Responsive grid layout
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 5. Checkpoint - Verifikasi Dashboard
  - Test tampilan dashboard di berbagai ukuran layar
  - Verifikasi data ditampilkan dengan benar
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Redesain Sidebar Menu
  - [x] 6.1 Update `src/components/admin/AdminSidebar.tsx`
    - Implementasi menu groups structure
    - Tambahkan tema amber/gold yang konsisten dengan header
    - Tambahkan logo Tenunan Songket
    - Implementasi hover effects dan active states
    - Tambahkan footer dengan versi dan logout
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  
  - [x] 6.2 Buat komponen `src/components/admin/MobileSidebar.tsx`
    - Implementasi drawer untuk mobile
    - Implementasi icon-only collapsed mode untuk tablet
    - _Requirements: 2.8_
  
  - [x] 6.3 Update `src/app/admin/layout.tsx`
    - Integrate MobileSidebar
    - Responsive layout handling
    - _Requirements: 8.1, 8.2_

- [x] 7. Implementasi User Management
  - [x] 7.1 Update `src/lib/supabase/admin.ts` dengan fungsi user management
    - Tambahkan getAdminUsers() untuk filter role=admin
    - Tambahkan createAdminUser()
    - Tambahkan updateUserRole()
    - Tambahkan deleteAdminUser() dengan validasi admin terakhir
    - _Requirements: 3.1, 3.2, 3.3, 3.7, 3.8_
  
  - [x] 7.2 Write property tests untuk user management
    - **Property 6: Role-Based User Filtering**
    - **Property 7: User Search Functionality**
    - **Property 8: Admin Creation with Correct Role**
    - **Property 9: Role Update Persistence**
    - **Validates: Requirements 3.1, 3.3, 3.4, 3.5, 3.8**
  
  - [x] 7.3 Buat halaman `src/app/admin/users/admins/page.tsx`
    - Tampilkan daftar admin
    - Form tambah admin baru
    - Tombol hapus admin (dengan konfirmasi)
    - _Requirements: 3.1, 3.2, 3.3, 3.7_
  
  - [x] 7.4 Update `src/app/admin/users/page.tsx`
    - Enhance tampilan daftar pelanggan
    - Tambahkan link ke detail pelanggan
    - _Requirements: 3.4, 3.5, 3.6_

- [x] 8. Checkpoint - Verifikasi User Management
  - Test tambah admin baru
  - Test hapus admin (termasuk edge case admin terakhir)
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Implementasi Settings Pages
  - [x] 9.1 Buat halaman `src/app/admin/settings/shipping/page.tsx`
    - Tampilkan daftar shipping providers
    - Form tambah/edit provider
    - Toggle aktif/nonaktif
    - Manage services per provider
    - _Requirements: 4.1, 4.3, 4.4, 4.5, 4.6_
  
  - [x] 9.2 Buat halaman `src/app/admin/settings/payments/page.tsx`
    - Tampilkan daftar payment methods
    - Form konfigurasi Stripe (API keys)
    - Form konfigurasi bank transfer (multiple accounts)
    - Toggle aktif/nonaktif
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7_
  
  - [x] 9.3 Buat halaman `src/app/admin/settings/page.tsx`
    - Form pengaturan general (nama, tagline, logo, favicon)
    - Form pengaturan kontak
    - Form pengaturan media sosial
    - Form pengaturan SEO
    - Preview changes
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.8_

- [x] 10. Implementasi Version Management
  - [x] 10.1 Buat `src/lib/supabase/version.ts`
    - Implementasi getAppVersions(), getCurrentVersion()
    - Implementasi createVersion(), setCurrentVersion()
    - Implementasi checkForUpdate(clientVersion)
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.7_
  
  - [x] 10.2 Write property tests untuk version management
    - **Property 15: Mandatory Version Update Enforcement**
    - **Property 16: Version Comparison for Update Check**
    - **Validates: Requirements 7.3, 7.4**
  
  - [x] 10.3 Buat halaman `src/app/admin/settings/version/page.tsx`
    - Tampilkan versi saat ini dan riwayat
    - Form buat versi baru
    - Toggle mandatory update
    - Set current version
    - _Requirements: 7.1, 7.2, 7.3, 7.7_
  
  - [x] 10.4 Buat komponen `src/components/version/VersionChecker.tsx`
    - Check version on app load
    - Tampilkan modal jika update wajib
    - Simpan versi di localStorage
    - _Requirements: 7.4, 7.5_
  
  - [x] 10.5 Update `src/app/(store)/layout.tsx` untuk include VersionChecker
    - _Requirements: 7.4_

- [x] 11. Integrasi Checkout dengan Settings Baru
  - [x] 11.1 Update `src/components/checkout/ShippingSelector.tsx`
    - Gunakan getActiveShippingProviders() dari database
    - Tampilkan hanya provider yang aktif
    - _Requirements: 4.7_
  
  - [x] 11.2 Update `src/components/checkout/PaymentSelector.tsx`
    - Gunakan getActivePaymentMethods() dari database
    - Tampilkan hanya metode yang aktif
    - _Requirements: 5.6_

- [x] 12. Final Checkpoint - Testing Lengkap
  - Jalankan semua property tests
  - Test semua halaman admin
  - Test integrasi checkout dengan settings baru
  - Verifikasi responsivitas di mobile/tablet
  - Ensure all tests pass, ask the user if questions arise.

## Catatan

- Semua tasks wajib diimplementasikan termasuk property tests
- Setiap task mereferensikan requirements spesifik untuk traceability
- Checkpoints memastikan validasi incremental
- Property tests memvalidasi properti kebenaran universal
- Unit tests memvalidasi contoh spesifik dan edge cases
