# Master Plan: Fitur Kategori Warna Produk

**Tanggal:** 5 April 2026  
**Status:** COMPLETED  
**Prioritas:** High  
**Last Updated:** 5 April 2026, 15:00 WIB

---

## Progress Tracker

| Phase | Status | Tanggal Selesai |
|-------|--------|-----------------|
| Phase 1: Database & Backend | ✅ COMPLETED | 5 April 2026 |
| Phase 2: Admin Panel | ✅ COMPLETED | 5 April 2026 |
| Phase 3: Product Filter | ✅ COMPLETED | 5 April 2026 |
| Phase 4: Filter UI | ✅ COMPLETED | 5 April 2026 |
| Phase 5: Product Display | ✅ COMPLETED | 5 April 2026 |
| Phase 6: SEO & Performance | ✅ COMPLETED | 5 April 2026 |

---

## Phase 1 Completion Summary ✅

### Database Tables Created:
- ✅ `colors` table - stores color definitions
- ✅ `product_colors` junction table - links products to colors

### Indexes Added:
- ✅ `idx_product_colors_product` on product_colors(product_id)
- ✅ `idx_product_colors_color` on product_colors(color_id)
- ✅ `idx_colors_slug` on colors(slug)
- ✅ `idx_colors_active` partial index

### RLS Policies:
- ✅ Public can view active colors
- ✅ Admin can manage colors
- ✅ Public can view product_colors
- ✅ Admin can manage product_colors

### Seeded Colors (15 warna):
| Nama | Slug | Hex Code |
|------|------|----------|
| Merah | merah | #C41E3A |
| Merah Maroon | merah-maroon | #800000 |
| Emas | emas | #FFD700 |
| Kuning | kuning | #FFCC00 |
| Hijau | hijau | #228B22 |
| Hijau Tua | hijau-tua | #006400 |
| Biru | biru | #0066CC |
| Biru Tua | biru-tua | #00008B |
| Ungu | ungu | #800080 |
| Hitam | hitam | #1A1A1A |
| Putih | putih | #FFFFFF |
| Coklat | coklat | #8B4513 |
| Orange | orange | #FF6600 |
| Pink | pink | #FF69B4 |
| Silver | silver | #C0C0C0 |

### TypeScript Files Created/Updated:
- ✅ `src/lib/supabase/types.ts` - Added Color, ProductColor types
- ✅ `src/lib/supabase/colors.ts` - Color service functions (NEW)

### Service Functions Available:
- `getColors()` - Get all active colors (server)
- `getColorBySlug(slug)` - Get single color (server)
- `getProductColors(productId)` - Get product colors (server)
- `getProductsColors(productIds)` - Batch get colors (server)
- `getAllColorsClient()` - Get all colors inc. inactive (client/admin)
- `getColorsClient()` - Get active colors (client)
- `createColor(data)` - Create color (admin)
- `updateColor(id, data)` - Update color (admin)
- `deleteColor(id)` - Delete color (admin)
- `setProductColors(productId, colorIds, primaryId)` - Set product colors (admin)
- `getProductColorsClient(productId)` - Get product colors (client)
- `reorderColors(orders)` - Reorder colors (admin)

---

## Phase 2 Completion Summary ✅

### Admin Color Management Page Created:
- ✅ `/admin/colors` page with full CRUD functionality
- ✅ Color list with hex preview circles
- ✅ Add/Edit colors with color picker
- ✅ Delete colors with confirmation
- ✅ Toggle active/inactive status
- ✅ Reorder colors via drag handles (display_order)

### ProductForm Updated:
- ✅ Color multi-select dropdown with search
- ✅ Visual color circles in dropdown options
- ✅ Selected colors shown as removable badges
- ✅ Primary color selection (star icon toggle)
- ✅ Saves to `product_colors` junction table

### Admin Navigation Updated:
- ✅ "Warna" menu item added to `AdminSidebar.tsx` (desktop)
- ✅ "Warna" menu item added to `MobileSidebar.tsx` (mobile)
- ✅ Using Palette icon from lucide-react

### Files Created:
- `src/app/admin/colors/page.tsx` - Color management page
- `src/components/admin/ColorManagement.tsx` - Color CRUD component

### Files Modified:
- `src/components/admin/ProductForm.tsx` - Added color multi-select
- `src/components/admin/AdminSidebar.tsx` - Added Warna menu
- `src/components/admin/MobileSidebar.tsx` - Added Warna menu

---

## Phase 3 Completion Summary ✅

### Types Updated:
- ✅ `FilterState` in `src/lib/types.ts` - Added `colors: string[]`
- ✅ `ProductFilters` in `src/lib/types.ts` - Added `colors?: string[]`
- ✅ `ProductFilters` in `src/lib/supabase/products.ts` - Added `colorSlugs?: string[]`

### Hook Updated:
- ✅ `useProductFilters.ts` - Added color URL sync
  - Parse `colors` param from URL (comma-separated slugs)
  - Serialize colors to URL params
  - Added `toggleColor(colorSlug)` function
  - Updated `activeFilterCount` to include colors
  - Updated `DEFAULT_FILTER_STATE` with empty colors array

### API Route Updated:
- ✅ `src/app/api/products/route.ts`
  - Parse `colors` query param (comma-separated)
  - Pass `colorSlugs` to `getProducts()`

### Product Query Updated:
- ✅ `src/lib/supabase/products.ts` - `getProducts()`
  - Filter by color slugs using OR logic
  - First lookup color IDs from slugs
  - Then get product IDs from product_colors junction
  - Filter products by those IDs

### URL Format:
- `/products?colors=merah,emas` - Filter by multiple colors (OR logic)

---

## Phase 4 Completion Summary ✅

### ColorFilter Component Created:
- ✅ `src/components/product/ColorFilter.tsx` - Clickable color circles with checkmark selection
- ✅ `isLightColor` helper for contrast-aware checkmark color

### ProductFilters Updated:
- ✅ Added ColorFilter section between categories and price range
- ✅ Active filter badges show hex dot + color name + remove button

### MobileFilterSheet Updated:
- ✅ Color circles in scrollable filter content
- ✅ `isLightColor` helper function added
- ✅ Color active filter badges in Active Filters Preview section
- ✅ Color toggle handler integrated with local filter state

### Products Page Updated:
- ✅ Fetches colors via dynamic import of `getColorsClient`
- ✅ Passes `colors` and `toggleColor` to `ProductFilters`

---

## Phase 5 Completion Summary ✅

### ColorDots Component Created:
- ✅ `src/components/product/ColorDots.tsx` - Reusable color dots display
  - Configurable max visible dots (default 5)
  - "+N" overflow indicator
  - Primary color ring highlight
  - Two sizes: sm and md

### ProductCard Updated:
- ✅ Accepts optional `colors` prop (`ProductColorDot[]`)
- ✅ Shows ColorDots between rating/sold row and price

### ProductGrid Updated:
- ✅ Accepts optional `productColors` prop (`Map<string, ProductColorDot[]>`)
- ✅ Passes per-product colors to each ProductCard

### Products Page Updated:
- ✅ Batch-fetches product colors via `getProductsColorsClient()` after products load
- ✅ Passes `productColors` map to ProductGrid

### Product Detail Page Updated:
- ✅ Fetches product colors server-side via `getProductColors()`
- ✅ Displays all colors with hex dots, names, and "Utama" badge for primary
- ✅ Colors sorted: primary first, then alphabetical

### New Client Function:
- ✅ `getProductsColorsClient()` in `colors.client.ts` - Batch fetch colors for multiple products

### Files Created:
- `src/components/product/ColorDots.tsx`

### Files Modified:
- `src/components/product/ProductCard.tsx` - Added colors prop and ColorDots display
- `src/components/product/ProductGrid.tsx` - Added productColors prop, passes to ProductCard
- `src/app/(store)/products/page.tsx` - Fetches and passes product colors
- `src/app/(store)/products/[slug]/page.tsx` - Server-side color display
- `src/lib/supabase/colors.client.ts` - Added getProductsColorsClient()

---

## Phase 6 Completion Summary ✅

### SEO Enhancements:
- ✅ Color names added to product JSON-LD structured data (`color` property)
- ✅ Color names added to product page meta keywords
- ✅ URL structure `/products?colors=merah,emas` already functional from Phase 3

### Performance Optimizations:
- ✅ `getColors()` server function cached with `unstable_cache` (10 min TTL, `colors` tag)
- ✅ Batch color fetching for product cards (single query for all visible products)

### Files Modified:
- `src/components/seo/ProductJsonLd.tsx` - Added optional `colors` prop, outputs Schema.org color
- `src/app/(store)/products/[slug]/page.tsx` - Passes colors to metadata and JSON-LD
- `src/lib/supabase/colors.server.ts` - getColors() wrapped with unstable_cache

---

## 1. Overview

Menambahkan fitur "Kategori Warna" untuk produk kain tenun songket. Setiap produk dapat memiliki **multiple warna** karena kain tenun memiliki kombinasi warna yang beragam. Fitur ini akan mempengaruhi:
- Filter produk di halaman katalog
- Tampilan detail produk
- Admin product management
- SEO dan pencarian

---

## 2. Database Schema Design

### 2.1 Tabel Baru: `colors`

```sql
CREATE TABLE colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,           -- "Merah", "Emas", "Biru Tua"
  slug VARCHAR(100) NOT NULL UNIQUE,    -- "merah", "emas", "biru-tua"
  hex_code VARCHAR(7),                  -- "#FF0000", "#FFD700"
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 2.2 Tabel Junction: `product_colors`

```sql
CREATE TABLE product_colors (
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  color_id UUID NOT NULL REFERENCES colors(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT false,     -- Warna dominan
  PRIMARY KEY (product_id, color_id)
);
```

### 2.3 Index untuk Performance

```sql
CREATE INDEX idx_product_colors_product ON product_colors(product_id);
CREATE INDEX idx_product_colors_color ON product_colors(color_id);
CREATE INDEX idx_colors_slug ON colors(slug);
CREATE INDEX idx_colors_active ON colors(is_active) WHERE is_active = true;
```

### 2.4 RLS Policies

```sql
-- Colors: Public read
ALTER TABLE colors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view active colors" ON colors FOR SELECT USING (is_active = true);
CREATE POLICY "Admin can manage colors" ON colors FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- Product Colors: Public read
ALTER TABLE product_colors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view product colors" ON product_colors FOR SELECT USING (true);
CREATE POLICY "Admin can manage product colors" ON product_colors FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
);
```

---

## 3. Predefined Color Palette (Warna Kain Tenun)

| Nama | Slug | Hex Code | Deskripsi |
|------|------|----------|-----------|
| Merah | merah | #C41E3A | Merah klasik tenun |
| Merah Maroon | merah-maroon | #800000 | Merah gelap/maroon |
| Emas | emas | #FFD700 | Warna emas/gold |
| Kuning | kuning | #FFCC00 | Kuning cerah |
| Hijau | hijau | #228B22 | Hijau daun |
| Hijau Tua | hijau-tua | #006400 | Hijau gelap |
| Biru | biru | #0066CC | Biru standar |
| Biru Tua | biru-tua | #00008B | Biru navy |
| Ungu | ungu | #800080 | Ungu/purple |
| Hitam | hitam | #1A1A1A | Hitam |
| Putih | putih | #FFFFFF | Putih |
| Coklat | coklat | #8B4513 | Coklat/brown |
| Orange | orange | #FF6600 | Orange |
| Pink | pink | #FF69B4 | Pink/merah muda |
| Silver | silver | #C0C0C0 | Silver/perak |

---

## 4. Implementation Phases

### Phase 1: Database & Backend (Hari 1)

#### Task 1.1: Migration - Create Tables
- [ ] Create `colors` table
- [ ] Create `product_colors` junction table
- [ ] Add indexes
- [ ] Add RLS policies

#### Task 1.2: Seed Default Colors
- [ ] Insert predefined color palette (15 warna)

#### Task 1.3: Update TypeScript Types
- [ ] Update `src/lib/supabase/types.ts`
- [ ] Update `src/lib/supabase/database.types.ts`
- [ ] Create `Color` and `ProductColor` interfaces

#### Task 1.4: Create Color Service Functions
- [ ] `src/lib/supabase/colors.ts`
  - `getColors()` - Get all active colors
  - `getColorBySlug(slug)` - Get single color
  - `getProductColors(productId)` - Get colors for a product
  - `setProductColors(productId, colorIds)` - Set colors for product
  - Admin functions: create, update, delete

---

### Phase 2: Admin Panel (Hari 1-2)

#### Task 2.1: Color Management Page
- [ ] `src/app/admin/colors/page.tsx`
  - List all colors with hex preview
  - Add/Edit/Delete colors
  - Reorder colors (drag & drop)
  - Color picker for hex code

#### Task 2.2: Update ProductForm
- [ ] `src/components/admin/ProductForm.tsx`
  - Add color multi-select dengan color preview
  - Option to mark primary color
  - Show selected colors as badges

#### Task 2.3: Admin Navigation
- [ ] Add "Warna" menu item under Products section

---

### Phase 3: Product Filter (Hari 2)

#### Task 3.1: Update Filter Types
- [ ] `src/lib/types.ts`
  - Add `colors: string[]` to `FilterState`

#### Task 3.2: Update Filter Hook
- [ ] `src/hooks/useProductFilters.ts`
  - Add colors to URL sync
  - Add `toggleColor()` function

#### Task 3.3: Update Products API
- [ ] `src/app/api/products/route.ts`
  - Parse `colors` query param
  - Pass to getProducts

#### Task 3.4: Update Product Query
- [ ] `src/lib/supabase/products.ts`
  - Add `colors?: string[]` to `ProductFilters`
  - Join with `product_colors` and filter
  - Include colors in product response

---

### Phase 4: Filter UI (Hari 2-3)

#### Task 4.1: Update ProductFilters Component
- [ ] `src/components/product/ProductFilters.tsx`
  - Add color filter section
  - Show colors as clickable circles with hex background
  - Show color name on hover
  - Checkmark for selected colors

#### Task 4.2: Mobile Filter
- [ ] Update mobile filter sheet if exists
- [ ] Add color filter dengan same UI

#### Task 4.3: Active Filter Tags
- [ ] Show selected colors as removable tags

---

### Phase 5: Product Display (Hari 3)

#### Task 5.1: ProductCard Enhancement
- [ ] `src/components/product/ProductCard.tsx`
  - Show color dots (max 5) below product image
  - Tooltip showing color names

#### Task 5.2: Product Detail Page
- [ ] `src/app/(store)/products/[slug]/page.tsx`
  - Show all colors with names
  - Primary color highlighted

#### Task 5.3: Product Grid/List
- [ ] Ensure colors loaded in product queries

---

### Phase 6: SEO & Performance (Hari 3)

#### Task 6.1: URL Structure
- [ ] Support `/products?colors=merah,emas`
- [ ] Canonical URLs with color filters

#### Task 6.2: Meta Tags
- [ ] Include color info in product structured data
- [ ] Color filter page titles: "Produk Warna Merah - Tenunan Songket"

#### Task 6.3: Caching
- [ ] Cache colors list (rarely changes)
- [ ] Efficient product-color joins

---

## 5. Files to Create/Modify

### New Files
| File | Purpose |
|------|---------|
| `src/lib/supabase/colors.ts` | Color service functions |
| `src/app/admin/colors/page.tsx` | Color management admin page |
| `src/components/admin/ColorManagement.tsx` | Color CRUD component |
| `src/components/product/ColorFilter.tsx` | Color filter UI component |
| `src/components/product/ColorDots.tsx` | Color display dots component |

### Modified Files
| File | Changes |
|------|---------|
| `src/lib/supabase/types.ts` | Add Color, ProductColor types |
| `src/lib/types.ts` | Add colors to FilterState |
| `src/hooks/useProductFilters.ts` | Handle colors in URL |
| `src/lib/supabase/products.ts` | Filter by colors, include colors in response |
| `src/app/api/products/route.ts` | Parse colors param |
| `src/components/product/ProductFilters.tsx` | Add color filter section |
| `src/components/admin/ProductForm.tsx` | Add color multi-select |
| `src/components/product/ProductCard.tsx` | Show color dots |
| `src/app/(store)/products/[slug]/page.tsx` | Show colors |
| `src/app/admin/layout.tsx` | Add colors menu |

---

## 6. UI/UX Design

### 6.1 Color Filter (Desktop Sidebar)
```
┌─────────────────────────────┐
│ Warna                       │
├─────────────────────────────┤
│ ● ● ● ● ●                   │
│ ○ ○ ○ ○ ○                   │
│ ○ ○ ○ ○ ○                   │
│                             │
│ [✓] Merah  [✓] Emas         │
└─────────────────────────────┘
```

### 6.2 ProductCard Color Dots
```
┌─────────────────────┐
│   [Product Image]   │
│                     │
│ ● ● ● ● +2          │
├─────────────────────┤
│ Product Title       │
│ RM 450.00           │
└─────────────────────┘
```

### 6.3 Admin Color Picker
```
┌─────────────────────────────────────┐
│ Warna Produk                        │
├─────────────────────────────────────┤
│ Pilih warna yang ada di produk:     │
│                                     │
│ [●] Merah (Primary)                 │
│ [●] Emas                            │
│ [○] Hijau                           │
│ [●] Hitam                           │
│                                     │
│ Selected: 3 warna                   │
└─────────────────────────────────────┘
```

---

## 7. API Endpoints

### GET `/api/colors`
Response: List all active colors

### GET `/api/products?colors=merah,emas`
Filter products by color slugs (OR logic - any of the colors)

### Admin Routes
- `GET /api/admin/colors` - All colors (including inactive)
- `POST /api/admin/colors` - Create color
- `PATCH /api/admin/colors/[id]` - Update color
- `DELETE /api/admin/colors/[id]` - Delete color

---

## 8. Testing Checklist

### Database
- [ ] Colors CRUD works
- [ ] Product-color junction works
- [ ] RLS policies correct

### Admin
- [ ] Can create/edit/delete colors
- [ ] Can assign colors to products
- [ ] Primary color selection works

### Frontend
- [ ] Color filter appears and works
- [ ] URL syncs with color selection
- [ ] Products filter correctly
- [ ] Color dots display on cards
- [ ] Product detail shows colors

### Performance
- [ ] Color filter doesn't slow queries
- [ ] Colors cached properly

---

## 9. Rollback Plan

Jika ada masalah:
1. Remove color filter from UI (hide, don't delete)
2. Keep database tables (no data loss)
3. Revert ProductFilters.tsx to previous version
4. Products still work without colors

---

## 10. Estimated Timeline

| Phase | Durasi | Status |
|-------|--------|--------|
| Phase 1: Database & Backend | 4 jam | Pending |
| Phase 2: Admin Panel | 6 jam | Pending |
| Phase 3: Product Filter | 4 jam | Pending |
| Phase 4: Filter UI | 4 jam | Pending |
| Phase 5: Product Display | 3 jam | Pending |
| Phase 6: SEO & Performance | 2 jam | Pending |
| **Total** | **~23 jam** | |

---

## 11. Dependencies

- Supabase MCP untuk database operations
- shadcn/ui components (Checkbox, Badge, Popover)
- Color picker library (optional, can use HTML input type="color")

---

## 12. Notes

- Warna adalah **filter**, bukan variant yang mempengaruhi harga/stok
- Satu produk bisa punya multiple warna (many-to-many)
- Primary color untuk highlight/display utama
- Filter dengan OR logic: produk yang memiliki SALAH SATU warna yang dipilih
