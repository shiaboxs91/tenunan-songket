# Changelog

## v1.5.0 (2026-04-05) - Kategori Warna & Optimasi Upload Gambar

### Fitur Baru: Kategori Warna (Color Category)

Sistem kategori warna untuk produk songket. Produk boleh mempunyai pelbagai warna yang digunakan sebagai filter pencarian.

**Database & Backend:**
- Tabel `colors` (id, name, slug, hex_code, display_order) dengan RLS & indexes
- Tabel `product_colors` (many-to-many) dengan RLS & indexes
- 15 warna default diseeded (Merah, Emas, Hitam, Putih, Biru, Hijau, dll.)
- Service functions: `getColors()`, `getProductColors()`, `setProductColors()`
- `unstable_cache` pada `getColors()` dengan TTL 10 minit
- Filter warna pada `getProducts()` dengan logik OR (`?colors=merah,emas`)

**Admin Panel:**
- Halaman CRUD `/admin/colors` — tambah, edit, padam, reorder warna
- Multi-select warna pada `ProductForm` dengan color picker
- Menu "Warna" pada sidebar admin (desktop & mobile)

**Filter & UI Pelanggan:**
- `ColorFilter` component — bulatan warna clickable dengan badges aktif
- Integrasi pada `ProductFilters` (desktop) & `MobileFilterSheet` (mobile)
- URL sync: `?colors=merah,emas` — deeplink & back/forward support
- `ColorDots` component pada `ProductCard` & halaman detail produk

**SEO:**
- JSON-LD `color` property pada structured data produk
- Meta keywords dengan nama warna

**Fail Baru:**
- `src/lib/supabase/colors.server.ts`
- `src/lib/supabase/colors.client.ts`
- `src/lib/supabase/colors.ts`
- `src/app/admin/colors/page.tsx`
- `src/components/admin/ColorManagement.tsx`
- `src/components/product/ColorFilter.tsx`
- `src/components/product/ColorDots.tsx`

**Fail Diubah:**
- `src/lib/supabase/types.ts` — Color, ProductColor types
- `src/lib/supabase/products.ts` — color slug filtering
- `src/lib/types.ts` — FilterState.colors, ProductFilters.colors
- `src/hooks/useProductFilters.ts` — toggleColor(), URL sync
- `src/app/api/products/route.ts` — colors query param parsing
- `src/components/product/ProductFilters.tsx` — color filter section
- `src/components/product/MobileFilterSheet.tsx` — color filter section
- `src/components/product/ProductCard.tsx` — ColorDots display
- `src/components/product/ProductGrid.tsx` — productColors map passthrough
- `src/app/(store)/products/page.tsx` — fetch colors & product colors
- `src/app/(store)/products/[slug]/page.tsx` — server-side color display + SEO
- `src/components/seo/ProductJsonLd.tsx` — colors prop
- `src/components/admin/AdminSidebar.tsx` — menu Warna
- `src/components/admin/MobileSidebar.tsx` — menu Warna
- `src/components/admin/ProductForm.tsx` — color multi-select

---

### Fitur Baru: Optimasi Upload Gambar (Image Upload Optimization)

Kompresi gambar automatik sebelum upload ke Supabase Storage menggunakan `browser-image-compression`. Tiada lagi hard reject — gambar dikompresi secara pintar.

**Perubahan Utama:**
- Kompresi client-side automatik sebelum upload (menggunakan Web Workers)
- Hard limit 5MB dibuang → safety limit 20MB (gambar dikompresi sebelum upload)
- Hard limit 2MB avatar dibuang → kompresi automatik ke ~300KB
- `cacheControl` dinaikkan dari `3600` (1 jam) ke `31536000` (1 tahun) pada semua upload
- Preset kompresi: `product` (2048px, 1MB), `avatar` (512px, 300KB), `logo` (1024px, 500KB), `blog` (2048px, 1MB)
- GIF & fail <200KB dilangkau (tidak perlu kompresi)
- Fallback ke fail asal jika kompresi gagal atau hasilnya lebih besar

**Bug Fix:**
- Cipta `/api/upload` route yang hilang — blog editor image upload kini berfungsi
- Blog new, blog edit, blog categories, BlogEditor kini boleh upload gambar

**Fail Baru:**
- `src/lib/image-compression.ts` — utility kompresi dengan presets
- `src/app/api/upload/route.ts` — server-side upload route untuk blog

**Fail Diubah:**
- `src/lib/supabase/storage.ts` — buang 5MB limit, cacheControl 1 tahun
- `src/components/admin/ProductForm.tsx` — kompresi sebelum upload + toast info saiz
- `src/components/profile/ProfileForm.tsx` — buang 2MB limit, kompresi avatar
- `src/lib/supabase/profiles.ts` — cacheControl 1 tahun
- `src/lib/supabase/settings.ts` — cacheControl 1 tahun pada logo & favicon
- `src/app/admin/blog/new/page.tsx` — kompresi sebelum upload
- `src/app/admin/blog/[id]/edit/page.tsx` — kompresi sebelum upload
- `src/app/admin/blog/categories/page.tsx` — kompresi sebelum upload
- `src/components/admin/blog/BlogEditor.tsx` — kompresi sebelum upload

**Dependencies:**
- Tambah `browser-image-compression` ^2.x

---

## 2026-04-03 - Fix next-intl TimeZone Warning

### Summary
Fixed `ENVIRONMENT_FALLBACK` error from next-intl where timeZone was not configured for client-side provider.

### Error Fixed
```
IntlError: ENVIRONMENT_FALLBACK: There is no `timeZone` configured, 
this can lead to markup mismatches caused by environment differences.
```

### Changes
- `src/components/providers/IntlProvider.tsx` - Added `timeZone` prop with default `"Asia/Kuala_Lumpur"`
- `src/app/layout.tsx` - Explicitly pass `timeZone="Asia/Kuala_Lumpur"` to IntlProvider

### Notes
- PWA icons (`/icons/icon-*.png`) are missing but not critical for development
- The icons can be generated later using a tool like `pwa-asset-generator`

---

## 2026-04-03 - E-Commerce Modules Enhancement Plan

### Summary
Created comprehensive implementation plan for professional e-commerce modules based on codebase audit.

### Plan Document
Full implementation plan: `docs/plans/2026-04-03-ecommerce-modules-enhancement.md`

### Module Status (After Audit)

| Module | Current Status | Action Needed |
|--------|---------------|---------------|
| Product Reviews & Ratings | COMPLETE | None |
| Wishlist & Save for Later | COMPLETE | None |
| Product Variants | PARTIAL (UI only) | Backend implementation |
| Loyalty Program & Points | MISSING | Full implementation |
| Product Recommendations | PARTIAL | Enhancement |
| Order Tracking | PARTIAL | Courier API integration |
| Blog & Content | MISSING | Full implementation |

### Implementation Phases

1. **Phase 1: Product Variants** (2-3 weeks)
   - Database schema for variants
   - Admin variant management
   - Cart/order variant support

2. **Phase 2: Order Tracking** (1-2 weeks)
   - Courier API integration
   - Tracking timeline UI
   - WhatsApp/Email notifications

3. **Phase 3: Loyalty Program** (2-3 weeks)
   - Points earning/redemption
   - Tier system
   - Referral program

4. **Phase 4: Recommendations** (1-2 weeks)
   - "Frequently bought together"
   - Recently viewed
   - Personalized picks

5. **Phase 5: Blog CMS** (2 weeks)
   - Blog posts with rich editor
   - Categories & tags
   - Product embeds in articles

---

## 2026-04-03 - Product Filter & Quick View Fixes

### Summary
Fixed critical bugs on the `/products` page where category filters and quick view button were not working.

### Issues Fixed

#### 1. Category Filter Not Working
**Problem:** Selecting categories (e.g., "Bertabur [5]") showed "Tidak ada produk ditemukan" instead of filtering products.

**Root Cause:** The frontend sends category **names** (e.g., "Si Pugut") but the Supabase `getProducts` function expected **category_id** (UUID).

**Fix:** Updated `src/lib/supabase/products.ts`:
- Added `categoryName` and `categoryNames` to `ProductFilters` interface
- Modified `getProducts()` to lookup category IDs by name before filtering
- Supports both single and multiple category selection

**Fix:** Updated `src/app/api/products/route.ts`:
- Now passes `categoryNames` array instead of single `category` ID
- Removed client-side filtering hack for multiple categories

#### 2. Eye Button (Quick View) Not Working
**Problem:** Clicking the eye icon on product cards did nothing.

**Root Cause:** The `QuickViewModal` component was disabled/commented out, and the eye button only appeared when `onQuickView` prop was provided.

**Fix:** Updated `src/components/product/ProductCard.tsx`:
- Eye button now navigates directly to product detail page (`/products/[slug]`)
- Removed `onQuickView` prop dependency - button always shows on desktop
- Uses `useRouter` for programmatic navigation

### Files Modified
- `src/lib/supabase/products.ts` - Added categoryNames filter support
- `src/app/api/products/route.ts` - Use categoryNames for filtering
- `src/components/product/ProductCard.tsx` - Eye button navigates to detail page

### Verification
- Build successful with `npm run build`
- Category filter now properly filters products by name
- Eye button navigates to product detail on click
- Price range filter confirmed working (minPrice/maxPrice → API min/max params)
- In-stock filter confirmed working (inStockOnly → inStock=true → stock > 0)

---

## 2026-04-02 - SEO, Performance & Facebook Shop Integration (COMPLETED)

### Summary
Major update to optimize the website for Google search ranking, improve loading performance, and integrate Facebook Shop for product synchronization.

### Plan Document
Full implementation plan: `docs/plans/2026-04-02-seo-performance-facebook-shop.md`

### Phase 1: SEO Optimization
**Status: COMPLETE (8/8 tasks)**

**Target Keywords:**
- Primary: "beli kain songket online", "kain songket asli brunei", "kain tenunan melayu", "songket sarawak asli"
- Long-tail: "kain songket untuk majlis perkahwinan", "songket handmade berkualiti"
- Category: "songket brunei", "songket sarawak", "songket sambas", "kain sinjang", "kain betabur"

**Tasks:**
- [x] 1.1 Create robots.txt
- [x] 1.2 Create dynamic sitemap.ts
- [x] 1.3 Add generateMetadata for product pages
- [x] 1.4 Create JSON-LD components (Product, Breadcrumb, Organization)
- [x] 1.5 Integrate JSON-LD to product pages
- [x] 1.6 Add Organization JSON-LD to root layout
- [x] 1.7 Create Meta Pixel integration
- [x] 1.8 Update admin SEO settings (Meta Pixel ID + Google Analytics ID fields)

### Phase 2: Performance Optimization
**Status: COMPLETE**

**Tasks:**
- [x] 2.1 Convert product detail to ISR (revalidate: 60)
- [x] 2.2 Add ISR to homepage (revalidate: 300)
- [x] 2.3 Add preconnect hints for Supabase CDN, Vercel, Meta Pixel
- [x] 2.4 Image optimization already configured in next.config.mjs

### Phase 3: Facebook Shop Integration
**Status: COMPLETE (7/7 tasks)**

**Tasks:**
- [x] 3.1 Create database schema (fb_catalog_config, fb_catalog_products, fb_sync_logs)
- [x] 3.2 Create admin Facebook Shop module UI
- [x] 3.3 Create product sync component
- [x] 3.4 Create Supabase Edge Function for FB API (supabase/functions/fb-catalog-sync)
- [x] 3.5 Add Facebook Shop to admin sidebar
- [x] 3.6 Create sync API route (/api/admin/facebook-sync)
- [x] 3.7 Add auto-sync trigger on product update (migration: 20260402_fb_auto_sync_triggers.sql)

### Files Created This Session
- `src/app/admin/settings/page.tsx` - Updated with Meta Pixel ID & Google Analytics fields
- `src/lib/supabase/types.ts` - Updated SiteSettingsSEO interface
- `src/components/product/ProductReviewsSkeleton.tsx` - Skeleton for lazy loading
- `supabase/functions/fb-catalog-sync/index.ts` - Edge Function for Facebook API
- `src/app/api/admin/facebook-sync/route.ts` - API route for sync
- `supabase/migrations/20260402_fb_auto_sync_triggers.sql` - Auto-sync DB triggers
- `src/components/ui/alert.tsx` - shadcn Alert component
- `src/components/ui/table.tsx` - shadcn Table component

### Files Modified This Session
- `src/app/(store)/products/[slug]/page.tsx` - Changed force-dynamic to ISR (revalidate: 60)
- `src/app/(store)/page.tsx` - Added ISR (revalidate: 300)
- `src/app/layout.tsx` - Added preconnect hints for Supabase CDN, Vercel, Meta
- `src/lib/supabase/client.ts` - Import Database from database.types.ts
- `src/lib/supabase/server.ts` - Import Database from database.types.ts
- `src/components/admin/facebook/FacebookShopSettings.tsx` - Fixed null vs undefined types
- `src/components/admin/facebook/FacebookProductSync.tsx` - Fixed type issues
- `src/components/admin/facebook/FacebookSyncLogs.tsx` - Fixed type issues

### Environment Variables Required
```env
NEXT_PUBLIC_META_PIXEL_ID=your_pixel_id
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx (for Edge Function calls)
```

### Deployment Notes
1. Deploy Supabase Edge Function: `supabase functions deploy fb-catalog-sync`
2. Apply migration: `supabase migration up`
3. Set environment variables in Vercel/production

---

## 2026-02-05 - Address Form UX Simplification

### Summary
Simplified address form layout for better UX - all fields now stack vertically (single column) for clearer flow on both mobile and desktop. Dropdowns come first, then address input, then postal code.

### Field Order

**Malaysia:**
1. Country
2. Negeri (grouped dropdown)
3. Bandar/Pekan
4. Alamat
5. Detail Tambahan
6. Poskod

**Brunei:**
1. Country
2. Daerah
3. Mukim
4. Kampong (optional)
5. Alamat
6. Detail Tambahan
7. Poskod

**Singapore:**
1. Country
2. Address
3. Additional Details
4. Postal Code

### Changes Made
- Removed 2-column grid layouts for simpler flow
- Moved address/detail/postcode fields AFTER location dropdowns
- Each country now has its own complete field set in the correct order
- Profile AddressForm restructured to match GuestAddressForm pattern

### Files Modified
- `src/components/checkout/GuestAddressForm.tsx`
- `src/components/profile/AddressForm.tsx`

---

## 2026-02-05 - Address Form UX Improvements

### Summary
Enhanced the address forms (GuestAddressForm and AddressForm) with improved UX:
- Grouped Malaysia state dropdown by region (Semenanjung/Sabah/Sarawak)
- 2-column layout on desktop for related fields
- Better field ordering per country

### Changes Made

#### 1. Malaysia Data (`src/lib/data/address/malaysia.json`)
- Added `region` field to each state (semenanjung, sabah, sarawak)

#### 2. Address Helpers (`src/lib/data/address/index.ts`)
- Added `MalaysiaRegionCode` type
- Added `MALAYSIA_REGIONS` constant with display names
- Added `getMalaysiaStatesByRegion()` - returns states grouped by region
- Added `getMalaysiaRegion(stateCode)` - gets region for a state
- Updated `MalaysiaState` interface to include `region` field

#### 3. GuestAddressForm (`src/components/checkout/GuestAddressForm.tsx`)
- **Malaysia grouped dropdown**: Native `<select>` with `<optgroup>` for region grouping
- **2-column layout**: Phone & Email side by side on desktop
- **Brunei 2-column**: District & Mukim side by side on desktop
- **Malaysia 2-column**: City & Postcode side by side on desktop
- **Field ordering**: Country → Location fields → Address → Details → Postcode

#### 4. AddressForm (`src/components/profile/AddressForm.tsx`)
- Same UX improvements as GuestAddressForm
- **Malaysia grouped dropdown**: Native `<select>` with region groupings
- **2-column layouts**: District/Mukim and City/Postcode pairs
- Improved placeholder text for dependent fields

### Layout Summary

**Malaysia:**
| Desktop | Mobile |
|---------|--------|
| State (full width, grouped) | State |
| City | Postcode | City |
| Address | Postcode |
| Details | Address |
| | Details |

**Brunei:**
| Desktop | Mobile |
|---------|--------|
| District | Mukim | District |
| Kampong (optional) | Mukim |
| Address | Kampong |
| Details | Address |
| Postcode | Details |
| | Postcode |

### Files Modified
- `src/lib/data/address/malaysia.json`
- `src/lib/data/address/index.ts`
- `src/components/checkout/GuestAddressForm.tsx`
- `src/components/profile/AddressForm.tsx`

---

## 2026-02-05 - AddressForm Cascading Dropdowns

### Summary
Updated the profile AddressForm component to use cascading dropdowns for country-specific address fields, matching the GuestAddressForm implementation.

### Changes Made

#### 1. AddressForm (`src/components/profile/AddressForm.tsx`)
- **Added cascading dropdown imports**: Integrated address data helpers from `@/lib/data/address`
- **Extended form state**: Added `mukim` and `kampong` fields for Brunei-specific addresses
- **Memoized dropdown data**: Efficient data loading for Brunei districts/mukims/kampongs and Malaysia states/cities
- **Malaysia postcode auto-detect**: Automatically fills state and city when 5-digit postcode is entered
- **Country-specific UI**:
  - **Brunei**: District → Mukim → Kampong (optional) cascading dropdowns
  - **Malaysia**: Postcode → State → City cascading dropdowns
  - **Singapore**: Simplified form with just postal code (no state needed)
- **Updated validation logic**: Handles Brunei mukim requirement and Singapore state exemption
- **Code-to-name conversion**: Stores human-readable names (e.g., "Brunei-Muara", "Sabah") instead of codes
- **Reverse lookup on edit**: Converts stored names back to dropdown codes when editing existing addresses

### Shipping Compatibility
- Verified that shipping cost calculation (`stateToRegion()`) works with both:
  - State codes: `JHR`, `SBH`, `SWK`, `BM`, etc.
  - State names: `Johor`, `Sabah`, `Sarawak`, `Brunei-Muara`, etc.
- No changes needed to shipping calculation logic

### Files Modified
- `src/components/profile/AddressForm.tsx`

### Related Files (Previously Created)
- `src/lib/data/address/index.ts` - Helper functions
- `src/lib/data/address/brunei.json` - Brunei address data
- `src/lib/data/address/malaysia.json` - Malaysia address data
- `src/lib/data/address/singapore.json` - Singapore address data
- `src/components/checkout/GuestAddressForm.tsx` - Reference implementation

---

## 2026-02-05 - Guest Checkout Implementation Complete

### Summary
Completed the guest checkout feature allowing non-authenticated users to place orders.

### Changes Made

#### 1. Checkout Page (`src/app/(store)/checkout/page.tsx`)
- **Updated `handlePlaceOrder`**: Now allows guest checkout instead of redirecting to login
- **Added guest email validation**: Requires email for guest orders
- **Passes `guest_email` to `createOrder`**: Enables order creation with guest email
- **Conditional cart clearing**: Only clears server cart for authenticated users
- **Removed login prompt in Step 4**: Replaced with email confirmation display for guests
- **Enabled submit button for guests**: Removed `isAuthenticated === false` from disabled condition
- **Removed unused `LogIn` import**

#### 2. CheckoutAddressSection (`src/components/checkout/CheckoutAddressSection.tsx`)
- **Added email display in guest address summary**: Shows email alongside phone number

### Database Changes (Previously Applied)
- `orders.guest_email` column (VARCHAR 255)
- `orders.guest_phone` column (VARCHAR 50)
- `orders.user_id` made nullable
- RLS policies for anon role to insert/select guest orders

### Flow Summary
**Guest Checkout Flow:**
1. Add products to cart
2. Go to checkout
3. Click "Lanjut Sebagai Tamu"
4. Fill address form including email
5. Select shipping method
6. Select payment method
7. Review order (shows email confirmation notice)
8. Place order -> redirected to success page

### Files Modified
- `src/app/(store)/checkout/page.tsx`
- `src/components/checkout/CheckoutAddressSection.tsx`
