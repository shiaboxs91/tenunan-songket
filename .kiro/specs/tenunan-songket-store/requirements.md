# Requirements Document

## Introduction

TenunanSongket Store adalah aplikasi e-commerce frontend demo untuk menjual produk tenunan songket dengan tampilan modern minimalis dan aksen warna marun. Aplikasi ini menampilkan produk dari RSS feed dengan alur pembelian lengkap (demo) dari browsing hingga checkout sukses.

## Glossary

- **Storefront**: Tampilan depan toko online yang dilihat pelanggan
- **Product_Listing**: Halaman yang menampilkan daftar produk dengan filter dan sorting
- **Product_Detail**: Halaman yang menampilkan informasi lengkap satu produk
- **Cart**: Keranjang belanja yang menyimpan produk yang akan dibeli
- **Checkout**: Proses penyelesaian pembelian dengan mengisi alamat dan memilih pengiriman
- **RSS_Feed**: Sumber data produk dari https://tenunansongket.com/feed/
- **Snapshot**: Data cadangan produk dalam format JSON jika RSS feed gagal diakses
- **Filter**: Fitur untuk menyaring produk berdasarkan kategori, harga, atau stok
- **Sort**: Fitur untuk mengurutkan produk (terbaru, termurah, terlaris)

## Requirements

### Requirement 1: Navigasi dan Layout Global

**User Story:** As a customer, I want a consistent navigation experience across all pages, so that I can easily browse the store and access key features.

#### Acceptance Criteria

1. THE Header SHALL display logo on the left, search bar in center (desktop), and category dropdown, cart icon, account link on the right
2. WHEN viewing on mobile device, THE Header SHALL display hamburger menu that opens a Sheet navigation
3. THE Header SHALL remain sticky at the top of the viewport during scrolling
4. THE Footer SHALL display links for Cara Order, Tentang, Kontak, and social media
5. THE Footer SHALL display a brief brand story about TenunanSongket

### Requirement 2: Halaman Home

**User Story:** As a customer, I want to see an attractive homepage, so that I can discover products and understand the brand.

#### Acceptance Criteria

1. THE Home_Page SHALL display a hero banner with headline, subheadline, and CTA button "Belanja Sekarang"
2. THE Home_Page SHALL display popular categories as clickable chips or tiles
3. THE Home_Page SHALL display a grid of popular products
4. THE Home_Page SHALL display a grid of latest products
5. THE Home_Page SHALL display USP section highlighting handmade quality and cultural heritage

### Requirement 3: Halaman Listing Produk

**User Story:** As a customer, I want to browse and filter products, so that I can find items that match my preferences.

#### Acceptance Criteria

1. THE Product_Listing SHALL display products in a responsive grid layout
2. WHEN on desktop, THE Product_Listing SHALL display filter sidebar on the left
3. WHEN on mobile, THE Product_Listing SHALL provide filter access via Sheet component
4. THE Filter SHALL allow filtering by category, price range, and stock availability
5. THE Sort SHALL allow sorting by newest, cheapest, and best-selling
6. THE Product_Listing SHALL support pagination with querystring parameters
7. WHEN search query is provided, THE Product_Listing SHALL filter products matching the query
8. THE Product_Listing SHALL display loading skeleton while fetching data

### Requirement 4: Halaman Detail Produk

**User Story:** As a customer, I want to view detailed product information, so that I can make an informed purchase decision.

#### Acceptance Criteria

1. THE Product_Detail SHALL display product image gallery with carousel and thumbnails
2. THE Product_Detail SHALL display product title, rating, sold count, and price
3. THE Product_Detail SHALL display variant selector for motif/size (demo)
4. THE Product_Detail SHALL display "Add to Cart" button with primary marun style
5. THE Product_Detail SHALL display "Buy Now" button with secondary outline style
6. THE Product_Detail SHALL display tabs for Description, Shipping info, and Care instructions
7. THE Product_Detail SHALL display recommended products section

### Requirement 5: Keranjang Belanja

**User Story:** As a customer, I want to manage items in my cart, so that I can review and adjust my order before checkout.

#### Acceptance Criteria

1. THE Cart SHALL display list of added items with product image, title, and price
2. THE Cart SHALL provide quantity stepper to increase or decrease item quantity
3. THE Cart SHALL provide remove button to delete items from cart
4. THE Cart SHALL display order summary with subtotal, shipping (demo), tax (demo), and total
5. THE Cart SHALL persist data to localStorage so items remain after page refresh
6. THE Cart SHALL display "Checkout" CTA button
7. WHEN cart is empty, THE Cart SHALL display empty state with CTA to continue shopping

### Requirement 6: Proses Checkout

**User Story:** As a customer, I want to complete my purchase through a guided checkout process, so that I can place my order.

#### Acceptance Criteria

1. THE Checkout SHALL display 3-step stepper: Address, Shipping, Summary
2. WHEN on Address step, THE Checkout SHALL display form for shipping address input
3. WHEN on Shipping step, THE Checkout SHALL display shipping options (demo)
4. WHEN on Summary step, THE Checkout SHALL display order review with all items and totals
5. WHEN checkout is submitted, THE Checkout SHALL redirect to success page
6. THE Checkout SHALL validate required fields before allowing progression to next step

### Requirement 7: Halaman Sukses

**User Story:** As a customer, I want confirmation that my order was placed, so that I know the transaction completed.

#### Acceptance Criteria

1. THE Success_Page SHALL display dummy order number
2. THE Success_Page SHALL display brief order summary
3. THE Success_Page SHALL display CTA button to return to shopping

### Requirement 8: Halaman Akun

**User Story:** As a customer, I want to access my account, so that I can manage my profile and view order history.

#### Acceptance Criteria

1. THE Account_Page SHALL display login form UI (demo)
2. THE Account_Page SHALL display register form UI (demo)
3. THE Account_Page SHALL display basic profile section (demo)

### Requirement 9: Data Produk dari RSS Feed

**User Story:** As a system, I want to fetch product data from RSS feed, so that the store displays real content.

#### Acceptance Criteria

1. THE API SHALL provide GET /api/products endpoint that fetches RSS feed from https://tenunansongket.com/feed/
2. THE API SHALL parse XML and map RSS items to Product type with id, slug, title, description, image, price, category, tags, inStock, rating, sold, createdAt, sourceUrl
3. THE API SHALL generate consistent dummy values for price, rating, sold, inStock based on product id seed
4. IF RSS feed fetch fails, THEN THE API SHALL return data from products.snapshot.json fallback
5. THE API SHALL extract image from enclosure or media:content, or use placeholder if unavailable

### Requirement 10: Desain Visual Modern Minimal Marun

**User Story:** As a brand owner, I want the store to reflect modern minimal design with marun accent, so that it represents the brand identity.

#### Acceptance Criteria

1. THE Design_System SHALL use marun (#7A1F3D) as primary accent color for CTAs, active links, and badges
2. THE Design_System SHALL use white/light gray background with dark slate text
3. THE Design_System SHALL use Inter font for typography
4. THE Design_System SHALL display subtle songket motif pattern in hero and footer sections with low opacity
5. THE Product_Card SHALL have minimal border, soft shadow on hover
6. THE Primary_Button SHALL use solid marun background
7. THE Secondary_Button SHALL use marun outline style

### Requirement 11: Responsivitas dan Performa

**User Story:** As a customer, I want the store to work well on any device, so that I can shop from mobile or desktop.

#### Acceptance Criteria

1. THE Storefront SHALL be fully responsive from 360px to 1440px viewport width
2. THE Storefront SHALL use Server Components by default for product listing and detail pages
3. THE Storefront SHALL use Client Components only for interactive features (cart, filters)
4. THE Storefront SHALL display Skeleton loading states while data is being fetched
5. IF data is insufficient, THEN THE Storefront SHALL display elegant fallback UI instead of broken placeholders
