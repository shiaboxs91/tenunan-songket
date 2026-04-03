'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

interface Category {
  id: string
  name: string
  slug: string
}

interface BlogCategoryTabsProps {
  categories: Category[]
  activeCategory?: string
  className?: string
}

export function BlogCategoryTabs({ 
  categories, 
  activeCategory,
  className 
}: BlogCategoryTabsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCategoryChange = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (slug) {
      params.set('category', slug)
    } else {
      params.delete('category')
    }
    
    params.delete('page')
    router.push(`/blog?${params.toString()}`)
  }

  return (
    <nav 
      aria-label="Kategori artikel"
      className={cn(
        'flex overflow-x-auto scrollbar-hide border-b border-stone-200 dark:border-stone-800',
        className
      )}
    >
      <div className="flex min-w-full gap-1 pb-px sm:gap-2">
        <button
          onClick={() => handleCategoryChange(null)}
          className={cn(
            'flex-shrink-0 whitespace-nowrap rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors',
            'hover:bg-stone-100 dark:hover:bg-stone-800',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2',
            !activeCategory
              ? 'border-b-2 border-amber-600 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
              : 'text-stone-600 dark:text-stone-400'
          )}
          aria-current={!activeCategory ? 'page' : undefined}
        >
          Semua
        </button>

        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryChange(category.slug)}
            className={cn(
              'flex-shrink-0 whitespace-nowrap rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors',
              'hover:bg-stone-100 dark:hover:bg-stone-800',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2',
              activeCategory === category.slug
                ? 'border-b-2 border-amber-600 bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400'
                : 'text-stone-600 dark:text-stone-400'
            )}
            aria-current={activeCategory === category.slug ? 'page' : undefined}
          >
            {category.name}
          </button>
        ))}
      </div>
    </nav>
  )
}
