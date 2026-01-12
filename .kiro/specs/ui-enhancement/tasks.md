# Implementation Plan: UI Enhancement

## Overview

Implementasi peningkatan UI/UX untuk TenunanSongket Store mencakup fitur mobile dan desktop. Tasks diurutkan berdasarkan dependensi dan prioritas impact.

## Tasks

- [x] 1. Setup filter state management dengan URL params
  - [x] 1.1 Create useProductFilters hook untuk manage filter state
    - Parse URL search params ke filter state
    - Sync filter changes ke URL
    - _Requirements: 3.5, 4.5_
  - [x] 1.2 Create filter utility functions
    - filterProducts(products, filters)
    - sortProducts(products, sortOption)
    - _Requirements: 5.3_

- [x] 2. Implement ProductSorting component
  - [x] 2.1 Create ProductSorting.tsx dengan dropdown
    - Sort options: Terbaru, Harga Terendah, Harga Tertinggi, Terlaris, Rating
    - Show total products count
    - _Requirements: 5.1, 5.2, 5.4, 5.5_
  - [x] 2.2 Integrate sorting ke products page
    - _Requirements: 5.3_

- [x] 3. Implement Desktop Filter Sidebar
  - [x] 3.1 Create ProductFilters.tsx component
    - Category checkboxes
    - Price range inputs (min/max)
    - Stock availability toggle
    - Reset button
    - Active filter count badge
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6, 3.7_
  - [x] 3.2 Update products page layout untuk 2-column dengan sidebar
    - Sidebar sticky di kiri (260-300px)
    - Product grid di kanan
    - _Requirements: 3.1_

- [x] 4. Implement Mobile Filter Sheet
  - [x] 4.1 Create MobileFilterSheet.tsx component
    - Bottom sheet dengan filter options
    - Terapkan dan Reset buttons
    - Swipe to dismiss
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_
  - [x] 4.2 Add Filter button di mobile products page
    - _Requirements: 4.1_

- [x] 5. Checkpoint - Filter & Sort
  - Ensure all filter and sort functionality works
  - Test URL sync (refresh maintains state)
  - Ask user if questions arise

- [x] 6. Implement Sticky CTA untuk Product Detail
  - [x] 6.1 Create StickyProductCTA.tsx component
    - Add to Cart button (outline)
    - Buy Now button (solid primary)
    - Disabled state untuk out of stock
    - _Requirements: 2.1, 2.3, 2.5, 2.6_
  - [x] 6.2 Integrate ke product detail page
    - Position above bottom nav on mobile
    - Hide on desktop (buttons already visible)
    - _Requirements: 2.1, 2.2, 2.4_

- [x] 7. Update Mobile Header dengan Search
  - [x] 7.1 Add search icon/bar ke mobile header
    - Expandable search on tap
    - Clear/cancel button
    - _Requirements: 1.1, 1.2, 1.4_
  - [x] 7.2 Implement search submission
    - Navigate to products with query
    - _Requirements: 1.3_

- [x] 8. Implement Header Compact on Scroll
  - [x] 8.1 Create useScrollDirection hook
    - Detect scroll up/down
    - _Requirements: 9.1, 9.3_
  - [x] 8.2 Update Header dengan compact mode
    - Transition to compact on scroll down
    - Show search icon instead of bar
    - Smooth transition animation
    - _Requirements: 9.1, 9.2, 9.4, 9.5_

- [x] 9. Checkpoint - Mobile UX
  - Test mobile search flow
  - Test sticky CTA positioning
  - Test header compact behavior
  - Ask user if questions arise

- [x] 10. Update Bottom Navigation dengan Kategori
  - [x] 10.1 Create CategorySheet.tsx component
    - List all categories
    - Navigate to filtered products on select
    - _Requirements: 6.2, 6.3, 6.4_
  - [x] 10.2 Update MobileBottomNav dengan Kategori item
    - Add Kategori between Home and Cart
    - Grid icon
    - _Requirements: 6.1_

- [x] 11. Implement Grid Density Toggle
  - [x] 11.1 Create GridDensityToggle.tsx component
    - Compact/Comfortable buttons
    - Persist to localStorage
    - _Requirements: 8.1, 8.4_
  - [x] 11.2 Update ProductGrid untuk support density
    - Compact: more columns, smaller cards
    - Comfortable: fewer columns, larger cards
    - _Requirements: 8.2, 8.3, 8.5_

- [x] 12. Implement Quick View Modal (Desktop)
  - [x] 12.1 Create QuickViewModal.tsx component
    - Product image, title, price, rating
    - Short description
    - Add to cart button
    - View details link
    - _Requirements: 7.2, 7.3, 7.4, 7.5_
  - [x] 12.2 Add Quick View button ke ProductCard (desktop hover)
    - Show on hover only
    - _Requirements: 7.1_

- [ ] 13. Final Checkpoint
  - Test complete flow mobile: browse → filter → sort → detail → sticky CTA → cart
  - Test complete flow desktop: browse → sidebar filter → quick view → add to cart
  - Ensure all tests pass
  - Ask user if questions arise

## Notes

- Semua komponen menggunakan Tailwind CSS dan shadcn/ui yang sudah ada
- Filter state disimpan di URL untuk shareable links
- Grid density preference disimpan di localStorage
- Mobile-first approach: test di 360px viewport terlebih dahulu
