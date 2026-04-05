interface ProductJsonLdProps {
  product: {
    title: string
    description: string
    price: number
    salePrice?: number
    currency?: string
    image: string
    images?: string[]
    url: string
    sku: string
    inStock: boolean
    rating?: number
    reviewCount?: number
    brand?: string
    category?: string
    colors?: string[]
  }
}

export function ProductJsonLd({ product }: ProductJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images && product.images.length > 0 ? product.images : [product.image],
    url: product.url,
    sku: product.sku,
    brand: {
      '@type': 'Brand',
      name: product.brand || 'Tenunan Songket',
    },
    ...(product.category && {
      category: product.category,
    }),
    ...(product.colors && product.colors.length > 0 && {
      color: product.colors.join(', '),
    }),
    offers: {
      '@type': 'Offer',
      price: product.salePrice || product.price,
      priceCurrency: product.currency || 'BND',
      availability: product.inStock 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      url: product.url,
      seller: {
        '@type': 'Organization',
        name: 'Tenunan Songket',
      },
      ...(product.salePrice && {
        priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      }),
    },
    ...(product.rating && product.reviewCount && product.reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating.toFixed(1),
        reviewCount: product.reviewCount,
        bestRating: '5',
        worstRating: '1',
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
