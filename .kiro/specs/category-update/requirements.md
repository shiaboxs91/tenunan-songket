# Requirements Document

## Introduction

Dokumen ini mendefinisikan persyaratan untuk memperbarui kategori produk di website Tenunan Songket. Kategori demo yang tidak sesuai dengan produk asli harus diganti dengan kategori yang benar dari website lama (tenunansongket.com).

## Glossary

- **Category_System**: Sistem yang mengelola dan menampilkan kategori produk di seluruh aplikasi
- **Product_Filter**: Komponen yang memungkinkan pengguna memfilter produk berdasarkan kategori
- **Footer_Navigation**: Bagian footer yang menampilkan link navigasi kategori
- **RSS_Parser**: Modul yang mengekstrak kategori dari feed RSS

## Kategori Lama (Demo) - HAPUS

Kategori berikut harus dihapus karena tidak sesuai dengan produk yang dijual:
- Songket Palembang
- Songket Minang
- Songket Bali
- Songket Lombok
- Songket Brunei
- Kain Tenun
- Aksesoris

## Kategori Baru (Asli dari Website Lama)

Kategori berikut adalah kategori yang benar berdasarkan data XML dari website lama:
- Beragi
- Arap Gegati
- Bertabur
- Jongsarat
- Si Pugut
- Silubang Bangsi
- Tajung

## Requirements

### Requirement 1: Update Konstanta Kategori

**User Story:** Sebagai developer, saya ingin konstanta PRODUCT_CATEGORIES diperbarui dengan kategori yang benar, sehingga seluruh aplikasi menggunakan kategori yang konsisten.

#### Acceptance Criteria

1. THE Category_System SHALL define exactly 8 categories: "Beragi", "Arap Gegati", "Bertabur", "Jongsarat", "Si Pugut", "Silubang Bangsi", "Tajung", dan "Lainnya"
2. WHEN the application loads THEN THE Category_System SHALL use the new category list throughout all components
3. THE Category_System SHALL NOT contain any of the old demo categories (Songket Palembang, Songket Minang, Songket Bali, Songket Lombok, Songket Brunei, Kain Tenun, Aksesoris)

### Requirement 2: Update RSS Parser Category Extraction

**User Story:** Sebagai sistem, saya ingin RSS parser mengekstrak kategori yang benar dari feed, sehingga produk dikategorikan dengan tepat.

#### Acceptance Criteria

1. WHEN parsing RSS feed THEN THE RSS_Parser SHALL map products to the correct new categories based on keywords
2. THE RSS_Parser SHALL use the following keyword mappings:
   - "Beragi": ["beragi"]
   - "Arap Gegati": ["arap", "gegati", "arapgegati"]
   - "Bertabur": ["bertabur", "tabur", "betabur"]
   - "Jongsarat": ["jongsarat", "jong sarat"]
   - "Si Pugut": ["sipugut", "si pugut", "pugut"]
   - "Silubang Bangsi": ["silubang", "bangsi", "silubangbangsi"]
   - "Tajung": ["tajung"]
3. IF no keyword matches THEN THE RSS_Parser SHALL assign "Lainnya" as the default category

### Requirement 3: Update Footer Navigation

**User Story:** Sebagai pengguna, saya ingin melihat kategori yang benar di footer, sehingga saya dapat menavigasi ke produk yang sesuai.

#### Acceptance Criteria

1. THE Footer_Navigation SHALL display links to the new categories
2. THE Footer_Navigation SHALL NOT display any old demo category links
3. WHEN a user clicks a category link THEN THE Footer_Navigation SHALL navigate to the products page with the correct category filter

### Requirement 4: Update Product Filters

**User Story:** Sebagai pengguna, saya ingin memfilter produk berdasarkan kategori yang benar, sehingga saya dapat menemukan produk yang saya cari.

#### Acceptance Criteria

1. THE Product_Filter SHALL display the new categories as filter options
2. WHEN a user selects a category filter THEN THE Product_Filter SHALL filter products by that category
3. THE Product_Filter SHALL NOT display any old demo categories

### Requirement 5: Update Product Snapshot Data

**User Story:** Sebagai sistem, saya ingin data snapshot produk menggunakan kategori yang benar, sehingga produk ditampilkan dengan kategori yang tepat.

#### Acceptance Criteria

1. THE Category_System SHALL update all product categories in the snapshot data to use new categories
2. WHEN displaying products THEN THE Category_System SHALL show the correct new category for each product
