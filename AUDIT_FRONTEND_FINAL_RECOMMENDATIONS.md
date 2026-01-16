# Audit Frontend - Rekomendasi Final

**Tanggal:** 16 Januari 2026  
**Status:** 57% menggunakan database, 43% masih perlu perbaikan

## 🎯 Ringkasan Eksekutif

Audit menunjukkan bahwa **mayoritas komponen penting sudah menggunakan database**, namun masih ada beberapa area kritis yang menggunakan data dummy:

### ✅ Yang Sudah Baik (57 files)
- Cart system (100% database)
- Checkout flow (100% database)
- User accounts (100% database)
- Admin dashboard (100% database)
- Product listings (95% database)
- Reviews & wishlist (100% database)

### ⚠️ Yang Perlu Diperbaiki (43 files)

## 🔥 CRITICAL - Harus Diperbaiki Segera

### 1. Hero Slider (src/components/home/HeroSlider.tsx)

**Masalah:**
```typescript
const SLIDES = [
  {
    id: 1,
    image: "https://tenunansongket.com/...",
    alt: "Tenunan Songket Collection",
  },
  // ... hardcoded slides
];
```

**Solusi:**
```sql
-- Buat tabel di Supabase
CREATE TABLE hero_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  order_index INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert data existing
INSERT INTO hero_slides (title, image_url, order_index) VALUES
('Tenunan Songket Collection', 'https://tenunansongket.com/wp-content/uploads/2020/08/Untitled-Facebook-Cover-6-1.webp', 1),
('Model Songket Elegant', 'https://tenunansongket.com/wp-content/uploads/2023/09/were-open-1pm-till-late-14.png', 2),
('Songket Fashion', 'https://tenunansongket.com/wp-content/uploads/2023/09/were-open-1pm-till-late-10.png', 3);
```

**Update Component:**
```typescript
// src/lib/supabase/hero.ts
export async function getHeroSlides() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('hero_slides')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true });
  
  if (error) throw error;
  return data;
}

// src/components/home/HeroSlider.tsx
"use client";
import { useEffect, useState } from "react";
import { getHeroSlides } from "@/lib/supabase/hero";

export function HeroSlider() {
  const [slides, setSlides] = useState([]);
  
  useEffect(() => {
    getHeroSlides().then(setSlides);
  }, []);
  
  // ... rest of component
}
```

**Estimasi:** 2 jam  
**Priority:** HIGH

---

### 2. Category Images (src/components/layout/CategorySheet.tsx)

**Masalah:**
```typescript
import categoryData from "@/data/category-images.json";
import productsData from "@/data/products.snapshot.json";
```

**Solusi:**

1. **Upload images ke Supabase Storage:**
```typescript
// Script untuk migrate images
import { createClient } from '@supabase/supabase-js';
import categoryData from './src/data/category-images.json';

async function migrateImages() {
  const supabase = createClient(url, key);
  
  for (const category of categoryData.categories) {
    // Download image dari URL
    const response = await fetch(category.image);
    const blob = await response.blob();
    
    // Upload ke Supabase Storage
    const fileName = `categories/${category.name.toLowerCase().replace(/\s+/g, '-')}.jpg`;
    await supabase.storage
      .from('product-images')
      .upload(fileName, blob);
    
    // Update categories table
    await supabase
      .from('categories')
      .update({ image_url: fileName })
      .eq('name', category.name);
  }
}
```

2. **Update Component:**
```typescript
// src/components/layout/CategorySheet.tsx
"use client";
import { useEffect, useState } from "react";
import { getCategories } from "@/lib/supabase/categories-client";

export function CategorySheet({ open, onOpenChange }: CategorySheetProps) {
  const [categories, setCategories] = useState([]);
  
  useEffect(() => {
    getCategories().then(setCategories);
  }, []);
  
  // Use categories from database
  return (
    <div className="grid grid-cols-2 gap-3">
      {categories.map((category) => (
        <button key={category.id} onClick={() => handleCategorySelect(category.name)}>
          <Image src={category.image_url} alt={category.name} />
          <h3>{category.name}</h3>
          <p>{category.product_count} produk</p>
        </button>
      ))}
    </div>
  );
}
```

**Estimasi:** 3 jam  
**Priority:** HIGH

---

### 3. Homepage Category Images (src/app/(store)/page.tsx)

**Masalah:**
```typescript
import categoryImagesData from "@/data/category-images.json";

// Build category data with images from local config
const categoryImages = categoryImagesData.categories.reduce((acc, cat) => {
  acc[cat.name] = cat.image;
  return acc;
}, {} as Record<string, string>);
```

**Solusi:**
```typescript
// src/app/(store)/page.tsx
async function getHomeData() {
  // Fetch categories with images from database
  const categoriesWithCount = await getCategoriesWithProductCount();
  
  // No need for local JSON anymore
  const jenisCorak = categoriesWithCount.map(cat => ({
    name: cat.name,
    items: cat.product_count,
    image: cat.image_url, // From database
  }));

  return { jenisCorak };
}
```

**Estimasi:** 30 menit (setelah #2 selesai)  
**Priority:** HIGH

---

### 4. Products API Fallback (src/app/api/products/route.ts)

**Masalah:**
```typescript
import snapshotData from "@/data/products.snapshot.json";

try {
  // Fetch from Supabase
} catch (error) {
  console.error("Supabase fetch failed, falling back to snapshot:", error);
  // Use snapshot data
}
```

**Solusi:**
```typescript
// Remove fallback completely
export async function GET(request: NextRequest) {
  try {
    const supabaseResult = await getSupabaseProducts({...});
    const products = toFrontendProducts(supabaseResult.data);
    
    return NextResponse.json({
      products,
      total: supabaseResult.total,
      page: supabaseResult.page,
      pageSize: supabaseResult.limit,
      source: "database", // Changed from "snapshot"
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    // Return error instead of fallback
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
```

**Estimasi:** 15 menit  
**Priority:** MEDIUM

---

## 📊 Files yang OK untuk Tetap Hardcoded

### Navigation & Static Content
- `src/components/admin/AdminSidebar.tsx` - Menu items (static)
- `src/components/layout/Header.tsx` - Navigation links (static)
- `src/components/layout/Footer.tsx` - Footer content (static)

### Form Validation
- `src/components/auth/*.tsx` - Validation rules (static)
- `src/components/profile/AddressForm.tsx` - Form fields (static)

### UI Components
- `src/components/ui/*.tsx` - UI primitives (static)

### Static Pages
- `src/app/(store)/faq/page.tsx` - FAQ content (static)
- `src/app/(store)/cara-order/page.tsx` - How to order (static)
- `src/app/(store)/tentang-kami/page.tsx` - About us (static)

---

## 🎯 Action Plan

### Week 1: Critical Fixes
- [ ] Day 1-2: Setup hero_slides table & migrate HeroSlider
- [ ] Day 3-4: Upload category images to Storage & update categories table
- [ ] Day 5: Update CategorySheet & Homepage to use database

### Week 2: Cleanup
- [ ] Remove products.snapshot.json fallback
- [ ] Remove category-images.json file
- [ ] Update all imports
- [ ] Test all pages

### Week 3: Optimization
- [ ] Add caching for hero slides
- [ ] Add caching for categories
- [ ] Optimize image loading
- [ ] Add error boundaries

---

## 📈 Expected Results

**Before:**
- 57% database adoption
- 2 JSON files for static data
- Fallback logic in API

**After:**
- 95%+ database adoption
- 0 JSON files for dynamic data
- Clean error handling
- Easier content management via Supabase

---

## 🚀 Quick Start

1. **Activate Supabase Power:**
```bash
# In Kiro
kiroPowers action="activate" powerName="supabase-hosted"
```

2. **Create hero_slides table:**
```sql
-- Run in Supabase SQL Editor
CREATE TABLE hero_slides (...);
```

3. **Update components one by one**

4. **Test thoroughly**

5. **Remove old JSON files**

---

## 📝 Notes

- Semua perubahan harus di-test di development dulu
- Backup data JSON sebelum dihapus
- Monitor error logs setelah deployment
- Update documentation setelah selesai

---

**Total Estimasi Waktu:** 1-2 minggu  
**Risk Level:** Low (karena mayoritas sudah database)  
**Impact:** High (100% database adoption, easier content management)
