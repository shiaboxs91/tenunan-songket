# Dokumen Persyaratan

## Pendahuluan

Dokumen ini mendefinisikan persyaratan untuk peningkatan panel admin toko e-commerce Tenunan Songket. Fitur ini mencakup redesain dashboard yang lebih profesional dan modern, sidebar dengan tema budaya yang seragam dengan halaman depan, manajemen pengguna lengkap, pengaturan ekspedisi dan pembayaran, serta pengaturan situs termasuk manajemen versi aplikasi untuk cache busting.

## Glosarium

- **Admin_Panel**: Antarmuka administrasi untuk mengelola toko e-commerce
- **Dashboard**: Halaman utama admin yang menampilkan ringkasan statistik dan metrik penjualan
- **Sidebar**: Menu navigasi samping untuk mengakses berbagai fitur admin
- **Site_Settings**: Pengaturan konfigurasi situs seperti logo, nama, dan informasi kontak
- **Shipping_Provider**: Penyedia jasa ekspedisi seperti JNE, J&T, SiCepat
- **Payment_Gateway**: Metode pembayaran seperti Stripe, transfer bank manual
- **App_Version**: Versi aplikasi untuk mengelola cache dan pembaruan paksa
- **User_Management**: Sistem untuk mengelola admin dan pelanggan
- **Sales_Chart**: Grafik visualisasi data penjualan
- **Stock_Alert**: Peringatan untuk produk dengan stok rendah
- **Revenue_Metrics**: Metrik pendapatan dan analisis keuangan

## Persyaratan

### Persyaratan 1: Dashboard Profesional dan Modern

**User Story:** Sebagai admin, saya ingin melihat dashboard yang profesional dan modern dengan visualisasi data penjualan, stok, dan metrik pendapatan, sehingga saya dapat memantau performa toko dengan mudah dan efisien.

#### Kriteria Penerimaan

1. WHEN admin mengakses halaman dashboard, THE Dashboard SHALL menampilkan kartu statistik utama (total pesanan, pendapatan, pelanggan, produk) dengan desain modern dan ikon yang relevan
2. WHEN admin melihat dashboard, THE Dashboard SHALL menampilkan grafik penjualan 30 hari terakhir menggunakan chart library (Recharts/Chart.js) dengan visualisasi yang menarik
3. WHEN admin melihat dashboard, THE Dashboard SHALL menampilkan daftar pesanan terbaru dengan status dan informasi pelanggan
4. WHEN produk memiliki stok di bawah threshold (default: 10), THE Dashboard SHALL menampilkan alert stok rendah dengan daftar produk yang perlu diperhatikan
5. WHEN admin melihat dashboard, THE Dashboard SHALL menampilkan metrik pendapatan harian, mingguan, dan bulanan dengan perbandingan periode sebelumnya
6. WHEN admin melihat dashboard, THE Dashboard SHALL menampilkan top 5 produk terlaris dalam periode tertentu
7. WHEN admin melihat dashboard, THE Dashboard SHALL menampilkan ringkasan status pesanan (pending, processing, shipped, delivered, cancelled) dalam bentuk visual
8. THE Dashboard SHALL menggunakan color scheme yang konsisten dengan tema amber/gold dari halaman depan

### Persyaratan 2: Redesain Sidebar Menu

**User Story:** Sebagai admin, saya ingin sidebar menu yang lebih profesional dan modern dengan gaya budaya/kain yang seragam dengan halaman depan, sehingga pengalaman navigasi lebih menyenangkan dan konsisten.

#### Kriteria Penerimaan

1. THE Sidebar SHALL menggunakan tema warna amber/gold yang konsisten dengan header halaman depan
2. THE Sidebar SHALL menampilkan logo Tenunan Songket di bagian atas dengan styling yang elegan
3. WHEN admin hover pada menu item, THE Sidebar SHALL menampilkan efek hover dengan transisi smooth dan warna amber
4. THE Sidebar SHALL mengelompokkan menu dalam kategori logis: Dashboard, Katalog (Produk, Kategori), Penjualan (Pesanan, Kupon), Pengguna (Admin, Pelanggan), Pengaturan (Ekspedisi, Pembayaran, Situs)
5. WHEN menu item aktif, THE Sidebar SHALL menampilkan indikator visual yang jelas dengan background amber dan border accent
6. THE Sidebar SHALL menampilkan ikon yang relevan untuk setiap menu item menggunakan Lucide icons
7. THE Sidebar SHALL memiliki footer dengan informasi versi aplikasi dan tombol logout yang styled
8. WHEN layar mobile/tablet, THE Sidebar SHALL dapat di-collapse menjadi icon-only mode atau drawer

### Persyaratan 3: Manajemen Pengguna Lengkap

**User Story:** Sebagai admin, saya ingin dapat mengelola admin lain dan pelanggan yang terdaftar, sehingga saya dapat mengontrol akses dan melihat informasi pengguna dengan lengkap.

#### Kriteria Penerimaan

1. WHEN admin mengakses menu Admin, THE User_Management SHALL menampilkan daftar semua admin dengan informasi nama, email, tanggal bergabung, dan status aktif
2. WHEN admin mengklik tombol "Tambah Admin", THE User_Management SHALL menampilkan form untuk menambah admin baru dengan field: email, nama lengkap, dan password
3. WHEN admin baru ditambahkan, THE User_Management SHALL membuat akun dengan role "admin" di Supabase Auth dan profiles table
4. WHEN admin mengakses menu Pelanggan, THE User_Management SHALL menampilkan daftar pelanggan dengan informasi: nama, email, tanggal bergabung, total pesanan, total belanja
5. WHEN admin mencari pengguna, THE User_Management SHALL mendukung pencarian berdasarkan nama atau email
6. WHEN admin melihat detail pelanggan, THE User_Management SHALL menampilkan riwayat pesanan dan alamat tersimpan
7. IF admin mencoba menghapus admin terakhir, THEN THE User_Management SHALL mencegah penghapusan dan menampilkan pesan error
8. WHEN admin mengubah role pengguna, THE User_Management SHALL memperbarui role di profiles table

### Persyaratan 4: Pengaturan Ekspedisi

**User Story:** Sebagai admin, saya ingin dapat mengatur penyedia jasa ekspedisi yang tersedia, sehingga pelanggan dapat memilih opsi pengiriman yang sesuai.

#### Kriteria Penerimaan

1. WHEN admin mengakses menu Ekspedisi, THE Shipping_Provider SHALL menampilkan daftar ekspedisi yang tersedia dengan status aktif/nonaktif
2. THE Shipping_Provider SHALL mendukung ekspedisi lokal Indonesia: JNE, J&T Express, SiCepat, Pos Indonesia, Anteraja, Ninja Express
3. WHEN admin menambah ekspedisi baru, THE Shipping_Provider SHALL menyimpan informasi: nama, kode, logo URL, layanan tersedia, dan status aktif
4. WHEN admin mengaktifkan/menonaktifkan ekspedisi, THE Shipping_Provider SHALL memperbarui status dan mempengaruhi opsi di halaman checkout
5. WHEN admin mengatur layanan ekspedisi, THE Shipping_Provider SHALL mendukung multiple layanan per ekspedisi (REG, YES, OKE untuk JNE)
6. THE Shipping_Provider SHALL menyimpan estimasi waktu pengiriman dan biaya dasar untuk setiap layanan
7. WHEN ekspedisi dinonaktifkan, THE Shipping_Provider SHALL tidak menampilkan ekspedisi tersebut di halaman checkout pelanggan

### Persyaratan 5: Pengaturan Pembayaran

**User Story:** Sebagai admin, saya ingin dapat mengatur metode pembayaran yang tersedia, sehingga pelanggan dapat memilih cara bayar yang nyaman.

#### Kriteria Penerimaan

1. WHEN admin mengakses menu Pembayaran, THE Payment_Gateway SHALL menampilkan daftar metode pembayaran dengan status aktif/nonaktif
2. THE Payment_Gateway SHALL mendukung Stripe untuk pembayaran kartu kredit/debit internasional
3. THE Payment_Gateway SHALL mendukung transfer bank manual dengan informasi rekening yang dapat dikonfigurasi
4. WHEN admin mengatur Stripe, THE Payment_Gateway SHALL menyimpan API keys (publishable dan secret) secara aman
5. WHEN admin mengatur transfer bank, THE Payment_Gateway SHALL mendukung multiple rekening bank dengan informasi: nama bank, nomor rekening, nama pemilik
6. WHEN admin mengaktifkan/menonaktifkan metode pembayaran, THE Payment_Gateway SHALL memperbarui opsi di halaman checkout
7. THE Payment_Gateway SHALL menampilkan instruksi pembayaran yang dapat dikustomisasi untuk setiap metode
8. IF Stripe API key tidak valid, THEN THE Payment_Gateway SHALL menampilkan pesan error dan tidak mengaktifkan Stripe

### Persyaratan 6: Pengaturan Situs

**User Story:** Sebagai admin, saya ingin dapat mengatur informasi dasar situs seperti logo, nama, kontak, dan media sosial, sehingga branding toko dapat dikelola dengan mudah.

#### Kriteria Penerimaan

1. WHEN admin mengakses menu Pengaturan Situs, THE Site_Settings SHALL menampilkan form pengaturan dengan tab/section yang terorganisir
2. THE Site_Settings SHALL mendukung pengaturan: nama situs, tagline, logo URL, favicon URL
3. THE Site_Settings SHALL mendukung pengaturan kontak: email, nomor telepon, alamat toko, WhatsApp
4. THE Site_Settings SHALL mendukung pengaturan media sosial: Instagram, Facebook, Twitter/X, TikTok
5. WHEN admin mengupload logo baru, THE Site_Settings SHALL menyimpan ke Supabase Storage dan memperbarui URL
6. WHEN pengaturan disimpan, THE Site_Settings SHALL memperbarui data di database dan me-refresh cache
7. THE Site_Settings SHALL menampilkan preview perubahan sebelum disimpan
8. THE Site_Settings SHALL mendukung pengaturan SEO: meta title, meta description, keywords

### Persyaratan 7: Manajemen Versi Aplikasi

**User Story:** Sebagai admin, saya ingin dapat mengelola versi aplikasi untuk mengontrol cache pengguna, sehingga pengguna selalu mendapatkan versi terbaru dan cache lama dapat dihapus.

#### Kriteria Penerimaan

1. WHEN admin mengakses pengaturan versi, THE App_Version SHALL menampilkan versi aplikasi saat ini dan riwayat versi sebelumnya
2. THE App_Version SHALL menyimpan informasi versi: nomor versi (semver), tanggal rilis, catatan perubahan, flag wajib update
3. WHEN admin membuat versi baru dengan flag "wajib update", THE App_Version SHALL memaksa pengguna untuk refresh/clear cache
4. WHEN pengguna mengakses aplikasi dengan versi lama dan ada versi baru wajib, THE App_Version SHALL menampilkan modal/banner untuk update
5. THE App_Version SHALL menyimpan versi di localStorage pengguna untuk perbandingan
6. WHEN versi baru dirilis, THE App_Version SHALL mengirim header cache-control yang sesuai
7. THE App_Version SHALL mendukung rollback ke versi sebelumnya jika diperlukan
8. WHEN admin melihat statistik versi, THE App_Version SHALL menampilkan jumlah pengguna per versi (opsional)

### Persyaratan 8: Responsivitas dan Aksesibilitas

**User Story:** Sebagai admin, saya ingin panel admin yang responsif dan dapat diakses dari berbagai perangkat, sehingga saya dapat mengelola toko dari mana saja.

#### Kriteria Penerimaan

1. THE Admin_Panel SHALL responsif dan dapat digunakan pada desktop, tablet, dan mobile
2. WHEN layar berukuran mobile, THE Admin_Panel SHALL menggunakan layout yang dioptimalkan dengan sidebar collapsible
3. THE Admin_Panel SHALL memenuhi standar aksesibilitas WCAG 2.1 level AA
4. THE Admin_Panel SHALL mendukung navigasi keyboard untuk semua fitur utama
5. THE Admin_Panel SHALL memiliki kontras warna yang memadai untuk keterbacaan
6. WHEN terjadi error, THE Admin_Panel SHALL menampilkan pesan error yang jelas dan actionable
7. THE Admin_Panel SHALL memiliki loading states yang informatif untuk operasi async
