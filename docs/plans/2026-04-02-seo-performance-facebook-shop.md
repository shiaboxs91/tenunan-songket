# SEO, Performance & Facebook Shop Integration Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Optimize website for Google search ranking (SEO), maximize loading performance, and integrate Facebook Shop sync for admin.

**Architecture:** Three-phase approach - (1) SEO on-page/off-page optimizations, (2) Performance tuning, (3) Facebook Commerce API integration with admin module.

**Tech Stack:** Next.js 14 App Router, Supabase, Facebook Commerce API, React Server Components

---

## Current State Analysis

### SEO Gaps Identified
- NO `robots.txt` file
- NO `sitemap.xml` (dynamic)
- NO `generateMetadata` for product detail pages
- NO JSON-LD structured data (Schema.org)
- NO Twitter Cards
- Products have `meta_title` and `meta_description` columns but all NULL
- No canonical URLs
- No breadcrumb structured data

### Performance Current State
- Image optimization: GOOD (AVIF/WebP, lazy loading)
- Font optimization: GOOD (Inter with swap)
- Service Worker: GOOD (caching strategy)
- Vercel Analytics: GOOD
- Missing: Bundle analysis, Component lazy loading, ISR/SSG

### Facebook Integration Gaps
- Facebook OAuth exists (login only)
- No Facebook Pixel/Meta Pixel
- No Facebook Catalog integration
- No Commerce API setup

---

## PHASE 1: SEO OPTIMIZATION

### Target Keywords untuk Kain Tenunan

**Primary Keywords (High Intent):**
- "beli kain songket online"
- "kain songket asli brunei"
- "kain tenunan melayu"
- "songket sarawak asli"
- "kain tenun tradisional"
- "songket benang emas"

**Long-tail Keywords:**
- "kain songket untuk majlis perkahwinan"
- "songket handmade berkualiti"
- "beli kain tenunan warisan melayu"
- "songket brunei betabur bintang"
- "kain tenun arap gegati asli"
- "songket lepus original"

**Category Keywords:**
- "songket brunei" / "kain brunei"
- "songket sarawak" / "kain sarawak"
- "songket sambas" / "kain sambas"
- "kain sinjang"
- "kain betabur"

---

### Task 1.1: Create robots.txt

**Files:**
- Create: `public/robots.txt`

**Step 1: Create robots.txt file**

```txt
# Robots.txt for Tenunan Songket
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /checkout/
Disallow: /account/

# Sitemap
Sitemap: https://tenunansongket.com/sitemap.xml

# Crawl-delay for polite crawling
Crawl-delay: 1
```

**Verify:** Access `http://localhost:3000/robots.txt`

---

### Task 1.2: Create Dynamic Sitemap

**Files:**
- Create: `src/app/sitemap.ts`

**Step 1: Create sitemap generator**

```typescript
import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const baseUrl = 'https://tenunansongket.com'
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tentang-kami`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/cara-order`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]
  
  // Dynamic product pages
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('is_active', true)
    .eq('is_deleted', false)
  
  const productPages: MetadataRoute.Sitemap = (products || []).map((product) => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(product.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))
  
  // Dynamic category pages
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, created_at')
    .eq('is_active', true)
  
  const categoryPages: MetadataRoute.Sitemap = (categories || []).map((category) => ({
    url: `${baseUrl}/products?category=${category.slug}`,
    lastModified: new Date(category.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))
  
  return [...staticPages, ...productPages, ...categoryPages]
}
```

**Verify:** Access `http://localhost:3000/sitemap.xml`

---

### Task 1.3: Add generateMetadata for Product Detail Page

**Files:**
- Modify: `src/app/(store)/products/[slug]/page.tsx`

**Step 1: Add generateMetadata function**

```typescript
import { Metadata } from 'next'

export async function generateMetadata({ 
  params 
}: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug)
  
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select(`
      title, 
      description, 
      meta_title, 
      meta_description,
      price,
      images:product_images(url, is_primary)
    `)
    .eq('slug', decodedSlug)
    .eq('is_active', true)
    .eq('is_deleted', false)
    .single()
  
  if (!product) {
    return {
      title: 'Produk Tidak Ditemukan - Tenunan Songket',
    }
  }
  
  const primaryImage = product.images?.find((img: any) => img.is_primary)?.url 
    || product.images?.[0]?.url
  
  const title = product.meta_title || `${product.title} - Beli Kain Songket Asli`
  const description = product.meta_description || product.description?.slice(0, 160) || 
    `Beli ${product.title} asli berkualiti tinggi. Kain tenunan tradisional Melayu dengan benang emas, 100% handmade.`
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'product',
      url: `https://tenunansongket.com/products/${decodedSlug}`,
      images: primaryImage ? [
        {
          url: primaryImage,
          width: 1200,
          height: 630,
          alt: product.title,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: primaryImage ? [primaryImage] : [],
    },
    alternates: {
      canonical: `https://tenunansongket.com/products/${decodedSlug}`,
    },
  }
}
```

**Step 2: Add import for createClient**

Add to imports: `import { createClient } from '@/lib/supabase/server'`

---

### Task 1.4: Add JSON-LD Structured Data

**Files:**
- Create: `src/components/seo/ProductJsonLd.tsx`
- Create: `src/components/seo/BreadcrumbJsonLd.tsx`
- Create: `src/components/seo/OrganizationJsonLd.tsx`
- Modify: `src/app/(store)/products/[slug]/page.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Create ProductJsonLd component**

```typescript
// src/components/seo/ProductJsonLd.tsx
interface ProductJsonLdProps {
  product: {
    title: string
    description: string
    price: number
    currency?: string
    image: string
    url: string
    sku: string
    inStock: boolean
    rating?: number
    reviewCount?: number
    brand?: string
  }
}

export function ProductJsonLd({ product }: ProductJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.image,
    url: product.url,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Tenunan Songket',
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency || 'BND',
      availability: product.inStock 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      url: product.url,
      seller: {
        '@type': 'Organization',
        name: 'Tenunan Songket',
      },
    },
    ...(product.rating && product.reviewCount && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
      },
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
```

**Step 2: Create BreadcrumbJsonLd component**

```typescript
// src/components/seo/BreadcrumbJsonLd.tsx
interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbJsonLdProps {
  items: BreadcrumbItem[]
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
```

**Step 3: Create OrganizationJsonLd component**

```typescript
// src/components/seo/OrganizationJsonLd.tsx
export function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Tenunan Songket',
    url: 'https://tenunansongket.com',
    logo: 'https://tenunansongket.com/icons/icon-512x512.png',
    description: 'Penjual kain songket asli berkualiti tinggi. Warisan budaya Melayu dengan benang emas, 100% handmade.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'BN',
    },
    sameAs: [
      'https://instagram.com/tenunansongkett',
      'https://facebook.com/tenunansongket',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Malay', 'English'],
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
```

**Step 4: Create index export**

```typescript
// src/components/seo/index.ts
export { ProductJsonLd } from './ProductJsonLd'
export { BreadcrumbJsonLd } from './BreadcrumbJsonLd'
export { OrganizationJsonLd } from './OrganizationJsonLd'
```

---

### Task 1.5: Update Product Detail Page with JSON-LD

**Files:**
- Modify: `src/app/(store)/products/[slug]/page.tsx`

Add JSON-LD components to product detail page after the main content.

---

### Task 1.6: Add Organization JSON-LD to Root Layout

**Files:**
- Modify: `src/app/layout.tsx`

Add OrganizationJsonLd to the body.

---

### Task 1.7: Create Meta Pixel Integration

**Files:**
- Create: `src/components/analytics/MetaPixel.tsx`
- Modify: `src/app/layout.tsx`
- Create: `src/lib/analytics/meta-pixel.ts`

**Step 1: Create Meta Pixel component**

```typescript
// src/components/analytics/MetaPixel.tsx
'use client'

import Script from 'next/script'

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID

export function MetaPixel() {
  if (!META_PIXEL_ID) return null

  return (
    <>
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${META_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  )
}
```

**Step 2: Create pixel event helpers**

```typescript
// src/lib/analytics/meta-pixel.ts
declare global {
  interface Window {
    fbq: (...args: unknown[]) => void
  }
}

export const trackEvent = (event: string, data?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', event, data)
  }
}

export const trackViewContent = (product: {
  id: string
  name: string
  price: number
  currency?: string
  category?: string
}) => {
  trackEvent('ViewContent', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    content_category: product.category,
    value: product.price,
    currency: product.currency || 'BND',
  })
}

export const trackAddToCart = (product: {
  id: string
  name: string
  price: number
  quantity: number
  currency?: string
}) => {
  trackEvent('AddToCart', {
    content_ids: [product.id],
    content_name: product.name,
    content_type: 'product',
    value: product.price * product.quantity,
    currency: product.currency || 'BND',
    num_items: product.quantity,
  })
}

export const trackPurchase = (order: {
  id: string
  total: number
  currency?: string
  items: Array<{ id: string; quantity: number }>
}) => {
  trackEvent('Purchase', {
    content_ids: order.items.map(i => i.id),
    content_type: 'product',
    value: order.total,
    currency: order.currency || 'BND',
    num_items: order.items.reduce((sum, i) => sum + i.quantity, 0),
  })
}

export const trackSearch = (query: string) => {
  trackEvent('Search', { search_string: query })
}

export const trackInitiateCheckout = (cart: {
  total: number
  currency?: string
  items: Array<{ id: string; quantity: number }>
}) => {
  trackEvent('InitiateCheckout', {
    content_ids: cart.items.map(i => i.id),
    content_type: 'product',
    value: cart.total,
    currency: cart.currency || 'BND',
    num_items: cart.items.reduce((sum, i) => sum + i.quantity, 0),
  })
}
```

---

### Task 1.8: Update Admin SEO Settings

**Files:**
- Modify: `src/app/admin/settings/page.tsx`

Add Google Search Console verification field and Meta Pixel ID field.

---

## PHASE 2: PERFORMANCE OPTIMIZATION

### Task 2.1: Convert Product List to ISR/SSG

**Files:**
- Modify: `src/app/(store)/products/page.tsx`

**Step 1: Add revalidation**

```typescript
export const revalidate = 300 // Revalidate every 5 minutes
```

---

### Task 2.2: Implement Dynamic Imports for Heavy Components

**Files:**
- Modify: `src/app/(store)/products/[slug]/page.tsx`

**Step 1: Dynamic import for ProductReviews**

```typescript
import dynamic from 'next/dynamic'

const ProductReviews = dynamic(
  () => import('@/components/product/ProductReviews').then(m => ({ default: m.ProductReviews })),
  { 
    loading: () => <div className="h-48 animate-pulse bg-muted rounded-lg" />,
    ssr: false 
  }
)
```

---

### Task 2.3: Add Image Placeholder/Blur

**Files:**
- Modify: `src/components/product/ProductCard.tsx`
- Modify: `src/components/product/ProductGallery.tsx`

Add `placeholder="blur"` with `blurDataURL` for product images.

---

### Task 2.4: Optimize Bundle Size

**Files:**
- Create: `scripts/analyze-bundle.js`
- Modify: `next.config.mjs`

**Step 1: Add bundle analyzer**

```javascript
// next.config.mjs
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)
```

---

### Task 2.5: Add Preload for Critical Resources

**Files:**
- Modify: `src/app/(store)/layout.tsx`

Add preload hints for hero images and critical fonts.

---

### Task 2.6: Implement Stale-While-Revalidate for API

**Files:**
- Modify: `src/app/api/products/route.ts`

Add cache headers for SWR pattern.

---

## PHASE 3: FACEBOOK SHOP INTEGRATION

### Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Admin Panel   │────▶│  Supabase Edge   │────▶│ Facebook Graph  │
│  (Sync Module)  │     │    Function      │     │      API        │
└─────────────────┘     └──────────────────┘     └─────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌──────────────────┐
│ fb_catalog_sync │     │  Sync Status     │
│    (table)      │◀────│  & Logs          │
└─────────────────┘     └──────────────────┘
```

### Task 3.1: Create Database Schema for FB Catalog

**Files:**
- Migration: `supabase/migrations/xxx_facebook_catalog.sql`

**Step 1: Create migration**

```sql
-- Facebook Catalog Integration
CREATE TABLE IF NOT EXISTS fb_catalog_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id VARCHAR(255),
  business_id VARCHAR(255),
  access_token TEXT, -- encrypted
  page_access_token TEXT, -- encrypted
  is_active BOOLEAN DEFAULT false,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fb_catalog_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  fb_product_id VARCHAR(255),
  sync_status VARCHAR(50) DEFAULT 'pending', -- pending, synced, error, deleted
  last_sync_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(product_id)
);

CREATE TABLE IF NOT EXISTS fb_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(50), -- create, update, delete, bulk_sync
  product_count INT,
  success_count INT,
  error_count INT,
  error_details JSONB,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE fb_catalog_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE fb_catalog_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE fb_sync_logs ENABLE ROW LEVEL SECURITY;

-- Admin-only policies
CREATE POLICY "Admin can manage FB config" ON fb_catalog_config
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can manage FB products" ON fb_catalog_products
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admin can view sync logs" ON fb_sync_logs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin')
  );
```

---

### Task 3.2: Create Admin Facebook Shop Module UI

**Files:**
- Create: `src/app/admin/facebook-shop/page.tsx`
- Create: `src/app/admin/facebook-shop/loading.tsx`
- Create: `src/components/admin/facebook/FacebookShopSettings.tsx`
- Create: `src/components/admin/facebook/FacebookProductSync.tsx`
- Create: `src/components/admin/facebook/FacebookSyncLogs.tsx`
- Modify: `src/components/admin/AdminSidebar.tsx`

**Step 1: Create main page**

```typescript
// src/app/admin/facebook-shop/page.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FacebookShopSettings } from '@/components/admin/facebook/FacebookShopSettings'
import { FacebookProductSync } from '@/components/admin/facebook/FacebookProductSync'
import { FacebookSyncLogs } from '@/components/admin/facebook/FacebookSyncLogs'

export default function FacebookShopPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Facebook Shop Integration</h1>
      
      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">Pengaturan</TabsTrigger>
          <TabsTrigger value="products">Sinkronisasi Produk</TabsTrigger>
          <TabsTrigger value="logs">Riwayat Sinkron</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings">
          <FacebookShopSettings />
        </TabsContent>
        
        <TabsContent value="products">
          <FacebookProductSync />
        </TabsContent>
        
        <TabsContent value="logs">
          <FacebookSyncLogs />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

**Step 2: Create FacebookShopSettings component**

```typescript
// src/components/admin/facebook/FacebookShopSettings.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ExternalLink, Info } from 'lucide-react'

interface FBConfig {
  catalog_id: string
  business_id: string
  access_token: string
  page_access_token: string
  is_active: boolean
}

export function FacebookShopSettings() {
  const [config, setConfig] = useState<FBConfig>({
    catalog_id: '',
    business_id: '',
    access_token: '',
    page_access_token: '',
    is_active: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('fb_catalog_config')
      .select('*')
      .single()
    
    if (data) {
      setConfig({
        catalog_id: data.catalog_id || '',
        business_id: data.business_id || '',
        access_token: data.access_token ? '••••••••' : '',
        page_access_token: data.page_access_token ? '••••••••' : '',
        is_active: data.is_active,
      })
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    
    const { error } = await supabase
      .from('fb_catalog_config')
      .upsert({
        id: '00000000-0000-0000-0000-000000000001', // singleton
        catalog_id: config.catalog_id,
        business_id: config.business_id,
        access_token: config.access_token.includes('••••') ? undefined : config.access_token,
        page_access_token: config.page_access_token.includes('••••') ? undefined : config.page_access_token,
        is_active: config.is_active,
        updated_at: new Date().toISOString(),
      })
    
    if (error) {
      toast.error('Gagal menyimpan pengaturan')
    } else {
      toast.success('Pengaturan tersimpan')
    }
    setSaving(false)
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Untuk mengintegrasikan dengan Facebook Shop, anda perlu:
          <ol className="list-decimal ml-4 mt-2 space-y-1">
            <li>Buat Facebook Business Account</li>
            <li>Buat Commerce Account dan Catalog</li>
            <li>Generate System User Access Token dengan permissions: catalog_management, business_management</li>
          </ol>
          <a 
            href="https://www.facebook.com/business/help/912190892201033" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary underline flex items-center gap-1 mt-2"
          >
            Panduan Facebook Commerce <ExternalLink className="h-3 w-3" />
          </a>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Facebook Commerce API</CardTitle>
          <CardDescription>
            Konfigurasi untuk sinkronisasi produk ke Facebook Catalog
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="business_id">Business ID</Label>
              <Input
                id="business_id"
                value={config.business_id}
                onChange={(e) => setConfig({ ...config, business_id: e.target.value })}
                placeholder="123456789012345"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="catalog_id">Catalog ID</Label>
              <Input
                id="catalog_id"
                value={config.catalog_id}
                onChange={(e) => setConfig({ ...config, catalog_id: e.target.value })}
                placeholder="123456789012345"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="access_token">System User Access Token</Label>
            <Input
              id="access_token"
              type="password"
              value={config.access_token}
              onChange={(e) => setConfig({ ...config, access_token: e.target.value })}
              placeholder="EAAxxxxxxx..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="page_access_token">Page Access Token (Optional)</Label>
            <Input
              id="page_access_token"
              type="password"
              value={config.page_access_token}
              onChange={(e) => setConfig({ ...config, page_access_token: e.target.value })}
              placeholder="EAAxxxxxxx..."
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={config.is_active}
              onCheckedChange={(checked) => setConfig({ ...config, is_active: checked })}
            />
            <Label htmlFor="is_active">Aktifkan Sinkronisasi Otomatis</Label>
          </div>

          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

### Task 3.3: Create Facebook Product Sync Component

**Files:**
- Create: `src/components/admin/facebook/FacebookProductSync.tsx`

Product list with sync status and bulk sync action.

---

### Task 3.4: Create Supabase Edge Function for FB API

**Files:**
- Create: `supabase/functions/facebook-catalog-sync/index.ts`

Edge function to handle Facebook Catalog API calls.

---

### Task 3.5: Add Facebook Shop to Admin Sidebar

**Files:**
- Modify: `src/components/admin/AdminSidebar.tsx`

Add new menu item under "Pengaturan" group:
```typescript
{ 
  icon: <Store className="w-4 h-4" />, 
  label: "Facebook Shop", 
  path: "/admin/facebook-shop" 
}
```

---

### Task 3.6: Create FB Sync API Route

**Files:**
- Create: `src/app/api/admin/facebook-sync/route.ts`

API route to trigger sync from admin panel.

---

### Task 3.7: Add Webhook for Auto-Sync on Product Update

**Files:**
- Modify: `src/lib/supabase/products.ts`

Add trigger to sync product to FB catalog when updated.

---

## Testing Checklist

### SEO Testing
- [ ] robots.txt accessible
- [ ] sitemap.xml generates correctly
- [ ] Product pages have dynamic metadata
- [ ] JSON-LD validates on Google Rich Results Test
- [ ] Open Graph tags work (use Facebook Sharing Debugger)
- [ ] Twitter Cards work (use Twitter Card Validator)

### Performance Testing
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals pass
- [ ] Bundle size < 200KB first load
- [ ] Images lazy load correctly
- [ ] ISR works (check cache headers)

### Facebook Shop Testing
- [ ] FB config saves correctly
- [ ] Products sync to catalog
- [ ] Sync logs recorded
- [ ] Error handling works
- [ ] Bulk sync completes

---

## Environment Variables Required

```env
# Meta/Facebook
NEXT_PUBLIC_META_PIXEL_ID=your_pixel_id
FB_SYSTEM_USER_TOKEN=EAAxxxxxxx (stored in Supabase, not env)

# Google
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=xxxxx
```

---

## Execution Order

1. **Phase 1 (SEO):** Tasks 1.1 → 1.8
2. **Phase 2 (Performance):** Tasks 2.1 → 2.6
3. **Phase 3 (Facebook Shop):** Tasks 3.1 → 3.7

Estimated total time: 4-6 hours

---

## Progress Tracking

| Phase | Task | Status | Notes |
|-------|------|--------|-------|
| 1 | 1.1 robots.txt | pending | |
| 1 | 1.2 sitemap.ts | pending | |
| 1 | 1.3 generateMetadata | pending | |
| 1 | 1.4 JSON-LD components | pending | |
| 1 | 1.5 Product page JSON-LD | pending | |
| 1 | 1.6 Organization JSON-LD | pending | |
| 1 | 1.7 Meta Pixel | pending | |
| 1 | 1.8 Admin SEO settings | pending | |
| 2 | 2.1 ISR for products | pending | |
| 2 | 2.2 Dynamic imports | pending | |
| 2 | 2.3 Image placeholders | pending | |
| 2 | 2.4 Bundle optimization | pending | |
| 2 | 2.5 Preload hints | pending | |
| 2 | 2.6 SWR API cache | pending | |
| 3 | 3.1 DB schema | pending | |
| 3 | 3.2 Admin UI | pending | |
| 3 | 3.3 Product sync UI | pending | |
| 3 | 3.4 Edge function | pending | |
| 3 | 3.5 Sidebar menu | pending | |
| 3 | 3.6 Sync API route | pending | |
| 3 | 3.7 Auto-sync webhook | pending | |
