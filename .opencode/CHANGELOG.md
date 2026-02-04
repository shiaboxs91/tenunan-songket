# Changelog

## 2026-02-05 - Guest Checkout Implementation Complete

### Summary
Completed the guest checkout feature allowing non-authenticated users to place orders.

### Changes Made

#### 1. Checkout Page (`src/app/(store)/checkout/page.tsx`)
- **Updated `handlePlaceOrder`**: Now allows guest checkout instead of redirecting to login
- **Added guest email validation**: Requires email for guest orders
- **Passes `guest_email` to `createOrder`**: Enables order creation with guest email
- **Conditional cart clearing**: Only clears server cart for authenticated users
- **Removed login prompt in Step 4**: Replaced with email confirmation display for guests
- **Enabled submit button for guests**: Removed `isAuthenticated === false` from disabled condition
- **Removed unused `LogIn` import**

#### 2. CheckoutAddressSection (`src/components/checkout/CheckoutAddressSection.tsx`)
- **Added email display in guest address summary**: Shows email alongside phone number

### Database Changes (Previously Applied)
- `orders.guest_email` column (VARCHAR 255)
- `orders.guest_phone` column (VARCHAR 50)
- `orders.user_id` made nullable
- RLS policies for anon role to insert/select guest orders

### Flow Summary
**Guest Checkout Flow:**
1. Add products to cart
2. Go to checkout
3. Click "Lanjut Sebagai Tamu"
4. Fill address form including email
5. Select shipping method
6. Select payment method
7. Review order (shows email confirmation notice)
8. Place order -> redirected to success page

### Files Modified
- `src/app/(store)/checkout/page.tsx`
- `src/components/checkout/CheckoutAddressSection.tsx`
