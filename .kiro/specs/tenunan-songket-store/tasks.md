# Implementation Plan: TenunanSongket Store

## Overview

Implementasi frontend e-commerce demo untuk TenunanSongket Store menggunakan Next.js App Router, TypeScript, Tailwind CSS, dan shadcn/ui. Fokus pada performa dengan Server Components dan interaktivitas minimal dengan Client Components.

## Tasks

- [x] 1. Project Setup dan Konfigurasi
  - [x] 1.1 Bootstrap Next.js App Router dengan TypeScript dan Tailwind CSS
    - Jalankan `npx create-next-app@latest` dengan App Router
    - Konfigurasi TypeScript strict mode
    - _Requirements: 11.2, 11.3_
  - [x] 1.2 Setup shadcn/ui dengan tema modern minimal marun
    - Install shadcn/ui CLI dan init
    - Konfigurasi warna primary marun (#7A1F3D)
    - Konfigurasi accent gold (#C8A24A)
    - _Requirements: 10.1, 10.2, 10.3_
  - [x] 1.3 Setup testing framework
    - Install Vitest, fast-check, React Testing Library
    - Konfigurasi vitest.config.ts
    - _Requirements: Testing Strategy_

- [x] 2. Data Layer dan API
  - [x] 2.1 Buat type definitions untuk Product dan related types
    - Buat file lib/types.ts dengan semua type definitions
    - _Requirements: 9.2_
  - [x] 2.2 Implement RSS parser dan Product mapper
    - Buat lib/rss.ts untuk fetch dan parse RSS XML
    - Implement generateConsistentPrice, generateConsistentRating, generateConsistentSold
    - Implement extractCategory dan extractImage
    - _Requirements: 9.2, 9.3, 9.5_
  - [x] 2.3 Write property test untuk RSS parsing
    - **Property 8: RSS to Product mapping produces valid products**
    - **Validates: Requirements 9.2, 9.5**
  - [x] 2.4 Write property test untuk consistent value generation
    - **Property 9: Consistent value generation (idempotence)**
    - **Validates: Requirements 9.3**
  - [x] 2.5 Buat products snapshot fallback
    - Buat data/products.snapshot.json dengan sample data
    - _Requirements: 9.4_
  - [x] 2.6 Implement API Route Handler /api/products
    - Buat app/api/products/route.ts
    - Implement GET handler dengan RSS fetch + fallback
    - Support query parameters untuk filter, sort, pagination
    - _Requirements: 9.1, 9.4_
  - [x] 2.7 Buat lib/products.ts untuk data fetching utilities
    - Implement getProducts, getProductBySlug
    - Implement filterProducts, sortProducts
    - _Requirements: 3.4, 3.5, 3.7_
  - [x] 2.8 Write property test untuk product filtering
    - **Property 1: Product filtering returns matching results**
    - **Validates: Requirements 3.4, 3.7**
  - [x] 2.9 Write property test untuk product sorting
    - **Property 2: Product sorting produces correct order**
    - **Validates: Requirements 3.5**

- [x] 3. Checkpoint - Data Layer
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Layout Components
  - [x] 4.1 Buat Header component
    - Implement logo, search bar (desktop), navigation links
    - Implement mobile hamburger menu dengan Sheet
    - Implement sticky positioning
    - _Requirements: 1.1, 1.2, 1.3_
  - [x] 4.2 Buat Footer component
    - Implement navigation links
    - Implement brand story section
    - Add subtle songket pattern background
    - _Requirements: 1.4, 1.5, 10.4_
  - [x] 4.3 Buat root layout dengan Header dan Footer
    - Setup app/(store)/layout.tsx
    - _Requirements: 1.1_

- [x] 5. Product Components
  - [x] 5.1 Buat ProductCard component
    - Implement product image, title, price, rating, sold
    - Add hover effect dan quick add to cart
    - _Requirements: 10.5, 10.6_
  - [x] 5.2 Buat ProductGrid component
    - Implement responsive grid layout
    - Add skeleton loading state
    - Add empty state handling
    - _Requirements: 3.1, 3.8, 11.4_
  - [x] 5.3 Buat ProductGallery component
    - Implement image carousel dengan thumbnails
    - _Requirements: 4.1_

- [x] 6. Filter Components
  - [x] 6.1 Buat FilterSidebar component
    - Implement category filter
    - Implement price range slider
    - Implement stock availability checkbox
    - Implement sort dropdown
    - _Requirements: 3.4, 3.5_
  - [x] 6.2 Buat FilterSheetMobile component
    - Wrap FilterSidebar dalam Sheet untuk mobile
    - _Requirements: 3.3_

- [x] 7. Cart System
  - [x] 7.1 Buat CartProvider context
    - Implement cart state management
    - Implement addItem, removeItem, updateQuantity, clearCart
    - Implement localStorage persistence
    - _Requirements: 5.1, 5.2, 5.3, 5.5_
  - [x] 7.2 Write property test untuk cart quantity update
    - **Property 3: Cart quantity update reflects in state**
    - **Validates: Requirements 5.2**
  - [x] 7.3 Write property test untuk cart item removal
    - **Property 4: Cart item removal excludes item**
    - **Validates: Requirements 5.3**
  - [x] 7.4 Write property test untuk cart subtotal calculation
    - **Property 5: Cart subtotal equals sum of item totals**
    - **Validates: Requirements 5.4**
  - [x] 7.5 Write property test untuk cart persistence
    - **Property 6: Cart persistence round-trip**
    - **Validates: Requirements 5.5**
  - [x] 7.6 Buat CartItemCard component
    - Implement item display dengan image, title, price
    - Implement quantity stepper
    - Implement remove button
    - _Requirements: 5.1, 5.2, 5.3_

- [x] 8. Checkpoint - Components
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. Page: Home
  - [x] 9.1 Implement Home page
    - Buat hero banner dengan headline, subheadline, CTA
    - Buat popular categories section
    - Buat popular products grid
    - Buat latest products grid
    - Buat USP section
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 10. Page: Product Listing
  - [x] 10.1 Implement Product Listing page
    - Integrate FilterSidebar (desktop) dan FilterSheetMobile
    - Integrate ProductGrid dengan data dari API
    - Implement pagination
    - Implement querystring handling
    - _Requirements: 3.1, 3.2, 3.3, 3.6_

- [x] 11. Page: Product Detail
  - [x] 11.1 Implement Product Detail page
    - Integrate ProductGallery
    - Display product info (title, rating, sold, price)
    - Implement variant selector (demo)
    - Implement Add to Cart dan Buy Now buttons
    - Implement tabs (Description, Shipping, Care)
    - Implement recommended products section
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_

- [x] 12. Page: Cart
  - [x] 12.1 Implement Cart page
    - Display cart items dengan CartItemCard
    - Display order summary (subtotal, shipping, tax, total)
    - Implement checkout CTA
    - Implement empty cart state
    - _Requirements: 5.1, 5.4, 5.6, 5.7_

- [x] 13. Checkout System
  - [x] 13.1 Buat CheckoutStepper component
    - Implement 3-step stepper UI
    - _Requirements: 6.1_
  - [x] 13.2 Buat AddressForm component
    - Implement form fields untuk shipping address
    - Implement validation
    - _Requirements: 6.2, 6.6_
  - [x] 13.3 Write property test untuk form validation
    - **Property 7: Checkout form validation rejects incomplete data**
    - **Validates: Requirements 6.6**
  - [x] 13.4 Implement Checkout page
    - Integrate CheckoutStepper
    - Implement Address step dengan AddressForm
    - Implement Shipping step dengan shipping options
    - Implement Summary step dengan order review
    - Implement submit dan redirect ke success
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 14. Page: Success
  - [x] 14.1 Implement Success page
    - Display dummy order number
    - Display order summary
    - Implement return to shopping CTA
    - _Requirements: 7.1, 7.2, 7.3_

- [x] 15. Page: Account
  - [x] 15.1 Implement Account page
    - Implement login form UI (demo)
    - Implement register form UI (demo)
    - Implement profile section (demo)
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 16. Final Polish
  - [x] 16.1 Implement loading states dan error handling
    - Add Skeleton components untuk semua loading states
    - Add error boundaries dan fallback UI
    - _Requirements: 11.4, 11.5_
  - [x] 16.2 Responsive testing dan fixes
    - Test di viewport 360px - 1440px
    - Fix any responsive issues
    - _Requirements: 11.1_

- [x] 17. Final Checkpoint
  - All 47 property tests passing
  - Build successful with no errors
  - ESLint passing with no warnings
  - All pages navigable without errors
  - Complete cart flow works end-to-end

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
