# Requirements Document

## Introduction

Dokumen ini mendefinisikan requirements untuk peningkatan UI/UX TenunanSongket Store agar lebih profesional dan modern, baik untuk tampilan mobile maupun desktop. Fokus utama adalah meningkatkan konversi, kemudahan navigasi, dan pengalaman belanja yang seamless.

## Glossary

- **System**: Aplikasi web TenunanSongket Store
- **Bottom_Nav**: Navigasi bar di bagian bawah layar untuk mobile
- **Sticky_CTA**: Tombol call-to-action yang tetap terlihat saat scroll
- **Filter_Sidebar**: Panel filter di sisi kiri halaman katalog desktop
- **Bottom_Sheet**: Modal yang muncul dari bawah layar untuk mobile
- **Search_Bar**: Input field untuk pencarian produk
- **Quick_View**: Modal preview produk tanpa navigasi ke halaman detail
- **Grid_Density**: Pengaturan kepadatan tampilan grid produk

## Requirements

### Requirement 1: Mobile Search Bar di Header

**User Story:** As a mobile user, I want to have quick access to search functionality in the header, so that I can find products without opening the menu.

#### Acceptance Criteria

1. WHEN the mobile header is displayed, THE System SHALL show a search bar or search icon prominently in the header
2. WHEN a user taps the search icon, THE System SHALL expand or focus the search input field
3. WHEN a user submits a search query, THE System SHALL navigate to the products page with the search filter applied
4. WHEN the search bar is active, THE System SHALL show a clear/cancel button to dismiss the search

### Requirement 2: Sticky CTA di Halaman Detail Produk

**User Story:** As a shopper, I want to always see the add-to-cart and buy-now buttons, so that I can quickly make a purchase decision without scrolling.

#### Acceptance Criteria

1. WHEN viewing a product detail page on mobile, THE System SHALL display a sticky bar at the bottom with "Add to Cart" and "Buy Now" buttons
2. WHEN viewing a product detail page on desktop, THE System SHALL keep the purchase buttons visible in the product info section
3. WHEN the product is out of stock, THE System SHALL disable the sticky CTA buttons and show "Stok Habis" text
4. THE Sticky_CTA SHALL not overlap with the mobile bottom navigation
5. WHEN a user taps "Add to Cart", THE System SHALL add the product to cart and show a toast confirmation
6. WHEN a user taps "Buy Now", THE System SHALL add the product to cart and navigate to checkout

### Requirement 3: Filter Sidebar untuk Desktop

**User Story:** As a desktop user, I want to filter products using a sidebar, so that I can narrow down my search efficiently.

#### Acceptance Criteria

1. WHEN viewing the products listing page on desktop (≥768px), THE System SHALL display a sticky filter sidebar on the left side
2. THE Filter_Sidebar SHALL include category filter with checkboxes
3. THE Filter_Sidebar SHALL include price range filter with min/max inputs or slider
4. THE Filter_Sidebar SHALL include stock availability toggle
5. WHEN a user applies filters, THE System SHALL update the product grid without full page reload
6. THE Filter_Sidebar SHALL include a "Reset Filter" button to clear all filters
7. WHEN filters are active, THE System SHALL show the count of active filters

### Requirement 4: Bottom Sheet Filter untuk Mobile

**User Story:** As a mobile user, I want to access filters through a bottom sheet, so that I can filter products in a touch-friendly way.

#### Acceptance Criteria

1. WHEN viewing the products listing page on mobile, THE System SHALL display a "Filter" button
2. WHEN a user taps the "Filter" button, THE System SHALL open a bottom sheet with filter options
3. THE Bottom_Sheet SHALL include the same filter options as desktop (category, price, stock)
4. THE Bottom_Sheet SHALL include "Terapkan" (Apply) and "Reset" buttons
5. WHEN a user taps "Terapkan", THE System SHALL close the sheet and apply the filters
6. THE Bottom_Sheet SHALL be dismissible by swiping down or tapping outside

### Requirement 5: Sorting Dropdown

**User Story:** As a shopper, I want to sort products by different criteria, so that I can find the most relevant products quickly.

#### Acceptance Criteria

1. WHEN viewing the products listing page, THE System SHALL display a sorting dropdown above the product grid
2. THE System SHALL support sorting by: Terbaru, Harga Terendah, Harga Tertinggi, Terlaris, Rating Tertinggi
3. WHEN a user selects a sort option, THE System SHALL reorder the product grid accordingly
4. THE System SHALL show the currently selected sort option in the dropdown
5. THE System SHALL display the total number of products found next to the sorting dropdown

### Requirement 6: Kategori di Bottom Navigation

**User Story:** As a mobile user, I want quick access to product categories from the bottom navigation, so that I can browse by category easily.

#### Acceptance Criteria

1. THE Bottom_Nav SHALL include a "Kategori" item with a grid icon
2. WHEN a user taps "Kategori", THE System SHALL open a bottom sheet or navigate to a categories view
3. THE categories view SHALL display all available product categories
4. WHEN a user selects a category, THE System SHALL navigate to the products page filtered by that category

### Requirement 7: Quick View Modal (Desktop)

**User Story:** As a desktop user, I want to preview product details without leaving the listing page, so that I can browse faster.

#### Acceptance Criteria

1. WHEN hovering over a product card on desktop, THE System SHALL show a "Quick View" button
2. WHEN a user clicks "Quick View", THE System SHALL open a modal with product details
3. THE Quick_View modal SHALL display: product image, title, price, rating, short description, and add-to-cart button
4. THE Quick_View modal SHALL include a link to view full product details
5. THE Quick_View modal SHALL be closable by clicking outside, pressing Escape, or clicking the close button

### Requirement 8: Grid Density Toggle

**User Story:** As a user, I want to adjust the product grid density, so that I can view products in my preferred layout.

#### Acceptance Criteria

1. WHEN viewing the products listing page, THE System SHALL display grid density toggle buttons (Compact/Comfortable)
2. WHEN "Compact" is selected, THE System SHALL show more products per row with smaller cards
3. WHEN "Comfortable" is selected, THE System SHALL show fewer products per row with larger cards
4. THE System SHALL remember the user's grid density preference using localStorage
5. THE grid density toggle SHALL be visible on both mobile and desktop

### Requirement 9: Header Compact on Scroll (Mobile)

**User Story:** As a mobile user, I want the header to minimize when scrolling down, so that I have more screen space for content.

#### Acceptance Criteria

1. WHEN a user scrolls down on mobile, THE System SHALL transition the header to a compact state
2. THE compact header SHALL hide the search bar but show a search icon
3. WHEN a user scrolls up, THE System SHALL restore the full header
4. THE header transition SHALL be smooth and not jarring
5. THE compact header SHALL maintain access to cart and menu icons
