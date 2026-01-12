# Requirements Document

## Introduction

Dokumen ini mendefinisikan requirements lengkap untuk backend e-commerce Tenunan Songket menggunakan Supabase sebagai database dan authentication provider. Sistem ini akan menangani manajemen produk, akun pengguna, keranjang belanja, pesanan, pembayaran, pengiriman, review, wishlist, notifikasi, dan panel admin.

## Glossary

- **Supabase**: Platform Backend-as-a-Service yang menyediakan PostgreSQL database, authentication, storage, dan realtime subscriptions
- **RLS**: Row Level Security - fitur PostgreSQL untuk mengontrol akses data per baris
- **User**: Pengguna yang terdaftar di sistem (customer atau admin)
- **Customer**: Pengguna yang berbelanja di toko
- **Admin**: Pengguna dengan hak akses untuk mengelola toko
- **Product**: Kain tenunan songket yang dijual
- **Category**: Kategori produk (Bertabur, Arap Gegati, Jongsarat, dll)
- **Cart**: Keranjang belanja sementara
- **Order**: Pesanan yang sudah dikonfirmasi
- **Order_Item**: Item individual dalam pesanan
- **Payment**: Informasi pembayaran untuk pesanan
- **Shipping**: Informasi pengiriman pesanan
- **Review**: Ulasan produk dari customer
- **Wishlist**: Daftar produk favorit customer
- **Address**: Alamat pengiriman customer
- **Notification**: Pemberitahuan untuk user
- **Coupon**: Kode diskon/voucher
- **Inventory_Log**: Log perubahan stok produk

---

## Requirements

### Requirement 1: Autentikasi Pengguna

**User Story:** Sebagai pengguna, saya ingin mendaftar dan masuk ke akun saya, sehingga saya dapat mengakses fitur personalisasi dan melakukan pembelian.

#### Acceptance Criteria

1. WHEN pengguna mendaftar dengan email dan password, THE Auth_System SHALL membuat akun baru dan mengirim email verifikasi
2. WHEN pengguna mendaftar dengan Google OAuth, THE Auth_System SHALL membuat akun baru menggunakan data Google
3. WHEN pengguna login dengan kredensial valid, THE Auth_System SHALL mengembalikan session token dan data user
4. WHEN pengguna login dengan kredensial invalid, THE Auth_System SHALL mengembalikan error message yang sesuai
5. WHEN pengguna request reset password, THE Auth_System SHALL mengirim email dengan link reset
6. WHEN pengguna logout, THE Auth_System SHALL menghapus session dan token
7. THE Auth_System SHALL menyimpan profile user (nama, telepon, avatar) di tabel profiles
8. WHEN session token expired, THE Auth_System SHALL melakukan refresh token otomatis

---

### Requirement 2: Manajemen Profil Pengguna

**User Story:** Sebagai customer, saya ingin mengelola profil dan alamat saya, sehingga informasi pengiriman selalu akurat.

#### Acceptance Criteria

1. WHEN customer mengupdate profil, THE Profile_System SHALL menyimpan perubahan nama, telepon, dan avatar
2. WHEN customer menambah alamat baru, THE Address_System SHALL menyimpan alamat dengan label (Rumah/Kantor/Lainnya)
3. WHEN customer memiliki multiple alamat, THE Address_System SHALL memungkinkan set alamat default
4. WHEN customer menghapus alamat, THE Address_System SHALL soft delete alamat tersebut
5. THE Profile_System SHALL menyimpan preferensi notifikasi customer (email, WhatsApp, push)
6. WHEN customer mengupload avatar, THE Storage_System SHALL menyimpan gambar di Supabase Storage

---

### Requirement 3: Manajemen Produk

**User Story:** Sebagai admin, saya ingin mengelola katalog produk, sehingga customer dapat melihat produk terbaru dan akurat.

#### Acceptance Criteria

1. THE Product_System SHALL menyimpan data produk: id, slug, title, description, price, category_id, images, stock, weight, dimensions
2. WHEN admin menambah produk baru, THE Product_System SHALL generate slug unik dari title
3. WHEN admin mengupload gambar produk, THE Storage_System SHALL menyimpan di Supabase Storage dengan optimasi
4. WHEN admin mengupdate stok, THE Inventory_System SHALL mencatat log perubahan stok
5. THE Product_System SHALL mendukung multiple images per produk (gallery)
6. WHEN produk dihapus, THE Product_System SHALL soft delete (set is_deleted = true)
7. THE Product_System SHALL menyimpan metadata SEO (meta_title, meta_description)
8. WHEN stok produk habis, THE Product_System SHALL otomatis set status in_stock = false

---

### Requirement 4: Manajemen Kategori

**User Story:** Sebagai admin, saya ingin mengelola kategori produk, sehingga produk terorganisir dengan baik.

#### Acceptance Criteria

1. THE Category_System SHALL menyimpan data kategori: id, name, slug, description, image, parent_id
2. WHEN admin menambah kategori, THE Category_System SHALL generate slug unik dari name
3. THE Category_System SHALL mendukung kategori hierarki (parent-child)
4. WHEN kategori dihapus yang memiliki produk, THE Category_System SHALL mencegah penghapusan
5. THE Category_System SHALL menyimpan urutan tampilan (display_order)

---

### Requirement 5: Keranjang Belanja

**User Story:** Sebagai customer, saya ingin menambah produk ke keranjang, sehingga saya dapat membeli multiple produk sekaligus.

#### Acceptance Criteria

1. WHEN customer menambah produk ke cart, THE Cart_System SHALL menyimpan product_id, quantity, dan user_id
2. WHEN customer menambah produk yang sudah ada di cart, THE Cart_System SHALL increment quantity
3. WHEN customer mengubah quantity, THE Cart_System SHALL validasi terhadap stok tersedia
4. WHEN customer menghapus item dari cart, THE Cart_System SHALL remove item tersebut
5. THE Cart_System SHALL menghitung subtotal, diskon, dan total secara realtime
6. WHEN customer belum login, THE Cart_System SHALL menyimpan cart di localStorage dan sync setelah login
7. WHEN produk di cart stoknya habis, THE Cart_System SHALL menampilkan warning dan disable checkout untuk item tersebut
8. THE Cart_System SHALL auto-expire cart items setelah 7 hari tidak aktif

---

### Requirement 6: Sistem Pesanan

**User Story:** Sebagai customer, saya ingin melakukan checkout dan melihat status pesanan, sehingga saya dapat melacak pembelian saya.

#### Acceptance Criteria

1. WHEN customer checkout, THE Order_System SHALL membuat order dengan status 'pending_payment'
2. THE Order_System SHALL generate nomor order unik dengan format: TS-YYYYMMDD-XXXXX
3. WHEN order dibuat, THE Order_System SHALL menyimpan snapshot harga produk saat itu
4. THE Order_System SHALL menyimpan order_items dengan product_id, quantity, price, subtotal
5. WHEN order dibuat, THE Inventory_System SHALL reserve stok (kurangi available_stock)
6. IF pembayaran tidak dilakukan dalam 24 jam, THEN THE Order_System SHALL auto-cancel order dan restore stok
7. THE Order_System SHALL track status: pending_payment, paid, processing, shipped, delivered, completed, cancelled, refunded
8. WHEN status order berubah, THE Notification_System SHALL kirim notifikasi ke customer
9. THE Order_System SHALL menyimpan alamat pengiriman sebagai snapshot (tidak reference ke addresses)
10. WHEN order completed, THE Order_System SHALL update total_sold di produk

---

### Requirement 7: Sistem Pembayaran Internasional

**User Story:** Sebagai customer internasional, saya ingin membayar pesanan dengan metode pembayaran global, sehingga saya dapat berbelanja dari negara manapun.

#### Acceptance Criteria

1. THE Payment_System SHALL mendukung metode: Credit Card (Visa, Mastercard, Amex), PayPal, Stripe
2. THE Payment_System SHALL mendukung multi-currency: USD, MYR, SGD, BND, EUR, GBP
3. WHEN customer memilih metode pembayaran, THE Payment_System SHALL redirect ke payment gateway (Stripe/PayPal)
4. THE Payment_System SHALL menyimpan: order_id, method, amount, currency, status, transaction_id, paid_at
5. WHEN pembayaran Credit Card, THE Payment_System SHALL menggunakan Stripe Checkout atau PayPal
6. WHEN payment gateway mengirim webhook, THE Payment_System SHALL update status dan trigger order processing
7. IF pembayaran gagal/expired, THEN THE Payment_System SHALL update status dan notify customer
8. THE Payment_System SHALL menyimpan exchange rate saat transaksi untuk reporting
9. THE Payment_System SHALL mendukung refund via payment gateway
10. THE Payment_System SHALL comply dengan PCI-DSS (tidak menyimpan card data)

---

### Requirement 8: Sistem Pengiriman Internasional

**User Story:** Sebagai customer internasional, saya ingin memilih jasa pengiriman ke negara saya dan melacak paket, sehingga saya tahu kapan pesanan tiba.

#### Acceptance Criteria

1. THE Shipping_System SHALL mendukung kurir internasional: DHL, FedEx, UPS, EMS, Pos Indonesia International
2. THE Shipping_System SHALL menyimpan daftar negara tujuan yang didukung dengan shipping zones
3. WHEN customer checkout, THE Shipping_System SHALL menghitung ongkir berdasarkan berat, dimensi, dan negara tujuan
4. THE Shipping_System SHALL menyimpan: order_id, courier, service, tracking_number, shipping_cost, currency, estimated_days
5. WHEN admin input tracking number, THE Shipping_System SHALL update order status ke 'shipped'
6. THE Shipping_System SHALL fetch tracking status dari API kurir internasional secara periodik
7. WHEN paket delivered, THE Shipping_System SHALL update status dan notify customer
8. THE Shipping_System SHALL menyimpan shipping_address dengan format internasional (country, state, city, postal_code)
9. THE Shipping_System SHALL menghitung customs declaration value untuk dokumen ekspor
10. THE Shipping_System SHALL mendukung shipping insurance untuk pengiriman internasional
11. WHEN berat total melebihi limit kurir, THE Shipping_System SHALL split menjadi multiple shipments

---

### Requirement 9: Sistem Review & Rating

**User Story:** Sebagai customer, saya ingin memberikan review produk, sehingga customer lain dapat melihat pengalaman saya.

#### Acceptance Criteria

1. WHEN customer sudah menerima pesanan, THE Review_System SHALL memungkinkan submit review
2. THE Review_System SHALL menyimpan: product_id, user_id, order_id, rating (1-5), review_text, images
3. WHEN review disubmit, THE Review_System SHALL update average_rating di produk
4. THE Review_System SHALL mencegah duplicate review untuk order_item yang sama
5. WHEN admin approve review, THE Review_System SHALL set is_published = true
6. THE Review_System SHALL mendukung helpful votes dari customer lain
7. WHEN review mengandung kata tidak pantas, THE Review_System SHALL auto-flag untuk moderasi

---

### Requirement 10: Wishlist

**User Story:** Sebagai customer, saya ingin menyimpan produk favorit, sehingga saya dapat membelinya nanti.

#### Acceptance Criteria

1. WHEN customer menambah produk ke wishlist, THE Wishlist_System SHALL menyimpan user_id dan product_id
2. WHEN customer menghapus dari wishlist, THE Wishlist_System SHALL remove item tersebut
3. THE Wishlist_System SHALL mencegah duplicate product di wishlist user yang sama
4. WHEN produk di wishlist turun harga, THE Notification_System SHALL notify customer
5. WHEN produk di wishlist kembali tersedia, THE Notification_System SHALL notify customer

---

### Requirement 11: Sistem Kupon & Diskon

**User Story:** Sebagai admin, saya ingin membuat kupon diskon, sehingga dapat menarik customer untuk berbelanja.

#### Acceptance Criteria

1. THE Coupon_System SHALL menyimpan: code, type (percentage/fixed), value, min_purchase, max_discount
2. THE Coupon_System SHALL menyimpan: start_date, end_date, usage_limit, used_count
3. WHEN customer apply coupon, THE Coupon_System SHALL validasi eligibility
4. IF coupon expired atau limit tercapai, THEN THE Coupon_System SHALL reject dengan pesan error
5. THE Coupon_System SHALL mendukung coupon untuk kategori tertentu atau semua produk
6. WHEN coupon digunakan, THE Coupon_System SHALL increment used_count
7. THE Coupon_System SHALL menyimpan coupon_usages untuk track siapa yang sudah pakai

---

### Requirement 12: Sistem Notifikasi

**User Story:** Sebagai pengguna, saya ingin menerima notifikasi penting, sehingga saya tidak ketinggalan update pesanan.

#### Acceptance Criteria

1. THE Notification_System SHALL menyimpan: user_id, type, title, message, data, is_read, created_at
2. WHEN event penting terjadi, THE Notification_System SHALL create notification record
3. THE Notification_System SHALL mendukung channel: in-app, email, WhatsApp
4. WHEN user membaca notifikasi, THE Notification_System SHALL update is_read = true
5. THE Notification_System SHALL batch notifications untuk menghindari spam
6. WHEN user disable channel tertentu, THE Notification_System SHALL respect preference tersebut

---

### Requirement 13: Panel Admin

**User Story:** Sebagai admin, saya ingin dashboard untuk mengelola toko, sehingga operasional berjalan lancar.

#### Acceptance Criteria

1. THE Admin_System SHALL menampilkan dashboard dengan statistik: total orders, revenue, customers, products
2. THE Admin_System SHALL menampilkan grafik penjualan harian/mingguan/bulanan
3. WHEN admin mengakses halaman admin, THE Auth_System SHALL validasi role = 'admin'
4. THE Admin_System SHALL menyediakan CRUD untuk: products, categories, orders, users, coupons
5. THE Admin_System SHALL menyediakan fitur export data ke CSV/Excel
6. THE Admin_System SHALL log semua aktivitas admin di audit_logs
7. WHEN ada order baru, THE Admin_System SHALL tampilkan realtime notification

---

### Requirement 14: Inventory Management

**User Story:** Sebagai admin, saya ingin mengelola stok produk, sehingga tidak terjadi overselling.

#### Acceptance Criteria

1. THE Inventory_System SHALL track: product_id, total_stock, reserved_stock, available_stock
2. WHEN order dibuat, THE Inventory_System SHALL reserve stock (available -= quantity)
3. WHEN order cancelled, THE Inventory_System SHALL release reserved stock
4. WHEN order completed, THE Inventory_System SHALL commit reserved stock (total -= quantity)
5. THE Inventory_System SHALL log semua perubahan stok dengan reason
6. WHEN available_stock <= low_stock_threshold, THE Notification_System SHALL alert admin
7. THE Inventory_System SHALL mendukung stock adjustment manual oleh admin

---

### Requirement 15: Laporan & Analytics

**User Story:** Sebagai admin, saya ingin melihat laporan penjualan, sehingga dapat membuat keputusan bisnis yang tepat.

#### Acceptance Criteria

1. THE Report_System SHALL generate laporan penjualan per periode (harian, mingguan, bulanan)
2. THE Report_System SHALL menampilkan top selling products
3. THE Report_System SHALL menampilkan revenue breakdown by category
4. THE Report_System SHALL menampilkan customer acquisition dan retention metrics
5. THE Report_System SHALL menampilkan conversion rate (visitors to buyers)
6. THE Report_System SHALL menyimpan aggregated data di tabel terpisah untuk performa

---

### Requirement 16: Keamanan & Row Level Security

**User Story:** Sebagai system architect, saya ingin data terlindungi dengan baik, sehingga tidak ada akses tidak sah.

#### Acceptance Criteria

1. THE Security_System SHALL implement RLS pada semua tabel user-facing
2. WHEN user query data, THE RLS_Policy SHALL filter berdasarkan user_id atau role
3. THE Security_System SHALL encrypt sensitive data (payment info) at rest
4. THE Security_System SHALL rate limit API requests per user
5. THE Security_System SHALL validate semua input untuk mencegah SQL injection
6. THE Security_System SHALL log failed authentication attempts
7. WHEN suspicious activity detected, THE Security_System SHALL lock account temporarily

---

### Requirement 17: File Storage

**User Story:** Sebagai pengguna, saya ingin upload dan akses file dengan aman, sehingga gambar produk dan bukti pembayaran tersimpan dengan baik.

#### Acceptance Criteria

1. THE Storage_System SHALL organize files dalam buckets: products, avatars, reviews, payments
2. WHEN file diupload, THE Storage_System SHALL validate type dan size
3. THE Storage_System SHALL generate optimized thumbnails untuk gambar produk
4. THE Storage_System SHALL set appropriate access policies per bucket
5. WHEN file dihapus, THE Storage_System SHALL cleanup dari storage
6. THE Storage_System SHALL generate signed URLs untuk file private

---

### Requirement 18: Realtime Features

**User Story:** Sebagai pengguna, saya ingin melihat update secara realtime, sehingga informasi selalu terkini.

#### Acceptance Criteria

1. WHEN order status berubah, THE Realtime_System SHALL broadcast ke customer terkait
2. WHEN ada order baru, THE Realtime_System SHALL notify admin dashboard
3. WHEN stok produk berubah, THE Realtime_System SHALL update tampilan produk
4. THE Realtime_System SHALL menggunakan Supabase Realtime subscriptions
5. WHEN connection lost, THE Realtime_System SHALL auto-reconnect dan sync missed updates

---

### Requirement 19: Migrasi Data Existing

**User Story:** Sebagai admin, saya ingin data produk existing termigrasi dengan baik, sehingga tidak ada data yang hilang.

#### Acceptance Criteria

1. THE Migration_System SHALL import semua produk dari products.snapshot.json
2. THE Migration_System SHALL map kategori existing ke tabel categories
3. THE Migration_System SHALL preserve semua field: slug, title, description, price, images, gallery
4. THE Migration_System SHALL generate UUID baru untuk setiap produk
5. WHEN migrasi selesai, THE Migration_System SHALL validate data integrity

---

### Requirement 20: API & Edge Functions

**User Story:** Sebagai developer, saya ingin API yang konsisten dan terdokumentasi, sehingga frontend dapat terintegrasi dengan baik.

#### Acceptance Criteria

1. THE API_System SHALL expose RESTful endpoints via Supabase auto-generated API
2. THE API_System SHALL implement Edge Functions untuk business logic kompleks
3. WHEN request invalid, THE API_System SHALL return error dengan format konsisten
4. THE API_System SHALL implement pagination untuk list endpoints
5. THE API_System SHALL support filtering dan sorting via query parameters
6. THE API_System SHALL rate limit requests untuk mencegah abuse
7. THE API_System SHALL log semua requests untuk debugging



---

### Requirement 21: Multi-Language Support (Melayu/English)

**User Story:** Sebagai customer internasional, saya ingin mengubah bahasa website ke English, sehingga saya dapat memahami konten dengan lebih baik.

#### Acceptance Criteria

1. THE Language_System SHALL mendukung dua bahasa: Melayu (default) dan English
2. WHEN user mengklik tombol language switcher, THE Language_System SHALL mengubah bahasa seluruh halaman
3. THE Language_System SHALL menyimpan preferensi bahasa di localStorage
4. WHEN user kembali ke website, THE Language_System SHALL menggunakan bahasa yang tersimpan
5. THE Language_System SHALL menampilkan tombol language switcher di header untuk desktop dan mobile
6. THE Language_System SHALL menggunakan next-intl atau solusi i18n Next.js untuk translation
7. THE Language_System SHALL translate semua static text: navigation, buttons, labels, messages
8. THE Language_System SHALL NOT translate dynamic content (product names, descriptions) - ini tetap dalam bahasa asli

