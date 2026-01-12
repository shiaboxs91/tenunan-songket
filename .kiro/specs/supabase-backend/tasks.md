# Implementation Plan: Supabase Backend E-Commerce

## Overview

Implementasi backend e-commerce lengkap menggunakan Supabase untuk Tenunan Songket dengan target pasar internasional. Plan ini dibagi menjadi fase-fase yang dapat dieksekusi secara incremental.

---

## Tasks

### Phase 1: Supabase Project Setup & Database Schema

- [ ] 1. Setup Supabase Project
  - [ ] 1.1 Create Supabase project dan configure environment variables
    - Create `.env.local` dengan SUPABASE_URL dan SUPABASE_ANON_KEY
    - Install @supabase/supabase-js dan @supabase/ssr
    - _Requirements: 20.1_

  - [ ] 1.2 Create Supabase client utilities
    - Create `src/lib/supabase/client.ts` untuk browser client
    - Create `src/lib/supabase/server.ts` untuk server components
    - Create `src/lib/supabase/middleware.ts` untuk auth middleware
    - _Requirements: 20.1, 20.2_

- [ ] 2. Create Core Database Tables
  - [ ] 2.1 Create profiles and addresses tables
    - Execute SQL untuk profiles table dengan trigger on auth.users
    - Execute SQL untuk addresses table dengan format internasional
    - _Requirements: 1.7, 2.1, 2.2_

  - [ ] 2.2 Create countries and shipping_zones tables
    - Execute SQL untuk countries table
    - Execute SQL untuk shipping_zones dan shipping_zone_countries tables
    - Insert seed data untuk target countries
    - _Requirements: 8.2, 8.3_

  - [ ] 2.3 Create categories and products tables
    - Execute SQL untuk categories table dengan parent_id
    - Execute SQL untuk products table dengan semua fields
    - Execute SQL untuk product_images table
    - Create indexes untuk performance
    - _Requirements: 3.1, 4.1_

  - [ ] 2.4 Create cart tables
    - Execute SQL untuk carts table
    - Execute SQL untuk cart_items table dengan unique constraint
    - _Requirements: 5.1_

  - [ ] 2.5 Create orders and related tables
    - Execute SQL untuk orders table dengan multi-currency
    - Execute SQL untuk order_items table
    - Execute SQL untuk payments table dengan gateway fields
    - Execute SQL untuk shippings table dengan international fields
    - _Requirements: 6.1, 7.1, 8.1_

  - [ ] 2.6 Create supporting tables
    - Execute SQL untuk reviews table
    - Execute SQL untuk wishlists table
    - Execute SQL untuk coupons dan coupon_usages tables
    - Execute SQL untuk notifications table
    - Execute SQL untuk inventory_logs table
    - Execute SQL untuk audit_logs table
    - Execute SQL untuk daily_stats table
    - _Requirements: 9.1, 10.1, 11.1, 12.1, 14.1, 15.1_

- [ ] 3. Create Database Functions & Triggers
  - [ ] 3.1 Create order number generator function
    - Create generate_order_number() function
    - Create trigger untuk auto-set order_number
    - _Requirements: 6.2_

  - [ ] 3.2 Create inventory management functions
    - Create reserve_inventory() function
    - Create release_inventory() function
    - Create commit_inventory() function
    - _Requirements: 14.2, 14.3, 14.4_

  - [ ] 3.3 Create product rating update trigger
    - Create update_product_rating() function
    - Create trigger on reviews table
    - _Requirements: 9.3_

  - [ ] 3.4 Create coupon validation function
    - Create validate_coupon() function dengan semua rules
    - _Requirements: 11.3, 11.4_

  - [ ] 3.5 Create profile auto-creation trigger
    - Create handle_new_user() function
    - Create trigger on auth.users insert
    - _Requirements: 1.7_

  - [ ] 3.6 Create updated_at triggers
    - Create update_updated_at() function
    - Apply trigger ke semua relevant tables
    - _Requirements: 3.1_

- [ ] 4. Setup Row Level Security (RLS)
  - [ ] 4.1 Enable RLS on all user-facing tables
    - Enable RLS pada profiles, addresses, carts, cart_items
    - Enable RLS pada orders, order_items, payments, shippings
    - Enable RLS pada reviews, wishlists, notifications
    - _Requirements: 16.1_

  - [ ] 4.2 Create user policies
    - Create policies untuk users can view/update own data
    - Create policies untuk cart management
    - Create policies untuk order viewing
    - _Requirements: 16.2_

  - [ ] 4.3 Create admin policies
    - Create policies untuk admin full access on products
    - Create policies untuk admin full access on categories
    - Create policies untuk admin view/update all orders
    - Create policies untuk admin manage coupons
    - _Requirements: 13.3_

  - [ ] 4.4 Create public read policies
    - Create policy untuk anyone can view active products
    - Create policy untuk anyone can view active categories
    - Create policy untuk anyone can view published reviews
    - _Requirements: 3.1, 4.1, 9.1_

- [ ] 5. Checkpoint - Database Setup Complete
  - Verify semua tables created dengan correct schema
  - Verify semua functions dan triggers working
  - Verify RLS policies applied correctly
  - Test basic CRUD operations via Supabase dashboard

---

### Phase 2: Authentication System

- [ ] 6. Implement Authentication
  - [ ] 6.1 Create auth service
    - Create `src/lib/supabase/auth.ts` dengan signUp, signIn, signOut
    - Implement Google OAuth sign in
    - Implement password reset flow
    - _Requirements: 1.1, 1.2, 1.3, 1.5_

  - [ ] 6.2 Create auth middleware
    - Create middleware untuk protected routes
    - Implement session refresh logic
    - _Requirements: 1.8_

  - [ ] 6.3 Create auth UI components
    - Create `src/components/auth/LoginForm.tsx`
    - Create `src/components/auth/RegisterForm.tsx`
    - Create `src/components/auth/ForgotPasswordForm.tsx`
    - _Requirements: 1.1, 1.3, 1.5_

  - [ ] 6.4 Create auth pages
    - Create `src/app/(auth)/login/page.tsx`
    - Create `src/app/(auth)/register/page.tsx`
    - Create `src/app/(auth)/forgot-password/page.tsx`
    - Create `src/app/(auth)/reset-password/page.tsx`
    - _Requirements: 1.1, 1.3, 1.5_

  - [ ]* 6.5 Write property test for authentication round-trip
    - **Property 2: Authentication Round-Trip**
    - **Validates: Requirements 1.3**

- [ ] 7. Implement Profile Management
  - [ ] 7.1 Create profile service
    - Create `src/lib/supabase/profiles.ts` dengan getProfile, updateProfile
    - Implement avatar upload to Supabase Storage
    - _Requirements: 2.1, 2.6_

  - [ ] 7.2 Create address service
    - Create `src/lib/supabase/addresses.ts` dengan CRUD operations
    - Implement set default address logic
    - _Requirements: 2.2, 2.3, 2.4_

  - [ ] 7.3 Create profile UI components
    - Create `src/components/profile/ProfileForm.tsx`
    - Create `src/components/profile/AddressForm.tsx`
    - Create `src/components/profile/AddressList.tsx`
    - _Requirements: 2.1, 2.2_

  - [ ] 7.4 Create profile pages
    - Create `src/app/(store)/account/page.tsx`
    - Create `src/app/(store)/account/addresses/page.tsx`
    - _Requirements: 2.1, 2.2_

  - [ ]* 7.5 Write property test for single default address
    - **Property 4: Single Default Address Invariant**
    - **Validates: Requirements 2.2, 2.3**

- [ ] 8. Checkpoint - Authentication Complete
  - Test user registration flow
  - Test login/logout flow
  - Test profile update
  - Test address management

---

### Phase 3: Product & Category Management

- [ ] 9. Implement Product Service
  - [ ] 9.1 Create product service
    - Create `src/lib/supabase/products.ts` dengan getProducts, getProductBySlug
    - Implement filtering, sorting, pagination
    - Implement search dengan full-text search
    - _Requirements: 3.1, 20.4, 20.5_

  - [ ] 9.2 Create category service
    - Create `src/lib/supabase/categories.ts` dengan getCategories, getCategoryBySlug
    - Implement hierarchical category fetching
    - _Requirements: 4.1, 4.3_

  - [ ] 9.3 Update product components to use Supabase
    - Update ProductGrid to fetch from Supabase
    - Update ProductCard to use new data structure
    - Update ProductFilters to use Supabase queries
    - _Requirements: 3.1_

  - [ ] 9.4 Update product detail page
    - Update `src/app/(store)/produk/[slug]/page.tsx` to fetch from Supabase
    - Include product images gallery
    - Include related products
    - _Requirements: 3.1, 3.5_

  - [ ]* 9.5 Write property test for product slug uniqueness
    - **Property 5: Product Slug Uniqueness**
    - **Validates: Requirements 3.2**

- [ ] 10. Implement Data Migration
  - [ ] 10.1 Create migration script
    - Create `scripts/migrate-to-supabase.ts`
    - Migrate countries and shipping zones
    - Migrate categories from existing products
    - Migrate products with images
    - _Requirements: 19.1, 19.2, 19.3, 19.4_

  - [ ] 10.2 Run migration
    - Execute migration script
    - Verify data integrity
    - _Requirements: 19.5_

  - [ ]* 10.3 Write property test for migration data integrity
    - **Property 19: Migration Data Integrity**
    - **Validates: Requirements 19.3**

- [ ] 11. Checkpoint - Products Complete
  - Verify products display correctly from Supabase
  - Verify filtering and search working
  - Verify category navigation working
  - Test product detail page

---

### Phase 4: Cart System

- [ ] 12. Implement Cart Service
  - [ ] 12.1 Create cart service
    - Create `src/lib/supabase/cart.ts` dengan getCart, addItem, updateQuantity, removeItem
    - Implement cart summary calculation
    - Implement stock validation
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [ ] 12.2 Create cart context/hook
    - Create `src/hooks/useCart.ts` dengan realtime subscription
    - Implement optimistic updates
    - _Requirements: 5.5, 18.3_

  - [ ] 12.3 Create cart UI components
    - Create `src/components/cart/CartDrawer.tsx`
    - Create `src/components/cart/CartItem.tsx`
    - Create `src/components/cart/CartSummary.tsx`
    - _Requirements: 5.1, 5.5_

  - [ ] 12.4 Create cart page
    - Create `src/app/(store)/cart/page.tsx`
    - Implement quantity controls
    - Implement remove item
    - _Requirements: 5.1, 5.3, 5.4_

  - [ ]* 12.5 Write property test for cart item idempotence
    - **Property 9: Cart Item Idempotence**
    - **Validates: Requirements 5.1, 5.2**

  - [ ]* 12.6 Write property test for cart total calculation
    - **Property 11: Cart Total Calculation**
    - **Validates: Requirements 5.5**

- [ ] 13. Checkpoint - Cart Complete
  - Test add to cart from product page
  - Test quantity update
  - Test remove item
  - Test cart total calculation

---

### Phase 5: Checkout & Orders

- [ ] 14. Implement Checkout Flow
  - [ ] 14.1 Create order service
    - Create `src/lib/supabase/orders.ts` dengan createOrder, getOrders, getOrderById
    - Implement order creation with inventory reservation
    - Implement order cancellation with inventory release
    - _Requirements: 6.1, 6.3, 6.5, 6.9_

  - [ ] 14.2 Create shipping service
    - Create `src/lib/supabase/shipping.ts` dengan calculateShipping, getShippingZones
    - Implement shipping cost calculation based on zone and weight
    - _Requirements: 8.2, 8.3_

  - [ ] 14.3 Create checkout UI components
    - Create `src/components/checkout/AddressSelector.tsx`
    - Create `src/components/checkout/ShippingSelector.tsx`
    - Create `src/components/checkout/OrderSummary.tsx`
    - _Requirements: 6.1, 8.3_

  - [ ] 14.4 Create checkout page
    - Create `src/app/(store)/checkout/page.tsx`
    - Implement multi-step checkout flow
    - _Requirements: 6.1_

  - [ ]* 14.5 Write property test for order creation invariants
    - **Property 12: Order Creation Invariants**
    - **Validates: Requirements 6.1, 6.2, 6.3**

  - [ ]* 14.6 Write property test for inventory state machine
    - **Property 6: Inventory State Machine Consistency**
    - **Validates: Requirements 6.5, 14.1, 14.2, 14.3, 14.4**

- [ ] 15. Implement Order Management
  - [ ] 15.1 Create order history page
    - Create `src/app/(store)/account/orders/page.tsx`
    - Display order list with status
    - _Requirements: 6.7_

  - [ ] 15.2 Create order detail page
    - Create `src/app/(store)/account/orders/[id]/page.tsx`
    - Display order items, shipping info, payment status
    - _Requirements: 6.7_

  - [ ] 15.3 Implement order status tracking
    - Create `src/components/order/OrderStatus.tsx`
    - Display timeline of order status changes
    - _Requirements: 6.7, 6.8_

- [ ] 16. Checkpoint - Checkout Complete
  - Test full checkout flow
  - Test order creation
  - Test order history display
  - Verify inventory reservation working

---

### Phase 6: Payment Integration

- [ ] 17. Implement Stripe Payment
  - [ ] 17.1 Setup Stripe
    - Install stripe package
    - Configure Stripe keys in environment
    - _Requirements: 7.1_

  - [ ] 17.2 Create payment service
    - Create `src/lib/supabase/payments.ts`
    - Implement createStripeCheckout
    - Implement getPaymentStatus
    - _Requirements: 7.1, 7.3_

  - [ ] 17.3 Create Stripe checkout session Edge Function
    - Create `supabase/functions/create-checkout/index.ts`
    - Generate Stripe checkout session
    - _Requirements: 7.3_

  - [ ] 17.4 Create Stripe webhook Edge Function
    - Create `supabase/functions/stripe-webhook/index.ts`
    - Handle checkout.session.completed
    - Handle payment_intent.payment_failed
    - Update order and payment status
    - _Requirements: 7.6_

  - [ ] 17.5 Create payment UI
    - Create `src/components/checkout/PaymentSelector.tsx`
    - Create payment success/failure pages
    - _Requirements: 7.1_

- [ ] 18. Implement PayPal Payment (Optional)
  - [ ] 18.1 Setup PayPal
    - Configure PayPal credentials
    - _Requirements: 7.1_

  - [ ] 18.2 Create PayPal integration
    - Implement createPayPalOrder
    - Create PayPal webhook handler
    - _Requirements: 7.1, 7.6_

- [ ] 19. Checkpoint - Payment Complete
  - Test Stripe checkout flow
  - Test webhook handling
  - Test payment status updates
  - Test order status after payment

---

### Phase 7: Reviews & Wishlist

- [ ] 20. Implement Review System
  - [ ] 20.1 Create review service
    - Create `src/lib/supabase/reviews.ts` dengan createReview, getProductReviews
    - Implement review eligibility check (must have completed order)
    - _Requirements: 9.1, 9.2, 9.4_

  - [ ] 20.2 Create review UI components
    - Create `src/components/review/ReviewForm.tsx`
    - Create `src/components/review/ReviewList.tsx`
    - Create `src/components/review/StarRating.tsx`
    - _Requirements: 9.1, 9.2_

  - [ ] 20.3 Integrate reviews into product page
    - Add review section to product detail
    - Display average rating
    - _Requirements: 9.3_

  - [ ]* 20.4 Write property test for review rating bounds
    - **Property 13: Review Rating Bounds**
    - **Validates: Requirements 9.2**

  - [ ]* 20.5 Write property test for product rating calculation
    - **Property 14: Product Rating Calculation**
    - **Validates: Requirements 9.3**

- [ ] 21. Implement Wishlist
  - [ ] 21.1 Create wishlist service
    - Create `src/lib/supabase/wishlist.ts` dengan addToWishlist, removeFromWishlist, getWishlist
    - _Requirements: 10.1, 10.2, 10.3_

  - [ ] 21.2 Create wishlist UI
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

## Notes

- Tasks marked with `*` are optional property-based tests
- Each checkpoint ensures incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Checkpoints ensure incremental validation

