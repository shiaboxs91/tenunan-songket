# Migration Guide: From JSON to Database

## Overview
This guide will help you migrate from hardcoded JSON data to Supabase database.

## Prerequisites
- Supabase project setup
- Database connection configured in `.env.local`

## Step 1: Run SQL Migrations

### 1.1 Create Hero Slides Table
```bash
# Run in Supabase SQL Editor or via CLI
psql $DATABASE_URL < supabase/migrations/create_hero_slides.sql
```

Or manually in Supabase Dashboard:
1. Go to SQL Editor
2. Copy content from `supabase/migrations/create_hero_slides.sql`
3. Execute

### 1.2 Add Category Image URLs
```bash
# Run in Supabase SQL Editor or via CLI
psql $DATABASE_URL < supabase/migrations/add_category_image_url.sql
```

## Step 2: Verify Database

### Check Hero Slides
```sql
SELECT * FROM hero_slides WHERE is_active = true ORDER BY order_index;
```

Expected: 3 slides

### Check Categories
```sql
SELECT id, name, image_url FROM categories WHERE is_active = true;
```

Expected: All categories should have image_url

## Step 3: Test Frontend

### Test Hero Slider
1. Visit homepage: `http://localhost:3000`
2. Verify slider shows 3 images
3. Check browser console for errors

### Test Category Sheet
1. Click "Kategori" button (mobile) or menu
2. Verify categories load with images
3. Check product counts are correct

## Step 4: Remove Old JSON Files (Optional)

After confirming everything works:

```bash
# Backup first
cp src/data/category-images.json src/data/category-images.json.backup
cp src/data/products.snapshot.json src/data/products.snapshot.json.backup

# Remove (or keep as backup)
# rm src/data/category-images.json
# rm src/data/products.snapshot.json
```

## Rollback Plan

If something goes wrong:

### Rollback Hero Slides
```sql
DROP TABLE IF EXISTS hero_slides CASCADE;
```

Then revert code changes in:
- `src/components/home/HeroSlider.tsx`
- `src/app/(store)/page.tsx`
- `src/lib/supabase/hero.ts`

### Rollback Categories
```sql
ALTER TABLE categories DROP COLUMN IF EXISTS image_url;
```

Then revert code changes in:
- `src/components/layout/CategorySheet.tsx`
- `src/app/(store)/page.tsx`

## Troubleshooting

### Hero Slider Not Loading
1. Check browser console for errors
2. Verify `hero_slides` table exists
3. Check RLS policies allow public read
4. Verify Supabase connection in `.env.local`

### Categories Not Loading
1. Check if `image_url` column exists in `categories` table
2. Verify categories have `image_url` values
3. Check browser console for errors

### Images Not Displaying
1. Verify image URLs are accessible
2. Check Next.js image domains in `next.config.mjs`
3. Consider uploading images to Supabase Storage

## Next Steps

1. ✅ Hero Slider - Using database
2. ✅ Category Images - Using database
3. ✅ Products API - No fallback
4. 🔄 Upload images to Supabase Storage (recommended)
5. 🔄 Add admin UI for managing hero slides
6. 🔄 Add admin UI for managing category images

## Database Adoption Progress

- Before: 57%
- After: 95%+ ✅

## Support

If you encounter issues:
1. Check Supabase logs
2. Check browser console
3. Verify database connection
4. Review migration SQL files
