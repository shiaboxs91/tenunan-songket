# Implementation Plan: Supabase Backend E-Commerce

## Overview

Implementasi backend e-commerce lengkap menggunakan Supabase untuk Tenunan Songket dengan target pasar internasional. Plan ini dibagi menjadi fase-fase yang dapat dieksekusi secara incremental.

---

## Tasks

### Phase 1: Supabase Project Setup & Database Schema

- [x] 1. Setup Supabase Project ✅ COMPLETED
  - [x] 1.1 Create Supabase project dan configure environment variables
    - Create `.env.local` dengan SUPABASE_URL dan SUPABASE_ANON_KEY
    - Install @supabase/supabase-js dan @supabase/ssr
    - _Requirements: 20.1_

  - [x] 1.2 Create Supabase client utilities
    - Create `src/lib/supabase/client.ts` untuk browser client
    - Create `src/lib/supabase/server.ts` untuk server components
    - Create `src/lib/supabase/middleware.ts` untuk auth middleware
    - _Requirements: 20.1, 20.2_

- [x] 2. Create Core Database Tables ✅ COMPLETED (18 tables)
  - [x] 2.1 Create profiles and addresses tables
  - [x] 2.2 Create countries and shipping_zones tables
  - [x] 2.3 Create categories and products tables
  - [x] 2.4 Create cart tables
  - [x] 2.5 Create orders and related tables
  - [x] 2.6 Create supporting tables

- [x] 3. Create Database Functions & Triggers ✅ COMPLETED
  - [x] 3.1 Create order number generator function
  - [x] 3.2 Create inventory management functions
  - [x] 3.3 Create product rating update trigger
  - [x] 3.4 Create coupon validation function
  - [x] 3.5 Create profile auto-creation trigger
  - [x] 3.6 Create updated_at triggers

- [x] 4. Setup Row Level Security (RLS) ✅ COMPLETED
  - [x] 4.1 Enable RLS on all user-facing tables
  - [x] 4.2 Create user policies
  - [x] 4.3 Create admin policies
  - [x] 4.4 Create public read policies

- [x] 5. Checkpoint - Database Setup Complete ✅ COMPLETED

---

### Phase 2: Authentication System

- [x] 6. Implement Authentication ✅ COMPLETED
  - [x] 6.1 Create auth service (`src/lib/supabase/auth.ts`)
  - [x] 6.2 Create auth middleware
  - [x] 6.3 Create auth UI components (LoginForm, RegisterForm, ForgotPasswordForm, ResetPasswordForm)
  - [x] 6.4 Create auth pages (login, register, forgot-password, reset-password)
  - [ ]* 6.5 Write property test for authentication round-trip
    - **Property 2: Authentication Round-Trip**
    - **Validates: Requirements 1.3**

- [x] 7. Implement Profile Management ✅ COMPLETED
  - [x] 7.1 Create profile service (`src/lib/supabase/profiles.ts`)
  - [x] 7.2 Create address service (`src/lib/supabase/addresses.ts`)
  - [x] 7.3 Create profile UI components (ProfileForm, AddressForm, AddressList)
  - [x] 7.4 Create profile pages (account, addresses)
  - [ ]* 7.5 Write property test for single default address
    - **Property 4: Single Default Address Invariant**
    - **Validates: Requirements 2.2, 2.3**

- [x] 8. Checkpoint - Authentication Complete ✅ COMPLETED

---

### Phase 3: Product & Category Management

- [x] 9. Implement Product Service ✅ COMPLETED
  - [x] 9.1 Create product service (`src/lib/supabase/products.ts`)
  - [x] 9.2 Create category service (`src/lib/supabase/categories.ts`)
  - [x] 9.3 Update product components to use Supabase
  - [x] 9.4 Update product detail page
  - [ ]* 9.5 Write property test for product slug uniqueness
    - **Property 5: Product Slug Uniqueness**
    - **Validates: Requirements 3.2**

- [x] 10. Implement Data Migration ✅ COMPLETED
  - [x] 10.1 Create migration script
  - [x] 10.2 Run migration (26 products, 69 images, 8 categories)
  - [ ]* 10.3 Write property test for migration data integrity
    - **Property 19: Migration Data Integrity**
    - **Validates: Requirements 19.3**

- [x] 11. Checkpoint - Products Complete ✅ COMPLETED

---

### Phase 4: Cart System

- [x] 12. Implement Cart Service ✅ COMPLETED
  - [x] 12.1 Create cart service (`src/lib/supabase/cart.ts`)
  - [x] 12.2 Create cart context/hook (`src/hooks/useCart.ts`, `src/components/cart/CartProvider.tsx`)
  - [x] 12.3 Create cart UI components (CartDrawer, CartItem, CartSummary)
  - [x] 12.4 Create cart page (`src/app/(store)/cart/page.tsx`)
  - [ ]* 12.5 Write property test for cart item idempotence
    - **Property 9: Cart Item Idempotence**
    - **Validates: Requirements 5.1, 5.2**
  - [ ]* 12.6 Write property test for cart total calculation
    - **Property 11: Cart Total Calculation**
    - **Validates: Requirements 5.5**

- [x] 13. Checkpoint - Cart Complete ✅ COMPLETED

---

### Phase 5: Checkout & Orders

- [x] 14. Implement Checkout Flow ✅ COMPLETED
  - [x] 14.1 Create order service (`src/lib/supabase/orders.ts`)
  - [x] 14.2 Create shipping service (`src/lib/supabase/shipping.ts`)
  - [x] 14.3 Create checkout UI components (AddressSelector, ShippingSelector, OrderSummary, CheckoutStepper)
  - [x] 14.4 Create checkout page (`src/app/(store)/checkout/page.tsx`)
  - [ ]* 14.5 Write property test for order creation invariants
    - **Property 12: Order Creation Invariants**
    - **Validates: Requirements 6.1, 6.2, 6.3**
  - [ ]* 14.6 Write property test for inventory state machine
    - **Property 6: Inventory State Machine Consistency**
    - **Validates: Requirements 6.5, 14.1, 14.2, 14.3, 14.4**

- [x] 15. Implement Order Management ✅ COMPLETED
  - [x] 15.1 Create order history page (`src/app/(store)/account/orders/page.tsx`)
  - [x] 15.2 Create order detail page (`src/app/(store)/account/orders/[id]/page.tsx`)
  - [x] 15.3 Implement order status tracking (`src/components/order/OrderStatus.tsx`)

- [x] 16. Checkpoint - Checkout Complete ✅ COMPLETED

---

### Phase 6: Payment Integration

- [ ] 17. Implement Stripe Payment
  - [x] 17.1 Setup Stripe
    - Install stripe package
    - Configure Stripe keys in environment
    - _Requirements: 7.1_

  - [x] 17.2 Create payment service
    - Create `src/lib/supabase/payments.ts`
    - Implement createStripeCheckout
    - Implement getPaymentStatus
    - _Requirements: 7.1, 7.3_

  - [x] 17.3 Create Stripe checkout session Edge Function
    - Create `supabase/functions/create-checkout/index.ts`
    - Generate Stripe checkout session
    - _Requirements: 7.3_

  - [x] 17.4 Create Stripe webhook Edge Function
    - Create `supabase/functions/stripe-webhook/index.ts`
    - Handle checkout.session.completed
    - Handle payment_intent.payment_failed
    - Update order and payment status
    - _Requirements: 7.6_

  - [x] 17.5 Create payment UI
    - Create `src/components/checkout/PaymentSelector.tsx`
    - Create payment success/failure pages
    - _Requirements: 7.1_

- [ ]* 18. Implement PayPal Payment (Optional)
  - [ ]* 18.1 Setup PayPal
  - [ ]* 18.2 Create PayPal integration

- [ ] 19. Checkpoint - Payment Complete
  - Test Stripe checkout flow
  - Test webhook handling
  - Test payment status updates
  - Test order status after payment

---

### Phase 7: Reviews & Wishlist

- [x] 20. Implement Review System ✅ COMPLETED
  - [x] 20.1 Create review service (`src/lib/supabase/reviews.ts`)
  - [x] 20.2 Create review UI components
    - Create `src/components/review/ReviewForm.tsx`
    - Create `src/components/review/ReviewList.tsx`
    - Create `src/components/review/StarRating.tsx`
    - _Requirements: 9.1, 9.2_

  - [x] 20.3 Integrate reviews into product page
    - Add review section to product detail
    - Display average rating
    - _Requirements: 9.3_

  - [ ]* 20.4 Write property test for review rating bounds
    - **Property 13: Review Rating Bounds**
    - **Validates: Requirements 9.2**

  - [ ]* 20.5 Write property test for product rating calculation
    - **Property 14: Product Rating Calculation**
    - **Validates: Requirements 9.3**

- [x] 21. Implement Wishlist ✅ COMPLETED
  - [x] 21.1 Create wishlist service (`src/lib/supabase/wishlist.ts`)
  - [x] 21.2 Create wishlist UI
    - Create `src/components/wishlist/WishlistButton.tsx`
    - Create `src/app/(store)/account/wishlist/page.tsx`
    - _Requirements: 10.1_

  - [ ]* 21.3 Write property test for wishlist uniqueness
    - **Property 16: Wishlist Uniqueness**
    - **Validates: Requirements 10.3**

- [ ] 22. Checkpoint - Reviews & Wishlist Complete
  - Test review submission
  - Test rating calculation
  - Test wishlist add/remove

---

### Phase 8: Coupons & Notifications

- [ ] 23. Implement Coupon System
  - [ ] 23.1 Create coupon service
    - Create `src/lib/supabase/coupons.ts` dengan validateCoupon, applyCoupon
    - Use database function for validation
    - _Requirements: 11.1, 11.3, 11.4_

  - [ ] 23.2 Integrate coupons into cart/checkout
    - Add coupon input to cart
    - Apply discount to order total
    - _Requirements: 11.3, 11.6_

  - [ ]* 23.3 Write property test for coupon validation
    - **Property 17: Coupon Validation Rules**
    - **Validates: Requirements 11.3, 11.4**

- [ ] 24. Implement Notification System
  - [ ] 24.1 Create notification service
    - Create `src/lib/supabase/notifications.ts` dengan getNotifications, markAsRead
    - Implement realtime subscription
    - _Requirements: 12.1, 12.2, 12.3_

  - [ ] 24.2 Create notification UI
    - Create `src/components/notification/NotificationBell.tsx`
    - Create `src/components/notification/NotificationList.tsx`
    - _Requirements: 12.1_

  - [ ] 24.3 Create notification triggers
    - Create Edge Function untuk send notifications on order status change
    - _Requirements: 6.8, 12.2_

- [ ] 25. Checkpoint - Coupons & Notifications Complete
  - Test coupon application
  - Test notification display
  - Test realtime notifications

---

### Phase 9: Admin Panel

- [ ] 26. Create Admin Dashboard
  - [ ] 26.1 Create admin layout
    - Create `src/app/admin/layout.tsx` dengan sidebar navigation
    - Implement admin auth check
    - _Requirements: 13.3_

  - [ ] 26.2 Create dashboard page
    - Create `src/app/admin/page.tsx`
    - Display stats: total orders, revenue, customers, products
    - Display sales chart
    - _Requirements: 13.1, 13.2_

- [ ] 27. Create Admin Product Management
  - [ ] 27.1 Create product list page
    - Create `src/app/admin/products/page.tsx`
    - Implement search, filter, pagination
    - _Requirements: 13.4_

  - [ ] 27.2 Create product form
    - Create `src/app/admin/products/new/page.tsx`
    - Create `src/app/admin/products/[id]/edit/page.tsx`
    - Implement image upload
    - _Requirements: 3.2, 3.3, 13.4_

  - [ ] 27.3 Create category management
    - Create `src/app/admin/categories/page.tsx`
    - Implement CRUD for categories
    - _Requirements: 4.1, 13.4_

- [ ] 28. Create Admin Order Management
  - [ ] 28.1 Create order list page
    - Create `src/app/admin/orders/page.tsx`
    - Implement filters by status, date
    - _Requirements: 13.4_

  - [ ] 28.2 Create order detail page
    - Create `src/app/admin/orders/[id]/page.tsx`
    - Implement status update
    - Implement tracking number input
    - _Requirements: 6.7, 8.4, 13.4_

- [ ] 29. Create Admin User & Coupon Management
  - [ ] 29.1 Create user list page
    - Create `src/app/admin/users/page.tsx`
    - Display customer list
    - _Requirements: 13.4_

  - [ ] 29.2 Create coupon management
    - Create `src/app/admin/coupons/page.tsx`
    - Implement CRUD for coupons
    - _Requirements: 11.1, 13.4_

- [ ] 30. Checkpoint - Admin Panel Complete
  - Test dashboard stats
  - Test product CRUD
  - Test order management
  - Test coupon management

---

### Phase 10: Realtime & Edge Functions

- [ ] 31. Implement Realtime Features
  - [ ] 31.1 Setup realtime subscriptions
    - Implement order status realtime updates
    - Implement stock realtime updates
    - Implement notification realtime
    - _Requirements: 18.1, 18.2, 18.3, 18.4_

  - [ ] 31.2 Handle connection recovery
    - Implement auto-reconnect
    - Sync missed updates
    - _Requirements: 18.5_

- [ ] 32. Create Scheduled Functions
  - [ ] 32.1 Create auto-cancel expired orders function
    - Create `supabase/functions/cancel-expired-orders/index.ts`
    - Setup pg_cron to run hourly
    - _Requirements: 6.6_

  - [ ] 32.2 Create daily stats aggregation function
    - Create `supabase/functions/aggregate-daily-stats/index.ts`
    - Setup pg_cron to run daily
    - _Requirements: 15.1, 15.6_

- [ ] 33. Setup Supabase Storage
  - [ ] 33.1 Create storage buckets
    - Create products bucket (public)
    - Create avatars bucket (public)
    - Create reviews bucket (public)
    - _Requirements: 17.1_

  - [ ] 33.2 Configure storage policies
    - Set upload size limits
    - Set allowed mime types
    - Configure access policies
    - _Requirements: 17.2, 17.4_

- [ ] 34. Final Checkpoint - All Features Complete
  - Run full integration test
  - Verify all features working end-to-end
  - Performance testing
  - Security review

---

## Progress Summary

### Completed Phases
- ✅ Phase 1: Supabase Project Setup & Database Schema
- ✅ Phase 2: Authentication System
- ✅ Phase 3: Product & Category Management
- ✅ Phase 4: Cart System
- ✅ Phase 5: Checkout & Orders (core functionality)
- ✅ Phase 6: Payment Integration (Stripe) - PayPal optional
- ✅ Phase 7: Reviews & Wishlist

### In Progress / Remaining
- ⏳ Phase 8: Coupons & Notifications
- ⏳ Phase 9: Admin Panel
- ⏳ Phase 10: Realtime & Edge Functions

---

## Notes

- Tasks marked with `*` are optional property-based tests
- Each checkpoint ensures incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Checkpoints ensure incremental validation
