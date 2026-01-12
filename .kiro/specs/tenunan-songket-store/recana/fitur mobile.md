# Mobile UI/UX Spec — TenunanSongket Store (Modern Minimal Marun)

## Prinsip desain mobile
- Fokus thumb-zone: aksi utama (search, cart, checkout) harus mudah dijangkau jempol dan minim perpindahan tangan. [web:53][web:56]
- Ukuran tap-target aman untuk touchscreen (ikon/tab/button dibuat besar dan tidak rapat). [web:52]
- Kontras warna dan ukuran teks harus aman untuk keterbacaan (ikuti standar rasio kontras WCAG untuk teks normal). [web:64]

## Navigasi & layout global
**Bottom Navigation (maks 5 item)**
- Home
- Kategori
- Search
- Cart (badge qty)
- Akun

**Header (sticky, ringkas)**
- Baris 1: Logo (kecil) + ikon cart + ikon akun.
- Baris 2: Search bar full-width (paling penting di mobile).
- Saat scroll: header mengecil (compact) tapi search tetap mudah diakses (mis. “tap untuk cari”).

**Aturan touch**
- Tinggi elemen interaksi (tab bottom-nav, button utama) konsisten dan nyaman untuk tap. [web:52]

## Halaman Katalog (Listing) mobile
**Layout**
- Default grid **2 kolom** (lebih efisien), dengan opsi “Comfort/Compact” (opsional) untuk menyesuaikan kepadatan.
- Spasi antar card 12–16px, padding layar 16px.

**Card produk (compact, tidak kebesaran)**
- Gambar rasio 1:1 atau 4:5, tidak terlalu tinggi agar 2 kolom tetap terlihat “premium”.
- Judul max 2 baris (truncate), harga tegas (aksen marun), rating + sold 1 baris.
- Aksi di card:
  - Primary: tombol kecil “+ Keranjang” (atau ikon + tooltip).
  - Secondary: tap card untuk detail.

**Filter & sort (mobile-friendly)**
- Sort: dropdown di atas grid (sticky kecil).
- Filter: tombol “Filter” membuka `Sheet` (bottom sheet atau right sheet).
- Isi filter minimal:
  - Kategori (checkbox)
  - Range harga (slider + input min/max)
  - Stok (toggle)
  - Tombol “Terapkan” (primary marun) + “Reset” (secondary)

## Halaman Detail Produk mobile
**Layout**
- Atas: gallery (swipe) + indikator.
- Tengah: title, rating, sold, harga, varian (jika ada), deskripsi ringkas.
- Bawah: tabs (Deskripsi / Pengiriman (demo) / Perawatan).

**Sticky CTA (wajib)**
- Sticky bar di bawah:
  - Kiri: “Add to Cart” (outline marun)
  - Kanan: “Beli Sekarang” (solid marun, full emphasis)
- Sticky CTA hanya di halaman detail & checkout, jangan di listing agar tidak mengganggu scroll.

**Trust & info cepat**
- Tampilkan: “Asli/Handmade”, estimasi pengiriman (demo), info retur/garansi singkat.

## Cart & Checkout (mobile cepat)
**Cart**
- List item: thumbnail kecil, title 1–2 baris, harga, qty stepper (+/-), remove.
- Ringkasan biaya:
  - Subtotal
  - Ongkir (demo)
  - Pajak (demo)
  - Total (paling menonjol)
- CTA: “Checkout” full-width (primary marun).

**Checkout (3 step)**
1) Alamat
2) Pengiriman
3) Ringkasan
- Input forms:
  - Set `inputMode` dan `autocomplete` agar keyboard sesuai (tel/number/email) dan isi lebih cepat. [web:52]
- Tombol “Buat Pesanan/Bayar Sekarang” full-width, selalu jelas posisinya.

## Performa, gambar, dan loading states
- Gambar: gunakan format next-gen (WebP/AVIF bila memungkinkan), ukuran responsif, dan lazy-load untuk listing. [web:57][web:60]
- Loading: skeleton untuk grid & detail (hindari spinner besar).
- Hindari pop-up berlebihan; gunakan toast ringan untuk “berhasil ditambahkan ke keranjang”.

## Checklist QA mobile (yang dicek sebelum presentasi)
- 360px: bottom-nav tidak terpotong, CTA tidak menutup konten penting.
- Tap target tidak terlalu kecil, tidak ada elemen “rapat” yang memicu salah klik. [web:52]
- Kontras warna aman dan teks tetap terbaca di outdoor/light mode. [web:64]
- Flow demo lengkap: listing → detail → add to cart → checkout → success.
