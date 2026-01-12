# PRD + Prompt Eksekusi (Frontend Dulu) — TenunanSongket Store

**Style direction klien:** Modern minimal marun.

Dokumen ini disiapkan untuk **langsung di-copy** ke asisten AI (Claude Opus 4.5) agar menghasilkan frontend demo e-commerce modern (desktop & mobile) dengan data real dari feed, namun seluruh transaksi masih demo.

---

## 1) Tujuan, scope, dan output

### Tujuan
- Membuat ulang storefront TenunanSongket menjadi e-commerce yang lebih modern, cepat, dan mudah dinavigasi (feel marketplace besar: search, kategori, filter, sort, grid produk).
- Tahap ini fokus **frontend saja** sampai alur pembelian (demo checkout → success).

### Scope tahap 1 (wajib)
- Halaman: Home, Listing Produk, Detail Produk, Cart, Checkout (stepper), Success, Account (UI demo).
- Data demo tetapi “real”: ambil dari RSS feed **read-only**: https://tenunansongket.com/feed/
- Semua proses pembayaran/pengiriman/pajak hanya **simulasi UI** (tanpa gateway).

### Out of scope (nanti tahap 2)
- Supabase schema + admin dashboard + order management real.
- Integrasi ongkir ekspedisi (RajaOngkir/Shippo/kurir), payment gateway, invoice, email/WA automation.

### Deliverable yang harus bisa dicek klien
- Navigasi jelas, responsif, modern, dan konsisten.
- Produk tampil dinamis dari feed (atau fallback snapshot jika feed gagal diakses).
- End-to-end demo: pilih produk → add to cart → checkout → halaman sukses.

---

## 2) Arah desain: Modern minimal marun

### Design principles
- Minimal, whitespace cukup, tipografi bersih, fokus pada foto produk dan CTA.
- “Marun” dipakai sebagai aksen (CTA, link aktif, badge), bukan memenuhi seluruh UI.
- Sentuhan budaya: motif songket **sangat halus** sebagai background pattern di hero/footer, dengan opacity rendah.

### Color tokens (Tailwind CSS variables)
Gunakan HSL dan variabel CSS agar mudah tuning:
- Background: putih/abu sangat muda
- Text: slate gelap
- Primary (marun): `#7A1F3D` (bisa disesuaikan)
- Accent emas halus (opsional, kecil): `#C8A24A` untuk highlight premium

Contoh:
- `--primary`: marun
- `--primary-foreground`: putih
- `--ring`: marun soft

### Typography
- Font utama: Inter (atau default next/font).
- Heading sedikit lebih tegas (font-weight 600–700).

### UI feel
- Card produk minimal: border tipis, shadow lembut saat hover.
- Tombol utama: marun solid.
- Tombol secondary: outline marun.

---

## 3) Stack & arsitektur (frontend)

### Stack wajib
- Next.js (App Router) + TypeScript. [web:1]
- Tailwind CSS.
- shadcn/ui (komponen UI) + Radix.

### Prinsip rendering
- Default pakai Server Components (listing & detail produk) untuk performa; pakai Client Components hanya untuk interaksi (filter UI state, cart). [web:2]

### State management demo
- Cart + checkout form: Context + localStorage (atau Zustand—pilih salah satu, jangan berlebihan).

---

## 4) Sumber data demo: RSS feed (real content)

### Endpoint data internal
Buat Route Handler:
- `GET /api/products` → fetch RSS feed, parse XML, mapping ke `Product[]`.

### Contract `Product`
```ts
export type Product = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image?: string;
  price: number;
  currency: "IDR";
  category: string;
  tags: string[];
  inStock: boolean;
  rating: number;
  sold: number;
  createdAt?: string;
  sourceUrl: string;
};
Normalisasi dari RSS → Product (rule-based, seed stabil)
Karena feed bisa berisi artikel/post, lakukan normalisasi agar terasa seperti katalog:

id: guid jika ada, else hash dari link.

slug: slugify dari title.

description: ambil content:encoded atau description, strip HTML.

image: ambil dari enclosure / media:content jika tersedia; jika tidak, pakai placeholder.

category: rule-based dari title/desc (keyword match).

price, rating, sold, inStock: dummy tapi konsisten (seed dari id).

Fallback bila feed gagal diakses
Simpan snapshot data/products.snapshot.json hasil mapping.

Jika fetch RSS error/timeout, API mengembalikan snapshot agar demo tetap jalan.

5) Sitemap & UI requirements (desktop + mobile)
Global layout
Header (sticky)

Kiri: logo.

Tengah (desktop): search bar.

Kanan: link kategori (dropdown) + icon cart + akun.

Mobile: hamburger → Sheet menu; search tetap jelas.

Footer

Link: Cara Order, Tentang, Kontak (dummy), Sosial (dummy).

Brand story singkat.

Halaman
Home /

Hero banner minimal (headline + subheadline + CTA “Belanja sekarang”).

Kategori populer (chips/tiles).

Produk populer (grid).

Produk terbaru (grid).

USP section (handmade/warisan/kualitas).

Listing /products

Desktop: sidebar filter + grid.

Mobile: filter via Sheet.

Filter:

kategori

range harga

stok

Sort:

terbaru

termurah

terlaris

Pagination.

Querystring:

?q=&category=&min=&max=&inStock=&sort=&page=

Detail /products/[slug]

Gallery (carousel) + thumbnail (kalau image ada).

Title, rating, sold, price.

Varian (demo) bila mau: select “Motif/Ukuran”.

CTA: Add to Cart (primary marun) + Buy Now (secondary).

Tabs: Deskripsi, Pengiriman (demo), Perawatan.

Rekomendasi produk.

Cart /cart

List item, qty stepper, remove.

Ringkasan: subtotal, ongkir (demo), pajak (demo), total.

CTA checkout.

Checkout /checkout

Stepper 3 langkah:

Alamat

Pengiriman

Ringkasan

Setelah submit: redirect ke /checkout/success.

Success /checkout/success

Nomor order dummy, ringkasan singkat, CTA kembali belanja.

Account /account

UI login/register (demo) + profil singkat.

6) Komponen shadcn/ui yang dipakai
Layout: NavigationMenu/menu sederhana, Sheet, Dialog.

Forms: Input, Textarea, Select, Checkbox.

Data display: Card, Badge, Tabs, Accordion, Skeleton.

Control: Button, Slider, Pagination.

7) Struktur folder (diminta)
text
/app
  /(store)
    page.tsx
    products/page.tsx
    products/[slug]/page.tsx
    cart/page.tsx
    checkout/page.tsx
    checkout/success/page.tsx
    account/page.tsx
  /api/products/route.ts
/components
  /layout
    Header.tsx
    Footer.tsx
  /product
    ProductCard.tsx
    ProductGrid.tsx
    ProductGallery.tsx
  /filters
    FilterSidebar.tsx
    FilterSheetMobile.tsx
/lib
  products.ts
  rss.ts
  utils.ts
/data
  products.snapshot.json
8) Instruksi kerja untuk Claude Opus 4.5 (copy-paste)
Role
Kamu adalah senior frontend engineer + UI engineer. Fokus hanya frontend demo yang siap dipresentasikan.

Task list (urutan kerja)
Bootstrap Next.js App Router + TS + Tailwind.

Setup shadcn/ui dan buat theme “modern minimal marun” (primary marun).

Buat layout global (Header/Footer) + routing.

Implement halaman: Home → Listing → Detail → Cart → Checkout → Success → Account.

Implement /api/products (RSS fetch+parse+mapping) + fallback snapshot.

Hubungkan UI ke data dari /api/products.

Implement cart persistent (localStorage).

Pastikan mobile-first, CTA jelas, loading state (Skeleton), dan error state rapi.

Non-functional requirements
Lighthouse/performance: minim JS client-side (client hanya untuk cart/filter). [web:2]

Responsif sempurna di 360px–1440px.

Tidak ada placeholder “jelek”; kalau data kurang, pakai UI fallback yang elegan.

Acceptance criteria
Semua halaman bisa dinavigasi tanpa error.

Produk tampil dari feed atau snapshot.

Search & filter bekerja.

Add to cart, update qty, checkout sampai success bekerja.

Visual: modern minimal marun, rapi di desktop & mobile.

9) Catatan untuk klien (opsional, tampil di demo)
Ini demo frontend; ongkir/pajak/pembayaran masih simulasi.

Setelah UI disetujui, tahap berikutnya: Supabase schema, auth, order pipeline, integrasi ekspedisi, pajak real, payment gateway.