# Audit Mendalam — Tenunan Songket
**Tanggal:** 3 September 2026  
**Auditor:** Regis Tenunan (AI)  
**Scope:** Database, Security, Performance, Foundation, i18n  
**Stack:** Next.js 14.2 + Supabase (PostgreSQL 17.6) + Vercel + shadcn/ui + Tailwind + next-intl  

---

## Ringkasan Eksekutif

| Level | Jumlah | Status |
|-------|--------|--------|
| 🔴 P0 — Security kritis | 4 | Harus fix SEKARANG |
| 🟠 P1 — Impact nyata | 7 | Fix minggu ini |
| 🟡 P2 — Code quality | 8 | Fix saat refactor |
| ⚪ P3 — Nice-to-have | 4 | Optional |

**Catatan versi:** `package.json` menggunakan Next.js **14.2** dan React **18.3** — bukan Next.js 15 seperti tercatat di SOUL/project knowledge. Update catatan project.

---

## 🔴 P0 — Security Kritis

### [P0-1] Guest Order PII Bocor via Anon API
- **File:** Database — RLS policy `orders`, `order_items`, `payments`
- **Fakta:** Dibuktikan live — query anon REST API `GET /rest/v1/orders?select=*` mengembalikan data asli: `guest_email`, `guest_phone`, `shipping_address` (nama penerima, alamat, kota, negara) dari 5 guest order. Policy RLS `Allow guest order view by email` pada tabel `orders` menggunakan `qual: ((user_id IS NULL) AND (guest_email IS NOT NULL))` — siapapun anonim bisa baca SEMUA guest order tanpa filter email pembeli. Tabel `order_items` dan `payments` punya policy serupa yang bergantung pada `orders.user_id IS NULL` saja.
- **Impact:** Kebocoran data pelanggan (nama, alamat, nomor HP, email, total belanja). Melanggar privasi pengguna dan potensi masalah hukum perlindungan data.
- **Fix:**
  1. Hapus atau restrict policy `Allow guest order view by email` — guest tidak boleh SELECT order tanpa token rahasia (misal `guest_token` UUID unik di kolom orders).
  2. Kalau fitur guest tracking dibutuhkan, gunakan server-side API route yang require email + order number match, bukan expose lewat RLS publik.
  3. Tambah kolom `guest_token UUID DEFAULT gen_random_uuid()` di tabel orders, ubah policy: `qual: guest_token = current_setting('request.headers')::json->>'x-guest-token'` atau hapus policy anon sepenuhnya.
- **Verify:** `curl -H "apikey: ANON_KEY" "https://bzxfppzdqsjzafucfjyv.supabase.co/rest/v1/orders?select=guest_email&limit=1"` harus return `[]`.

---

### [P0-2] API Route `/api/admin/create-user` Tanpa Auth Guard
- **File:** `src/app/api/admin/create-user/route.ts`
- **Fakta:** Route `POST` dan `PUT` menggunakan `supabaseAdmin` (service role key) untuk `createUser` + set `role: 'admin'` di profiles. Tidak ada satupun baris `getUser()`, `getSession()`, atau role check di handler ini. Middleware tidak cover `/api/*` (dikecualikan di `excludedPaths`). Siapapun yang bisa hit endpoint ini bisa buat akun admin baru.
- **Impact:** Privilege escalation — attacker bisa buat admin account dari internet tanpa autentikasi apapun.
- **Fix:** Tambahkan auth guard di awal kedua handler:
  ```typescript
  const { data: { user } } = await supabaseAdmin.auth.getUser(
    request.headers.get('Authorization')?.replace('Bearer ', '') || ''
  )
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('user_id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  ```
- **Verify:** `curl -X POST /api/admin/create-user -d '{"email":"x@x.com","password":"12345678","full_name":"x"}'` tanpa token harus return 401.

---

### [P0-3] Halaman `/atur-server` Tanpa Autentikasi
- **File:** `src/app/atur-server/page.tsx`
- **Fakta:** Route `/atur-server` ada di `excludedPaths` middleware (baris 51) — tidak diproteksi auth sama sekali. Halaman ini memanggil `/api/server-status` POST yang dapat mematikan/mengaktifkan server tanpa cek role. Policy RLS `site_settings` punya `UPDATE anon` untuk key `server_status`. Kombinasi keduanya: siapapun bisa nonaktifkan website dari browser.
- **Impact:** DoS — siapapun bisa matikan website dengan hit satu endpoint.
- **Fix:**
  1. Hapus `/atur-server` dari `excludedPaths` di middleware, atau
  2. Tambahkan auth check di halaman itu, dan
  3. Hapus/restrict RLS policy `Public can update server status` di `site_settings` — hanya admin yang boleh UPDATE.
- **Verify:** Akses `/atur-server` tanpa login harus redirect ke `/login`.

---

### [P0-4] API Route `/api/admin/blog/categories` Tanpa Auth Guard
- **File:** `src/app/api/admin/blog/categories/route.ts`, `src/app/api/admin/blog/categories/[id]/route.ts`
- **Fakta:** Grep auth di kedua file hasilnya kosong — tidak ada `getUser`, `getSession`, atau role check. Handler `POST` (buat kategori), `PATCH` (edit), `DELETE` ada tanpa guard apapun. Berbeda dengan `facebook-sync/route.ts` yang punya guard lengkap.
- **Impact:** Siapapun bisa buat, edit, hapus blog categories tanpa login.
- **Fix:** Tambahkan auth + role check di setiap method mutasi (POST, PATCH, DELETE), minimal pattern `getUser()` + role check dari profiles seperti di `facebook-sync/route.ts`.
- **Verify:** `curl -X POST /api/admin/blog/categories -d '{"name":"test","slug":"test"}'` tanpa token harus return 401.

---

## 🟠 P1 — Impact Nyata

### [P1-1] Env Var Vercel Production Salah
- **File:** Vercel project env — `NEXT_PUBLIC_SUPABASE_URL`
- **Fakta:** Tercatat di known issues — nilai env berisi JWT (`eyJ...`) bukan URL Supabase. Nilai benar: `https://bzxfppzdqsjzafucfjyv.supabase.co`. `.env.local` sudah benar.
- **Impact:** SEMUA Supabase query di production gagal → produk tidak muncul di landing page.
- **Fix:** Update via Vercel API:
  ```bash
  bash scripts/deploy-tenunan.sh  # atau update via Vercel API manually
  ```
- **Verify:** Buka `https://www.tenunansongket.com` — produk harus muncul.

---

### [P1-2] TypeScript Build Error Disembunyikan
- **File:** `next.config.mjs` baris `ignoreBuildErrors: true` dan `eslint: { ignoreDuringBuilds: true }`
- **Fakta:** `npx tsc --noEmit` menghasilkan **46 error** di src (2 error nyata di `src/lib/supabase/orders.ts` dan `src/lib/validation/index.ts`) + 30+ error di `supabase/functions/` (Deno). Error di `orders.ts`: `order_number` missing, `guest_email` field type mismatch.
- **Impact:** Error runtime tersembunyi. Build sukses padahal ada type mismatch yang bisa crash di production.
- **Fix:**
  1. Fix 2 error di `src/`: tambah `order_number` ke insert object di `orders.ts`, fix export `indonesiaConfig` di `country-config.ts`.
  2. Untuk `supabase/functions/` — exclude dari tsconfig karena Deno runtime (beda tsconfig).
  3. Set `ignoreBuildErrors: false` dan `eslint.ignoreDuringBuilds: false` setelah fix.
- **Verify:** `npx tsc --noEmit` harus 0 error di `src/`.

---

### [P1-3] Semua Produk `sold = 0` — "Produk Populer" Kosong
- **File:** `src/lib/supabase/products.ts`, database
- **Fakta:** Query DB: `sold_zero = 27` dari 27 produk. Sort `sold DESC` semua sama → tampil kosong atau acak.
- **Impact:** Fitur "Produk Populer" di landing page tidak berfungsi.
- **Fix:** Tambah fallback sort: `sold DESC, average_rating DESC, review_count DESC`. Atau populate kolom `sold` dari data `order_items` yang ada (ada 5 rows).
- **Verify:** Landing page menampilkan produk di section "Populer".

---

### [P1-4] 10 Produk Stok = 0 Masih Aktif
- **File:** Database — tabel `products`
- **Fakta:** Query: `stock_zero = 10` dari 27 produk aktif (`is_active = true`). Produk tanpa stok masih bisa ditambah ke cart.
- **Impact:** User bisa checkout produk yang tidak tersedia → order masalah.
- **Fix:** Tambahkan guard di add-to-cart: cek `stock > 0`. Atau nonaktifkan produk stok 0 via admin panel.
- **Verify:** Tombol "Tambah ke Keranjang" disabled untuk produk stok 0.

---

### [P1-5] `select('*')` di 40 Tempat di `lib/`
- **File:** `src/lib/supabase/` — 40 query pakai `.select('*')` atau `.select('*', ...)`
- **Fakta:** Grep `select('\*')` di lib/ = 40 hasil. Contoh terparah: `products` select `*` padahal ada kolom besar (description, meta fields).
- **Impact:** Over-fetching data → payload lebih besar → lebih lambat, terutama di mobile.
- **Fix:** Ganti dengan kolom spesifik yang dibutuhkan per query. Mulai dari `products` (paling sering di-query).
- **Verify:** Network tab — payload product list < 5KB per produk.

---

### [P1-6] 8 FK Tanpa Index
- **File:** Database
- **Fakta:** Query FK tanpa index mengembalikan 8 kolom:
  - `blog_post_products.product_id → products`
  - `blog_posts.author_id → profiles`
  - `carts.coupon_id → coupons`
  - `coupon_usages.coupon_id → coupons`
  - `coupon_usages.order_id → orders`
  - `coupons.category_id → categories`
  - `order_items.product_id → products` ← **ini yang paling berdampak** (join paling sering)
  - `orders.coupon_id → coupons`
- **Impact:** Query JOIN lambat saat data tumbuh. `order_items.product_id` paling kritis karena dipakai di setiap order detail.
- **Fix:**
  ```sql
  CREATE INDEX idx_order_items_product_id ON order_items(product_id);
  CREATE INDEX idx_blog_posts_author_id ON blog_posts(author_id);
  CREATE INDEX idx_blog_post_products_product_id ON blog_post_products(product_id);
  CREATE INDEX idx_carts_coupon_id ON carts(coupon_id);
  CREATE INDEX idx_coupon_usages_coupon_id ON coupon_usages(coupon_id);
  CREATE INDEX idx_coupon_usages_order_id ON coupon_usages(order_id);
  CREATE INDEX idx_coupons_category_id ON coupons(category_id);
  CREATE INDEX idx_orders_coupon_id ON orders(coupon_id);
  ```
- **Verify:** Query FK di `pg_stat_user_indexes` menunjukkan index baru dengan `idx_scan > 0` setelah beberapa query.

---

### [P1-7] `dangerouslySetInnerHTML` pada Konten Blog Tanpa Sanitasi
- **File:** `src/app/(store)/blog/[slug]/page.tsx` baris 333
- **Fakta:** `dangerouslySetInnerHTML={{ __html: post.content }}` — konten blog dari DB langsung di-render. Library sanitasi ada di `src/lib/validation/sanitization.ts` tapi tidak dipakai di sini. Jika admin terinject atau DB dibobol, XSS langsung ke user.
- **Impact:** XSS — konten blog berbahaya bisa eksekusi JS di browser pengunjung.
- **Fix:** Sanitasi sebelum render dengan DOMPurify atau library server-side seperti `sanitize-html`:
  ```typescript
  import DOMPurify from 'isomorphic-dompurify'
  // ...
  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
  ```
- **Verify:** Insert `<script>alert(1)</script>` di blog content → tidak tereksekusi di browser.

---

## 🟡 P2 — Code Quality / Maintainability

### [P2-1] 18 File Admin >500 Baris — Perlu Modularisasi
- **Fakta:** 56 file >300 baris, 18 file >500 baris. Terparah: `database.types.ts` (1642 baris), `types.ts` (1382 baris), `admin.ts` (1189 baris), `AddressForm.tsx` (1163 baris), `GuestAddressForm.tsx` (807 baris).
- **Impact:** Susah maintain, CI slower, merge conflict rawan.
- **Fix:** Pecah per domain (hooks, components, actions, types) mengikuti pattern di skill `nextjs-admin-dashboard-modular-shell`.

---

### [P2-2] `getSession()` di API Routes (Harusnya `getUser()`)
- **File:** `src/app/api/admin/blog/route.ts`, `bulk/route.ts`, `[id]/route.ts`
- **Fakta:** 3 route admin blog pakai `supabase.auth.getSession()` bukan `getUser()`. Supabase docs: `getSession()` tidak verify JWT dengan server — bisa spoofed di server context.
- **Impact:** Bypass auth di API blog admin kalau JWT dimanipulasi.
- **Fix:** Ganti semua `getSession()` di server context dengan `getUser()`.

---

### [P2-3] Bahasa `id` Dikonfigurasi di SOUL tapi Tidak Ada di i18n
- **Fakta:** SOUL.md menyebut `i18n: id/ms/en` tapi `src/i18n/config.ts` hanya punya `['ms', 'en']`. Tidak ada `id.json` di `messages/`. 301 file TS/TSX di src, tapi hanya 6 file pakai `useTranslations` — mayoritas teks hardcoded.
- **Impact:** i18n tidak konsisten. String hardcoded tidak bisa ditranslasi.
- **Fix:** Update SOUL.md/project knowledge: locales yang aktif adalah `ms` dan `en`. Audit string hardcoded bertahap.

---

### [P2-4] Stripe Webhook Fallback ke Anon Key
- **File:** `src/app/api/webhook/stripe/route.ts` baris 12
- **Fakta:** `SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!` — kalau `SERVICE_ROLE_KEY` tidak ada di env, webhook fallback ke anon key. Anon key tidak punya permission untuk write ke `payments` dan `orders` tanpa RLS.
- **Impact:** Webhook Stripe diam-diam gagal update payment status kalau service role key tidak di-set.
- **Fix:** Hapus fallback `|| ANON_KEY`, ganti dengan early return error jika service role key kosong.

---

### [P2-5] `orders.ts` Bug: `order_number` Missing di Insert
- **File:** `src/lib/supabase/orders.ts` baris ~200-210
- **Fakta:** TSC error: `order_number` required di DB schema tapi tidak ada di insert object untuk guest order. DB punya trigger/function `generate_order_number` tapi kalau schema enforce NOT NULL, insert akan gagal.
- **Impact:** Pembuatan guest order mungkin gagal di production.
- **Fix:** Cek apakah `order_number` punya default dari trigger — kalau iya, tambahkan ke TypeScript type sebagai optional. Kalau tidak, generate di kode sebelum insert.

---

### [P2-6] `admin-test/page.tsx` — Halaman Debug Masih Ada di Production
- **File:** `src/app/admin-test/page.tsx`
- **Fakta:** File ada, tidak ada auth guard, bukan di excludedPaths tapi juga tidak di ADMIN_ROUTES middleware. Berisi UI test admin panel.
- **Impact:** Halaman debug bisa diakses publik di URL `/admin-test`.
- **Fix:** Hapus file atau tambahkan redirect ke `/admin` dengan auth check.

---

### [P2-7] Storage: Semua User Authenticated Bisa Delete/Update Gambar Produk
- **File:** Database — Storage policies
- **Fakta:** Policy `Authenticated users can delete product images` dan `update product images` berlaku untuk semua user `authenticated` — bukan hanya admin. Customer login bisa hapus gambar produk.
- **Impact:** Customer bisa sabotase gambar produk.
- **Fix:** Tambahkan role check ke storage policies: `auth.role() = 'authenticated' AND EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')`.

---

### [P2-8] Functions SECURITY DEFINER Tanpa `search_path`
- **File:** Database — 8 function: `create_admin_user`, `get_admins_with_email`, `get_categories_with_count`, `increment_blog_view_count`, `is_admin`, `update_product_rating_stats`, `update_review_helpful_count`
- **Fakta:** Semua function ini `security_definer = true` tapi config menunjukkan `NO_SEARCH_PATH`. Supabase best practice: function `SECURITY DEFINER` wajib set `search_path = ''` untuk cegah search path injection.
- **Impact:** Potensi SQL injection via search path manipulation (low severity tapi best practice wajib).
- **Fix:** Tambahkan `SET search_path = ''` atau `SET search_path = public` ke setiap function. Migrasi SQL.

---

## ⚪ P3 — Optional / Nice-to-Have

### [P3-1] `<img>` Raw di 2 Halaman Admin
- **File:** `src/app/admin/settings/hero/page.tsx`, `src/app/admin/settings/page.tsx`
- **Fakta:** 3 instance `<img>` raw (bukan `next/image`) di halaman admin.
- **Impact:** Tidak ada image optimization, lazy loading tidak optimal. Tapi halaman admin — pengaruh kecil.
- **Fix:** Ganti dengan `<Image>` dari `next/image` kalau gambar dari domain yang sudah di-whitelist.

---

### [P3-2] i18n Hanya 6 Komponen Pakai Terjemahan
- **Fakta:** Dari 301 file, hanya 6 yang pakai `useTranslations`/`getTranslations`. Mayoritas UI text hardcoded.
- **Impact:** Website tidak benar-benar multilingual — hanya sebagian kecil yang ditranslasi.
- **Fix:** Audit bertahap, prioritas halaman landing dan checkout.

---

### [P3-3] Error Boundary & Loading State Tidak Konsisten
- **Fakta:** `error.tsx` dan `loading.tsx` ada di beberapa route (`(store)`, `blog`, `products`) tapi tidak ada di semua route. Tidak ada `global-error.tsx` di root. Admin routes tidak punya error boundary.
- **Impact:** Error di admin page tidak ter-catch dengan baik.
- **Fix:** Tambahkan `error.tsx` di `src/app/admin/` dan `src/app/layout` level.

---

### [P3-4] `debug-products` Route Masih Ada di Production
- **File:** `src/app/api/debug-products/route.ts`
- **Fakta:** Route GET publik yang expose info env (`url`, `key` defined status), product counts, dan slug checks. Tidak ada auth guard.
- **Impact:** Info leakage kecil — tidak expose value tapi expose env status dan slug produk internal.
- **Fix:** Hapus route ini, atau tambahkan auth check + hapus sebelum production stable.

---

## Informasi Tambahan

### Database Health
- **Total tabel:** 34 tabel di schema public
- **RLS:** ✅ Semua 34 tabel punya RLS enabled + minimal 1 policy
- **Timestamp:** ✅ Semua timestamp kolom pakai `timestamptz` (bukan `timestamp without timezone`)
- **Extensions:** pg_stat_statements, pgcrypto, uuid-ossp, supabase_vault — semua standar
- **Integritas:** 0 orphan order_items, 0 users tanpa profile
- **Data saat ini:** 27 produk aktif, 8 orders (5 guest, 3 registered), 30 users (27 customer, 3 admin), 3 reviews

### Tech Stack (Aktual)
- Next.js **14.2** (bukan 15 — update catatan project)
- React 18.3
- Supabase JS 2.90.1 + SSR 0.8.0
- next-intl 4.7.0 (locales: `ms`, `en` — bukan `id`)
- Stripe test mode (belum live)
- Recharts untuk charts admin
- TipTap 3.x untuk blog editor
- Vitest + Testing Library (ada test tapi belum lengkap)

### File Paling Kritis untuk Refactor
| File | LOC | Prioritas |
|------|-----|-----------|
| `src/lib/supabase/admin.ts` | 1189 | Tinggi |
| `src/components/profile/AddressForm.tsx` | 1163 | Tinggi |
| `src/components/checkout/GuestAddressForm.tsx` | 807 | Sedang |
| `src/components/admin/ProductForm.tsx` | 756 | Sedang |
| `src/app/admin/settings/shipping/page.tsx` | 731 | Sedang |

---

## Urutan Fix yang Disarankan

### Sprint 1 — Security (lakukan sekarang)
1. ✅ Fix P0-2: Tambah auth guard di `/api/admin/create-user` — **DONE 2026-09-03**
2. ✅ Fix P0-4: Tambah auth guard di `/api/admin/blog/categories` (POST/PATCH/DELETE) — **DONE 2026-09-03**
3. ✅ Fix P0-3: Hapus `/atur-server` dari middleware excludedPaths, tambah ke ADMIN_ROUTES, hapus RLS anon UPDATE site_settings — **DONE 2026-09-03**
4. Fix P0-1: Restrict RLS guest order — butuh diskusi arsitektur guest checkout

### Sprint 2 — Production Stability
5. ✅ Fix P1-1: Update 6 env vars Vercel production via REST API + redeploy — **DONE 2026-09-03**
6. ✅ Fix P1-2: Hapus `indonesiaConfig` dari validation/index.ts, mark `order_number` optional di database.types.ts — **DONE 2026-09-03**
7. ✅ Fix P1-3: Tambah fallback sort `getPopularProducts`: sold DESC, average_rating DESC, review_count DESC, created_at DESC — **DONE 2026-09-03**
8. Fix P2-4: Stripe webhook fallback anon key
9. Fix P2-5: `order_number` missing di guest order insert

### Sprint 3 — Quality
10. Fix P1-7: Sanitasi HTML blog (DOMPurify)
11. Fix P1-6: Tambah 8 FK indexes via migration
12. Fix P2-2: Ganti `getSession()` → `getUser()` di API blog
13. Fix P2-7: Restrict storage policies ke admin only
14. Fix P2-8: Tambah `search_path` ke SECURITY DEFINER functions

---

*Audit ini dijalankan secara otomatis + verifikasi manual. Setiap temuan P0 dibuktikan dengan query/request langsung, bukan asumsi. Regenerasi audit: load skill `project-audit-deep` lalu jalankan ulang dari awal.*

*Last updated: 2026-09-03*
