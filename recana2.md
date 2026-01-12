You are a senior frontend engineer and UI engineer tasked with building a modern e-commerce storefront demo for TenunanSongket Store. Your focus is exclusively on creating a presentation-ready frontend demo.

## Project Overview
**Design Direction:** Modern minimal with maroon accents
**Goal:** Create a modern, fast, and easily navigable e-commerce frontend that feels like a major marketplace (search, categories, filters, sorting, product grid)

## Technical Requirements

### Stack (Mandatory)
- Next.js (App Router) + TypeScript
- Tailwind CSS
- shadcn/ui components + Radix
- Use Server Components by default for performance; Client Components only for interactions (filter UI state, cart)

### Data Source
- Fetch real content from RSS feed: https://tenunansongket.com/feed/
- Create Route Handler: `GET /api/products` that fetches RSS, parses XML, and maps to Product[]
- Include fallback to `data/products.snapshot.json` if RSS fetch fails

### Product Type Contract
```typescript
export type Product = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image?: string;
  price: number;
  currency: "IDR";
  category: string;
  tags: string[];
  inStock: boolean;
  rating: number;
  sold: number;
  createdAt?: string;
  sourceUrl: string;
};
```

## Design System

### Color Scheme (Tailwind CSS variables)
- Primary (maroon): `#7A1F3D`
- Accent gold (optional): `#C8A24A`
- Background: white/very light gray
- Text: dark slate
- Use HSL and CSS variables for easy tuning

### Design Principles
- Minimal design with adequate whitespace
- Clean typography (Inter font)
- Focus on product photos and CTAs
- Maroon used as accent color (CTAs, active links, badges), not dominant
- Subtle songket motif background patterns (low opacity) in hero/footer sections

## Required Pages & Features

### Global Layout
**Header (sticky):**
- Left: logo
- Center (desktop): search bar
- Right: category dropdown + cart icon + account
- Mobile: hamburger menu → Sheet, clear search

**Footer:**
- Links: Cara Order, Tentang, Kontak (dummy), Social (dummy)
- Brief brand story

### Page Requirements

1. **Home (/):** Hero banner, popular categories, popular products grid, latest products grid, USP section

2. **Product Listing (/products):** 
   - Desktop: sidebar filters + grid
   - Mobile: filter via Sheet
   - Filters: category, price range, stock
   - Sort: newest, cheapest, best-selling
   - Pagination with querystring support

3. **Product Detail (/products/[slug]):** Gallery carousel, product info, variants (demo), Add to Cart + Buy Now CTAs, tabs (description, shipping, care), product recommendations

4. **Cart (/cart):** Item list, quantity stepper, remove items, summary (subtotal, shipping, tax - all demo), checkout CTA

5. **Checkout (/checkout):** 3-step stepper (Address, Shipping, Summary), redirect to success after submit

6. **Success (/checkout/success):** Dummy order number, summary, return to shopping CTA

7. **Account (/account):** Demo login/register UI + basic profile

## Folder Structure
```
/app
  /(store)
    page.tsx
    products/page.tsx
    products/[slug]/page.tsx
    cart/page.tsx
    checkout/page.tsx
    checkout/success/page.tsx
    account/page.tsx
  /api/products/route.ts
/components
  /layout
    Header.tsx
    Footer.tsx
  /product
    ProductCard.tsx
    ProductGrid.tsx
    ProductGallery.tsx
  /filters
    FilterSidebar.tsx
    FilterSheetMobile.tsx
/lib
  products.ts
  rss.ts
  utils.ts
/data
  products.snapshot.json
```

## Implementation Steps (Execute in Order)
1. Bootstrap Next.js App Router + TypeScript + Tailwind
2. Setup shadcn/ui with "modern minimal maroon" theme
3. Create global layout (Header/Footer) + routing
4. Implement all pages: Home → Listing → Detail → Cart → Checkout → Success → Account
5. Implement /api/products (RSS fetch+parse+mapping) + fallback snapshot
6. Connect UI to data from /api/products
7. Implement persistent cart (localStorage)
8. Ensure mobile-first design, clear CTAs, loading states (Skeleton), elegant error states

## Acceptance Criteria
- All pages navigable without errors
- Products display from feed or snapshot
- Search & filters functional
- Complete cart flow: add to cart → update quantity → checkout → success
- Visual: modern minimal maroon design, clean on desktop & mobile
- Responsive design (360px–1440px)
- Minimal client-side JS for performance
- No ugly placeholders - use elegant UI fallbacks when data is insufficient

**Important:** This is a frontend demo only. Shipping/tax/payment are simulations. All transactions are demo-only.

Create a complete, presentation-ready e-commerce frontend that demonstrates the full user journey from browsing to checkout completion.