import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface Product {
  id: string
  title: string
  slug: string
  price: number
  sale_price: number | null
  image_url: string | null
}

interface RelatedProductsProps {
  products: Product[]
  className?: string
}

export function RelatedProducts({ products, className }: RelatedProductsProps) {
  if (!products || products.length === 0) {
    return null
  }

  return (
    <section
      aria-labelledby="related-products-heading"
      className={className}
    >
      <div className="mt-10 rounded-xl border border-stone-200 bg-gradient-to-br from-amber-50 to-stone-50 p-6 dark:border-stone-800 dark:from-amber-950/20 dark:to-stone-900">
        <h3
          id="related-products-heading"
          className="mb-4 flex items-center gap-2 text-lg font-bold text-stone-900 dark:text-white"
        >
          <ShoppingBag className="h-5 w-5 text-amber-600" />
          Produk Berkaitan
        </h3>
        <p className="mb-6 text-sm text-stone-600 dark:text-stone-400">
          Lihat koleksi kain songket yang berkaitan dengan artikel ini
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group flex gap-4 rounded-lg border border-stone-200 bg-white p-3 transition-all hover:shadow-md dark:border-stone-700 dark:bg-stone-800"
            >
              <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="80px"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-stone-100 dark:bg-stone-700">
                    <ShoppingBag className="h-6 w-6 text-stone-400" />
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <h4 className="line-clamp-2 text-sm font-medium text-stone-900 transition-colors group-hover:text-amber-600 dark:text-white dark:group-hover:text-amber-400">
                  {product.title}
                </h4>
                <div className="mt-1 flex items-center gap-2">
                  {product.sale_price ? (
                    <>
                      <span className="text-sm font-bold text-amber-600">
                        {formatPrice(product.sale_price)}
                      </span>
                      <span className="text-xs text-stone-400 line-through">
                        {formatPrice(product.price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm font-bold text-amber-600">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-4 text-center">
          <Link
            href="/products"
            className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
          >
            Lihat semua produk
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}
