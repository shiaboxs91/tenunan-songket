# Implementation Plan: Category Update

## Overview

Implementasi update kategori produk dari kategori demo ke kategori asli berdasarkan data XML website lama.

## Tasks

- [x] 1. Update PRODUCT_CATEGORIES constant
  - [x] 1.1 Update src/lib/types.ts dengan kategori baru
    - Ganti array PRODUCT_CATEGORIES dengan: "Beragi", "Arap Gegati", "Bertabur", "Jongsarat", "Si Pugut", "Silubang Bangsi", "Tajung", "Lainnya"
    - _Requirements: 1.1, 1.3_

- [x] 2. Update RSS Parser category extraction
  - [x] 2.1 Update extractCategory function di src/lib/rss.ts
    - Ganti categoryKeywords dengan mapping baru
    - Hapus default "Songket Palembang", ganti dengan "Lainnya"
    - _Requirements: 2.1, 2.2, 2.3_
  - [x] 2.2 Write property test for keyword mapping
    - **Property 2: Keyword-to-Category Mapping**
    - **Validates: Requirements 2.1, 2.2**
  - [x] 2.3 Write property test for default category
    - **Property 3: Default Category Fallback**
    - **Validates: Requirements 2.3**

- [x] 3. Update Footer navigation
  - [x] 3.1 Update footerLinks di src/components/layout/Footer.tsx
    - Ganti link kategori dengan kategori baru
    - _Requirements: 3.1, 3.2, 3.3_

- [x] 4. Update Product Snapshot data
  - [x] 4.1 Update kategori produk di src/data/products.snapshot.json
    - Map kategori lama ke kategori baru berdasarkan konten produk
    - _Requirements: 5.1, 5.2_

- [x] 5. Checkpoint - Verify all changes
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Update property tests
  - [x] 6.1 Update filtering.property.test.ts untuk menggunakan kategori baru
    - Update test yang menggunakan PRODUCT_CATEGORIES
    - _Requirements: 1.2, 4.2_
  - [x] 6.2 Update rss.property.test.ts untuk kategori baru
    - Update test extractCategory
    - _Requirements: 2.1, 2.2_
  - [x] 6.3 Update cart.property.test.ts untuk kategori baru
    - Update product generator
    - _Requirements: 1.2_

- [x] 7. Final checkpoint - Run all tests
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- All tasks are required for comprehensive testing
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
