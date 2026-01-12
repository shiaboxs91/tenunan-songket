# Design Document

## Overview

Dokumen ini menjelaskan desain teknis untuk implementasi peningkatan UI/UX TenunanSongket Store. Implementasi akan menggunakan React components dengan Tailwind CSS, shadcn/ui components, dan Lucide icons yang sudah ada di project.

## Architecture

### Component Structure

```
src/components/
├── layout/
│   ├── Header.tsx (update: mobile search, compact on scroll)
│   ├── MobileBottomNav.tsx (update: add Kategori)
│   └── CategorySheet.tsx (new)
├── product/
│   ├── ProductFilters.tsx (new: desktop sidebar)
│   ├── MobileFilterSheet.tsx (new: mobile bottom sheet)
│   ├── ProductSorting.tsx (new)
│   ├── GridDensityToggle.tsx (new)
│   ├── QuickViewModal.tsx (new)
│   └── StickyProductCTA.tsx (new)
└── ui/
    └── (existing shadcn components)
```

### State Management

- Filter state: URL search params (untuk shareable URLs)
- Grid density: localStorage
- UI state (modals, sheets): React useState

## Components and Interfaces

### 1. Mobile Search Header

```typescript
interface MobileSearchState {
  isExpanded: boolean;
  query: string;
}

// Header.tsx akan diupdate dengan:
// - Search icon yang expand menjadi full search bar
// - Compact mode saat scroll (useScrollDirection hook)
```

### 2. StickyProductCTA Component

```typescript
interface StickyProductCTAProps {
  product: Product;
  onAddToCart: () => void;
  onBuyNow: () => void;
}

// Posisi: fixed bottom, di atas MobileBottomNav
// Desktop: tidak perlu sticky (sudah visible di layout)
```

### 3. ProductFilters Component (Desktop Sidebar)

```typescript
interface FilterState {
  categories: string[];
  priceMin: number | null;
  priceMax: number | null;
  inStockOnly: boolean;
}

interface ProductFiltersProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  categories: string[];
}
```

### 4. MobileFilterSheet Component

```typescript
interface MobileFilterSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterState;
  onApply: (filters: FilterState) => void;
  categories: string[];
}

// Menggunakan Sheet dari shadcn/ui dengan side="bottom"
```

### 5. ProductSorting Component

```typescript
type SortOption = 
  | "newest" 
  | "price-asc" 
  | "price-desc" 
  | "bestselling" 
  | "rating";

interface ProductSortingProps {
  value: SortOption;
  onChange: (value: SortOption) => void;
  totalProducts: number;
}
```

### 6. GridDensityToggle Component

```typescript
type GridDensity = "compact" | "comfortable";

interface GridDensityToggleProps {
  value: GridDensity;
  onChange: (value: GridDensity) => void;
}

// Compact: 3 cols mobile, 5-6 cols desktop
// Comfortable: 2 cols mobile, 4 cols desktop
```

### 7. QuickViewModal Component

```typescript
interface QuickViewModalProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddToCart: (product: Product) => void;
}
```

### 8. CategorySheet Component

```typescript
interface CategorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: string[];
  onSelectCategory: (category: string) => void;
}
```

## Data Models

### Filter State (URL Params)

```typescript
// URL: /products?category=Songket+Palembang&minPrice=500000&maxPrice=2000000&inStock=true&sort=newest

interface ProductPageSearchParams {
  q?: string;           // search query
  category?: string;    // single or comma-separated
  minPrice?: string;    // number as string
  maxPrice?: string;    // number as string
  inStock?: string;     // "true" or "false"
  sort?: SortOption;
}
```

### Grid Density Storage

```typescript
// localStorage key: "tenunan-grid-density"
// value: "compact" | "comfortable"
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system.*

### Property 1: Filter URL Sync
*For any* filter state applied by the user, the URL search params SHALL reflect the current filter state, and refreshing the page SHALL restore the same filter state.
**Validates: Requirements 3.5, 4.5**

### Property 2: Sort Consistency
*For any* sort option selected, the product list SHALL be ordered according to that criteria, and the order SHALL remain consistent until a different sort is selected.
**Validates: Requirements 5.3**

### Property 3: Grid Density Persistence
*For any* grid density selection, the preference SHALL be persisted to localStorage, and subsequent page visits SHALL restore the same density setting.
**Validates: Requirements 8.4**

### Property 4: Sticky CTA Visibility
*For any* scroll position on the product detail page (mobile), the sticky CTA SHALL remain visible and not overlap with other fixed elements (bottom nav).
**Validates: Requirements 2.1, 2.4**

### Property 5: Filter Reset Completeness
*For any* combination of active filters, clicking "Reset" SHALL clear all filters and return the product list to its unfiltered state.
**Validates: Requirements 3.6, 4.4**

## Error Handling

### Network Errors
- Filter/sort changes that fail to load products: Show toast error, maintain previous state
- Quick view modal fails to load: Show error state in modal with retry button

### Invalid URL Params
- Invalid filter values in URL: Ignore invalid params, use defaults
- Invalid sort option: Default to "newest"

### Edge Cases
- Empty filter results: Show "Tidak ada produk ditemukan" with suggestion to reset filters
- Price range invalid (min > max): Auto-swap values or show validation error

## Testing Strategy

### Unit Tests
- Filter state parsing from URL params
- Sort function correctness for each sort option
- Grid density localStorage read/write

### Integration Tests
- Filter application updates product grid
- Sort selection reorders products correctly
- Quick view modal opens with correct product data

### Property-Based Tests
- Filter URL round-trip (apply → URL → refresh → same state)
- Sort stability (same input → same output order)

### E2E Tests (Manual)
- Complete flow: browse → filter → sort → quick view → add to cart
- Mobile flow: bottom nav → category → filter sheet → detail → sticky CTA
