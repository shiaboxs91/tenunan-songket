# Desktop Product Listing Spec (Grid Kecil, Profesional)

## Target feel
- Modern minimal marun, rapih seperti katalog brand premium.
- Produk terlihat banyak dalam 1 layar tanpa terasa sesak.

## Layout
- Container max-width: 1200–1280px.
- Header sticky: logo + search + kategori + cart + akun.
- Katalog: 2 kolom
  - Left sidebar filter: 260–300px (sticky dalam viewport).
  - Right content: grid produk.

## Grid produk (utama)
- Breakpoint:
  - xl (≥1280): 5 kolom (card kecil)
  - lg (≥1024): 4 kolom
  - md (≥768): 3 kolom
  - sm (≥640): 2 kolom
- Gap antar card: 16–20px.

## Spesifikasi card produk (agar tidak besar)
- Rasio gambar: 1:1 atau 4:5 (lebih fashion).
- Tinggi gambar dikontrol (mis. 180–220px) supaya judul & harga tidak turun jauh.
- Konten card:
  - Title max 2 baris (truncate).
  - Harga tegas (marun accent untuk promo).
  - Rating + sold kecil (1 baris).
  - Tombol:
    - Primary: icon “+ Keranjang” (compact).
    - Secondary (opsional): “Lihat” / quick view.

## Interaksi
- Hover: shadow halus + border marun tipis.
- Quick actions tidak mengganggu (hindari overlay besar).

## Filter & sorting
- Sorting bar di atas grid:
  - Sort dropdown + jumlah hasil + toggle grid density (optional: compact/comfortable).
- Filter:
  - Kategori (checkbox)
  - Harga (range slider)
  - Stok (toggle)
  - Reset filter jelas

## Aksesibilitas & usability
- Klik area card cukup luas (judul/gambar clickable).
- Button minimal tinggi 36–40px di desktop.
- Kontras warna memenuhi standar WCAG. (Minimal 4.5:1 untuk teks normal) 
