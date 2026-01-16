# Password Reset Fix - Recovery Token Handler

## Masalah
Ketika user menerima email reset password dari Supabase dan mengklik link, mereka diarahkan ke homepage dengan token di hash fragment (`#access_token=...&type=recovery`), bukan ke halaman reset password.

## Penyebab
Supabase mengirim recovery token sebagai hash fragment (client-side), bukan query parameter (server-side). Aplikasi tidak memiliki logic untuk mendeteksi dan menangani recovery token ini.

## Solusi

### 1. RecoveryTokenHandler Component
**File**: `src/components/auth/RecoveryTokenHandler.tsx`

Komponen client-side yang:
- Mendeteksi recovery token di hash fragment URL
- Otomatis redirect ke `/reset-password` dengan token
- Berjalan di semua halaman melalui layout

### 2. Enhanced ResetPasswordForm
**File**: `src/components/auth/ResetPasswordForm.tsx`

Ditambahkan:
- Token validation saat component mount
- Loading state saat verifikasi token
- Error handling untuk token invalid/expired
- Auto-clear hash dari URL setelah token diproses

### 3. Updated Auth Callback
**File**: `src/app/auth/callback/route.ts`

Ditambahkan:
- Detection untuk `type=recovery` parameter
- Redirect ke `/reset-password` untuk recovery flow

### 4. Layout Integration
**File**: `src/app/(store)/layout.tsx`

Menambahkan `<RecoveryTokenHandler />` ke layout utama.

## Cara Kerja

### Flow Password Reset:
1. User request reset password via `/forgot-password`
2. Supabase kirim email dengan link: `http://localhost:3001/#access_token=...&type=recovery`
3. User klik link → buka homepage dengan token di hash
4. `RecoveryTokenHandler` deteksi token → redirect ke `/reset-password`
5. `ResetPasswordForm` verifikasi token → tampilkan form
6. User input password baru → password updated
7. Redirect ke `/login`

## Testing

### Test dengan URL Recovery Token:
```
http://localhost:3001/#access_token=YOUR_TOKEN&expires_at=1768554670&expires_in=3600&refresh_token=YOUR_REFRESH&token_type=bearer&type=recovery
```

Seharusnya:
1. Otomatis redirect ke `/reset-password`
2. Tampil form reset password
3. Bisa update password
4. Redirect ke login setelah sukses

### Test Token Invalid:
1. Buka `/reset-password` tanpa token
2. Seharusnya tampil error "Link tidak valid"
3. Ada tombol "Minta Link Baru" dan "Kembali ke Login"

## Files Modified
- `src/components/auth/RecoveryTokenHandler.tsx` (new)
- `src/components/auth/ResetPasswordForm.tsx` (enhanced)
- `src/components/auth/index.ts` (export added)
- `src/app/(store)/layout.tsx` (handler added)
- `src/app/auth/callback/route.ts` (recovery detection added)

## Admin User
User dengan UUID `0e58a934-e378-4a2b-9184-95d65b9ede03` sudah diset sebagai admin dengan role 'admin' di tabel profiles.
