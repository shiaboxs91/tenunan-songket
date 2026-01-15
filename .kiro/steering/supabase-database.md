# Supabase Database Guidelines

## Konfirmasi Database

Selalu gunakan MCP Supabase untuk konfirmasi dan verifikasi database:

1. **Sebelum menulis kode yang berinteraksi dengan database**, gunakan MCP Supabase untuk:
   - Memeriksa apakah tabel yang dibutuhkan sudah ada
   - Memverifikasi struktur kolom dan tipe data
   - Mengecek relasi antar tabel

2. **Saat membuat query baru**, pastikan:
   - Nama tabel sesuai dengan yang ada di database
   - Kolom yang diakses benar-benar ada
   - Tipe data sesuai dengan schema

3. **Untuk menghindari error build**, selalu:
   - Cek ketersediaan tabel via MCP sebelum implementasi
   - Update `src/lib/supabase/types.ts` jika ada perubahan schema
   - Gunakan fallback/default data jika tabel belum tersedia

## Cara Menggunakan MCP Supabase

```
# Aktivasi power supabase-hosted
kiroPowers action="activate" powerName="supabase-hosted"

# Gunakan tools yang tersedia untuk:
- List tables
- Get table schema
- Execute queries
- Verify data
```
