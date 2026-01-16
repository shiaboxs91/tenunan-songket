# 🚀 Deployment Checklist - Database Migration

## Pre-Deployment Steps

### 1. Run Database Migrations

#### Option A: Via Supabase Dashboard (Recommended)
- [ ] Login to Supabase Dashboard
- [ ] Go to SQL Editor
- [ ] Copy content from `supabase/migrations/create_hero_slides.sql`
- [ ] Execute SQL
- [ ] Copy content from `supabase/migrations/add_category_image_url.sql`
- [ ] Execute SQL
- [ ] Verify no errors

#### Option B: Via Supabase CLI
```bash
supabase db push
```

### 2. Verify Database

- [ ] Check `hero_slides` table exists
  ```sql
  SELECT * FROM hero_slides WHERE is_active = true ORDER BY order_index;
  ```
  Expected: 3 rows

- [ ] Check `categories` has `image_url` column
  ```sql
  SELECT id, name, image_url FROM categories LIMIT 5;
  ```
  Expected: All categories have image_url

- [ ] Test RLS policies
  ```sql
  -- Should work (public read)
  SELECT * FROM hero_slides WHERE is_active = true;
  ```

### 3. Local Testing

- [ ] Start development server
  ```bash
  npm run dev
  ```

- [ ] Visit homepage: `http://localhost:3000`
  - [ ] Hero slider displays 3 images
  - [ ] Images load correctly
  - [ ] Slider auto-plays
  - [ ] Navigation arrows work

- [ ] Test Category Sheet (mobile view or click Kategori)
  - [ ] Categories load with images
  - [ ] Product counts are correct
  - [ ] Category navigation works

- [ ] Test Products Page
  - [ ] Products load from database
  - [ ] No fallback to snapshot
  - [ ] Filtering works
  - [ ] Sorting works

- [ ] Check Browser Console
  - [ ] No errors
  - [ ] No warnings about missing data
  - [ ] API calls return 200 status

### 4. Code Review

- [ ] Review changes in:
  - [ ] `src/components/home/HeroSlider.tsx`
  - [ ] `src/components/layout/CategorySheet.tsx`
  - [ ] `src/app/(store)/page.tsx`
  - [ ] `src/app/api/products/route.ts`

- [ ] Verify new files:
  - [ ] `src/lib/supabase/hero.ts`
  - [ ] `src/lib/supabase/categories-client.ts`

- [ ] Check migrations:
  - [ ] `supabase/migrations/create_hero_slides.sql`
  - [ ] `supabase/migrations/add_category_image_url.sql`

## Deployment Steps

### 1. Commit Changes

```bash
git add .
git commit -m "feat: migrate to 95%+ database adoption

- Add hero_slides table for dynamic hero slider
- Add image_url to categories table
- Remove products.snapshot.json fallback
- Update HeroSlider to fetch from database
- Update CategorySheet to fetch from database
- Update homepage to use database for categories
- Add migration scripts and documentation"
```

### 2. Push to Repository

```bash
git push origin main
```

### 3. Deploy to Production

#### If using Vercel:
- [ ] Push triggers automatic deployment
- [ ] Wait for deployment to complete
- [ ] Check deployment logs for errors

#### If using other platform:
- [ ] Follow your deployment process
- [ ] Ensure environment variables are set
- [ ] Run build command: `npm run build`
- [ ] Deploy build output

### 4. Post-Deployment Verification

- [ ] Visit production URL
- [ ] Test hero slider
- [ ] Test category sheet
- [ ] Test product listings
- [ ] Check browser console
- [ ] Test on mobile device
- [ ] Test on desktop
- [ ] Verify images load (check CORS if issues)

## Rollback Plan

If something goes wrong:

### 1. Rollback Database

```sql
-- Remove hero_slides table
DROP TABLE IF EXISTS hero_slides CASCADE;

-- Remove image_url column
ALTER TABLE categories DROP COLUMN IF EXISTS image_url;
```

### 2. Rollback Code

```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

### 3. Restore Old Files

If you backed up JSON files:
```bash
cp src/data/category-images.json.backup src/data/category-images.json
cp src/data/products.snapshot.json.backup src/data/products.snapshot.json
```

## Monitoring

### First 24 Hours

- [ ] Monitor error logs
- [ ] Check Supabase dashboard for query performance
- [ ] Monitor API response times
- [ ] Check user feedback/reports

### Metrics to Watch

- [ ] Page load time (should be similar or faster)
- [ ] API response time (should be <500ms)
- [ ] Error rate (should be <1%)
- [ ] Database query count
- [ ] Image load time

## Troubleshooting

### Hero Slider Not Loading

**Symptoms:** Blank slider or "Loading slides..." message

**Solutions:**
1. Check `hero_slides` table has data
2. Verify RLS policies allow public read
3. Check Supabase connection in `.env.local`
4. Check browser console for errors

### Categories Not Loading

**Symptoms:** Empty category sheet or loading state

**Solutions:**
1. Verify `categories` table has `image_url` column
2. Check categories have `image_url` values
3. Verify Supabase connection
4. Check browser console for errors

### Images Not Displaying

**Symptoms:** Broken image icons

**Solutions:**
1. Verify image URLs are accessible
2. Check Next.js image domains in `next.config.mjs`
3. Add image domains if needed:
   ```js
   images: {
     domains: ['tenunansongket.com'],
   }
   ```
4. Consider uploading to Supabase Storage

### API Errors

**Symptoms:** 500 errors from `/api/products`

**Solutions:**
1. Check Supabase connection
2. Verify database tables exist
3. Check RLS policies
4. Review server logs

## Success Criteria

✅ All checklist items completed  
✅ No errors in production  
✅ Hero slider works  
✅ Categories load correctly  
✅ Products load from database  
✅ Page performance is good  
✅ Mobile and desktop work  

## Documentation

- Migration guide: `scripts/migrate-to-database.md`
- Complete report: `MIGRATION_COMPLETE.md`
- Audit reports: `AUDIT_SUMMARY.md`, `AUDIT_FRONTEND_FINAL_RECOMMENDATIONS.md`

## Support Contacts

- Supabase Dashboard: https://app.supabase.com
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs

---

**Last Updated:** 16 Januari 2026  
**Migration Status:** ✅ Code Complete, Ready for Deployment  
**Database Adoption:** 95%+
