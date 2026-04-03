'use client'

import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface BlogPaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  basePath: string
  className?: string
}

export function BlogPagination({
  currentPage,
  totalPages,
  totalItems,
  basePath,
  className,
}: BlogPaginationProps) {
  const getPageUrl = (page: number) => {
    const separator = basePath.includes('?') ? '&' : '?'
    return `${basePath}${separator}page=${page}`
  }

  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = []
    const showEllipsisStart = currentPage > 3
    const showEllipsisEnd = currentPage < totalPages - 2

    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    pages.push(1)

    if (showEllipsisStart) {
      pages.push('ellipsis')
    }

    const start = Math.max(2, currentPage - 1)
    const end = Math.min(totalPages - 1, currentPage + 1)

    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) {
        pages.push(i)
      }
    }

    if (showEllipsisEnd) {
      pages.push('ellipsis')
    }

    if (!pages.includes(totalPages)) {
      pages.push(totalPages)
    }

    return pages
  }

  const visiblePages = getVisiblePages()

  return (
    <nav 
      aria-label="Halaman artikel" 
      className={cn('mt-10 flex flex-col items-center gap-4', className)}
    >
      <p className="text-sm text-stone-600 dark:text-stone-400">
        Menunjukkan halaman <span className="font-medium">{currentPage}</span> dari{' '}
        <span className="font-medium">{totalPages}</span> ({totalItems} artikel)
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          asChild
          disabled={currentPage <= 1}
          className={cn(currentPage <= 1 && 'pointer-events-none opacity-50')}
          aria-label="Halaman sebelumnya"
        >
          <Link href={currentPage > 1 ? getPageUrl(currentPage - 1) : '#'}>
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>

        {visiblePages.map((page, index) =>
          page === 'ellipsis' ? (
            <span
              key={`ellipsis-${index}`}
              className="flex h-10 w-10 items-center justify-center text-stone-400"
              aria-hidden="true"
            >
              ...
            </span>
          ) : (
            <Button
              key={page}
              variant={currentPage === page ? 'default' : 'outline'}
              size="icon"
              asChild
              aria-current={currentPage === page ? 'page' : undefined}
              aria-label={`Halaman ${page}`}
            >
              <Link href={getPageUrl(page)}>{page}</Link>
            </Button>
          )
        )}

        <Button
          variant="outline"
          size="icon"
          asChild
          disabled={currentPage >= totalPages}
          className={cn(currentPage >= totalPages && 'pointer-events-none opacity-50')}
          aria-label="Halaman seterusnya"
        >
          <Link href={currentPage < totalPages ? getPageUrl(currentPage + 1) : '#'}>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </nav>
  )
}
