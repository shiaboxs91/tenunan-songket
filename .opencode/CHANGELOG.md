# Changelog

## 2026-02-05 - Address Form UX Simplification

### Summary
Simplified address form layout for better UX - all fields now stack vertically (single column) for clearer flow on both mobile and desktop. Dropdowns come first, then address input, then postal code.

### Field Order

**Malaysia:**
1. Country
2. Negeri (grouped dropdown)
3. Bandar/Pekan
4. Alamat
5. Detail Tambahan
6. Poskod

**Brunei:**
1. Country
2. Daerah
3. Mukim
4. Kampong (optional)
5. Alamat
6. Detail Tambahan
7. Poskod

**Singapore:**
1. Country
2. Address
3. Additional Details
4. Postal Code

### Changes Made
- Removed 2-column grid layouts for simpler flow
- Moved address/detail/postcode fields AFTER location dropdowns
- Each country now has its own complete field set in the correct order
- Profile AddressForm restructured to match GuestAddressForm pattern

### Files Modified
- `src/components/checkout/GuestAddressForm.tsx`
- `src/components/profile/AddressForm.tsx`

---

## 2026-02-05 - Address Form UX Improvements

### Summary
Enhanced the address forms (GuestAddressForm and AddressForm) with improved UX:
- Grouped Malaysia state dropdown by region (Semenanjung/Sabah/Sarawak)
- 2-column layout on desktop for related fields
- Better field ordering per country

### Changes Made

#### 1. Malaysia Data (`src/lib/data/address/malaysia.json`)
- Added `region` field to each state (semenanjung, sabah, sarawak)

#### 2. Address Helpers (`src/lib/data/address/index.ts`)
- Added `MalaysiaRegionCode` type
- Added `MALAYSIA_REGIONS` constant with display names
- Added `getMalaysiaStatesByRegion()` - returns states grouped by region
- Added `getMalaysiaRegion(stateCode)` - gets region for a state
- Updated `MalaysiaState` interface to include `region` field

#### 3. GuestAddressForm (`src/components/checkout/GuestAddressForm.tsx`)
- **Malaysia grouped dropdown**: Native `<select>` with `<optgroup>` for region grouping
- **2-column layout**: Phone & Email side by side on desktop
- **Brunei 2-column**: District & Mukim side by side on desktop
- **Malaysia 2-column**: City & Postcode side by side on desktop
- **Field ordering**: Country → Location fields → Address → Details → Postcode

#### 4. AddressForm (`src/components/profile/AddressForm.tsx`)
- Same UX improvements as GuestAddressForm
- **Malaysia grouped dropdown**: Native `<select>` with region groupings
- **2-column layouts**: District/Mukim and City/Postcode pairs
- Improved placeholder text for dependent fields

### Layout Summary

**Malaysia:**
| Desktop | Mobile |
|---------|--------|
| State (full width, grouped) | State |
| City | Postcode | City |
| Address | Postcode |
| Details | Address |
| | Details |

**Brunei:**
| Desktop | Mobile |
|---------|--------|
| District | Mukim | District |
| Kampong (optional) | Mukim |
| Address | Kampong |
| Details | Address |
| Postcode | Details |
| | Postcode |

### Files Modified
- `src/lib/data/address/malaysia.json`
- `src/lib/data/address/index.ts`
- `src/components/checkout/GuestAddressForm.tsx`
- `src/components/profile/AddressForm.tsx`

---

## 2026-02-05 - AddressForm Cascading Dropdowns

### Summary
Updated the profile AddressForm component to use cascading dropdowns for country-specific address fields, matching the GuestAddressForm implementation.

### Changes Made

#### 1. AddressForm (`src/components/profile/AddressForm.tsx`)
- **Added cascading dropdown imports**: Integrated address data helpers from `@/lib/data/address`
- **Extended form state**: Added `mukim` and `kampong` fields for Brunei-specific addresses
- **Memoized dropdown data**: Efficient data loading for Brunei districts/mukims/kampongs and Malaysia states/cities
- **Malaysia postcode auto-detect**: Automatically fills state and city when 5-digit postcode is entered
- **Country-specific UI**:
  - **Brunei**: District → Mukim → Kampong (optional) cascading dropdowns
  - **Malaysia**: Postcode → State → City cascading dropdowns
  - **Singapore**: Simplified form with just postal code (no state needed)
- **Updated validation logic**: Handles Brunei mukim requirement and Singapore state exemption
- **Code-to-name conversion**: Stores human-readable names (e.g., "Brunei-Muara", "Sabah") instead of codes
- **Reverse lookup on edit**: Converts stored names back to dropdown codes when editing existing addresses

### Shipping Compatibility
- Verified that shipping cost calculation (`stateToRegion()`) works with both:
  - State codes: `JHR`, `SBH`, `SWK`, `BM`, etc.
  - State names: `Johor`, `Sabah`, `Sarawak`, `Brunei-Muara`, etc.
- No changes needed to shipping calculation logic

### Files Modified
- `src/components/profile/AddressForm.tsx`

### Related Files (Previously Created)
- `src/lib/data/address/index.ts` - Helper functions
- `src/lib/data/address/brunei.json` - Brunei address data
- `src/lib/data/address/malaysia.json` - Malaysia address data
- `src/lib/data/address/singapore.json` - Singapore address data
- `src/components/checkout/GuestAddressForm.tsx` - Reference implementation

---

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
