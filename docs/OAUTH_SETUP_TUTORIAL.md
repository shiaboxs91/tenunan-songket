# Tutorial Setup OAuth Providers (Google, Facebook, Apple)

Panduan lengkap untuk mengaktifkan login dengan Google, Facebook, dan Apple di Tenunan Songket.

---

## 📋 Daftar Isi

1. [Setup Google OAuth](#1-setup-google-oauth)
2. [Setup Facebook OAuth](#2-setup-facebook-oauth)
3. [Setup Apple OAuth](#3-setup-apple-oauth)
4. [Konfigurasi di Supabase](#4-konfigurasi-di-supabase)
5. [Testing](#5-testing)

---

## 1. Setup Google OAuth

### Langkah 1: Buat Project di Google Cloud Console

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Klik **Select a project** → **New Project**
3. Nama project: `Tenunan Songket`
4. Klik **Create**

### Langkah 2: Enable Google+ API

1. Buka **APIs & Services** → **Library**
2. Cari **"Google+ API"** dan klik
3. Klik **Enable**

### Langkah 3: Configure OAuth Consent Screen

1. Buka **APIs & Services** → **OAuth consent screen**
2. Pilih **External** → **Create**
3. Isi form:
   - **App name**: `Tenunan Songket`
   - **User support email**: Email Anda
   - **Developer contact email**: Email Anda
4. Klik **Save and Continue**
5. Di halaman **Scopes**, klik **Add or Remove Scopes**
   - Pilih: `email`, `profile`, `openid`
   - Klik **Update** → **Save and Continue**
6. Di halaman **Test users**, klik **Save and Continue**
7. Review dan klik **Back to Dashboard**

### Langkah 4: Create OAuth Credentials

1. Buka **APIs & Services** → **Credentials**
2. Klik **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `Tenunan Songket Web`
5. **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   https://tenunan-songket.vercel.app
   https://tenunansongket.com
   ```
6. **Authorized redirect URIs**:

   ```
   http://localhost:3000/auth/callback
   https://tenunan-songket.vercel.app/auth/callback
   https://tenunansongket.com/auth/callback
   ```

   > ✅ Menggunakan domain kustom Anda, bukan Supabase URL!

7. Klik **Create**
8. **Simpan** Client ID dan Client Secret!

### Langkah 5: Masukkan ke Supabase

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project **Tenunan Sambas**
3. Buka **Authentication** → **Providers** → **Google**
4. Enable **Google**
5. Masukkan:
   - **Client ID**: (dari langkah 4)
   - **Client Secret**: (dari langkah 4)
6. Klik **Save**

---

## 2. Setup Facebook OAuth

### Langkah 1: Buat App di Meta Developer

1. Buka [Meta for Developers](https://developers.facebook.com/)
2. Login dengan Facebook account
3. Klik **My Apps** → **Create App**
4. Pilih **Consumer** → **Next**
5. Nama app: `Tenunan Songket`
6. Klik **Create App**

### Langkah 2: Setup Facebook Login

1. Di Dashboard app, klik **Set up** pada **Facebook Login**
2. Pilih **Web**
3. Site URL:
   ```
   https://tenunan-songket.vercel.app
   ```
4. Klik **Save** → **Continue**

### Langkah 3: Configure Settings

1. Buka **Facebook Login** → **Settings** (di sidebar kiri)
2. **Valid OAuth Redirect URIs**:

   ```
   http://localhost:3000/auth/callback
   https://tenunan-songket.vercel.app/auth/callback
   https://tenunansongket.com/auth/callback
   ```

   > ✅ Menggunakan domain kustom Anda!

3. Klik **Save Changes**

### Langkah 4: Get App Credentials

1. Buka **Settings** → **Basic** (di sidebar kiri)
2. Catat:
   - **App ID**: (contoh: `123456789012345`)
   - **App Secret**: Klik **Show** → masukkan password

### Langkah 5: Masukkan ke Supabase

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project **Tenunan Sambas**
3. Buka **Authentication** → **Providers** → **Facebook**
4. Enable **Facebook**
5. Masukkan:
   - **Facebook client ID**: (App ID dari langkah 4)
   - **Facebook secret**: (App Secret dari langkah 4)
6. Klik **Save**

### Langkah 6: Publish App (PENTING!)

1. Kembali ke Meta Developer Dashboard
2. Klik **App Mode: Development** di bagian atas
3. Klik **Live** untuk mengaktifkan
4. Ikuti petunjuk untuk:
   - Terima Data Use policy
   - Complete verification (jika diperlukan)

> ⚠️ Tanpa publish, hanya akun di "Roles" yang bisa login!

---

## 3. Setup Apple OAuth

### Langkah 1: Daftar Apple Developer

1. Buka [Apple Developer Program](https://developer.apple.com/programs/)
2. Enroll ($99/tahun untuk individual)
3. Tunggu approval (1-2 hari)

### Langkah 2: Create App ID

1. Login ke [Apple Developer Portal](https://developer.apple.com/account/)
2. Buka **Certificates, Identifiers & Profiles**
3. Klik **Identifiers** → **+**
4. Pilih **App IDs** → **Continue**
5. Pilih **App** → **Continue**
6. Isi:
   - **Description**: `Tenunan Songket`
   - **Bundle ID**: `com.tenunansongket.web`
7. Scroll ke bawah, centang **Sign In with Apple**
8. Klik **Continue** → **Register**

### Langkah 3: Create Services ID

1. Di **Identifiers**, klik **+**
2. Pilih **Services IDs** → **Continue**
3. Isi:
   - **Description**: `Tenunan Songket Web`
   - **Identifier**: `com.tenunansongket.web.service`
4. Klik **Continue** → **Register**

### Langkah 4: Configure Service ID

1. Klik Services ID yang baru dibuat
2. Centang **Sign In with Apple** → **Configure**
3. Isi:
   - **Primary App ID**: Pilih App ID dari langkah 2
   - **Domains**:
     ```
     tenunansongket.com
     tenunan-songket.vercel.app
     ```
   - **Return URLs**:
     ```
     https://tenunansongket.com/auth/callback
     https://tenunan-songket.vercel.app/auth/callback
     ```
4. Klik **Save** → **Continue** → **Save**

### Langkah 5: Create Key

1. Buka **Keys** → **+**
2. Isi:
   - **Key Name**: `Tenunan Songket Auth`
3. Centang **Sign In with Apple** → **Configure**
4. Pilih Primary App ID → **Save**
5. Klik **Continue** → **Register**
6. **Download** key file (.p8) - SIMPAN BAIK-BAIK!
7. Catat **Key ID**

### Langkah 6: Masukkan ke Supabase

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project **Tenunan Sambas**
3. Buka **Authentication** → **Providers** → **Apple**
4. Enable **Apple**
5. Masukkan:
   - **Service ID (Identifier)**: `com.tenunansongket.web.service`
   - **Secret Key**: (isi konten file .p8)
   - **Key ID**: (dari langkah 5)
   - **Team ID**: (lihat di Apple Developer portal, pojok kanan atas)
6. Klik **Save**

---

## 4. Konfigurasi di Supabase

### Redirect URLs

Pastikan URL ini sudah benar di Supabase:

1. Buka **Authentication** → **URL Configuration**
2. **Site URL**: `https://tenunan-songket.vercel.app`
3. **Redirect URLs** (tambahkan semua):
   ```
   http://localhost:3000/**
   https://tenunan-songket.vercel.app/**
   https://your-custom-domain.com/**
   ```

### Email Templates (Optional)

1. Buka **Authentication** → **Email Templates**
2. Customize template untuk:
   - Confirm signup
   - Reset password
   - Magic Link

---

## 5. Testing

### Test di Local Development

1. Jalankan app:
   ```bash
   npm run dev
   ```
2. Buka `http://localhost:3000/login`
3. Test setiap provider:
   - ✅ Google: Sign in with Google
   - ✅ Facebook: Sign in with Facebook
   - ✅ Apple: Sign in with Apple

### Troubleshooting

#### Google: "redirect_uri_mismatch"

- Pastikan redirect URI di Google Console persis sama dengan Supabase callback URL
- Tambahkan `http://localhost:3000` di Authorized JavaScript origins

#### Facebook: "App Not Setup"

- Pastikan app sudah di-publish ke Live mode
- Tambahkan akun Anda di Roles → Test Users untuk testing di Development mode

#### Apple: "Invalid client"

- Pastikan Services ID sudah dikonfigurasi dengan benar
- Pastikan Key (.p8) dan Key ID cocok
- Pastikan Team ID benar

---

## 📌 Quick Reference

### Supabase Callback URL

```
https://bzxfppzdqsjzafucfjyv.supabase.co/auth/v1/callback
```

### Provider Console Links

- Google: https://console.cloud.google.com/apis/credentials
- Facebook: https://developers.facebook.com/apps
- Apple: https://developer.apple.com/account/resources/identifiers/list

### Environment Variables (jika diperlukan)

```env
# Tidak diperlukan untuk Supabase OAuth
# Supabase menyimpan credentials di dashboard
```

---

## ✅ Checklist

- [ ] Google OAuth configured
- [ ] Facebook OAuth configured
- [ ] Apple OAuth configured
- [ ] Supabase redirect URLs set
- [ ] Tested in development
- [ ] Tested in production

---

Dibuat: 19 Januari 2026
Update: -
