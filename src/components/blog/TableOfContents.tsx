'use client'

import { useState, useEffect, useCallback } from 'react'
import { ChevronDown, List } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TocItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
  className?: string
}

function extractHeadings(content: string): TocItem[] {
  const headings: TocItem[] = []
  const regex = /<h([23])[^>]*id="([^"]*)"[^>]*>([^<]*)<\/h[23]>/gi
  let match

  while ((match = regex.exec(content)) !== null) {
    headings.push({
      level: parseInt(match[1], 10),
      id: match[2],
      text: match[3].trim(),
    })
  }

  if (headings.length === 0) {
    const altRegex = /<h([23])[^>]*>([^<]*)<\/h[23]>/gi
    let index = 0
    while ((match = altRegex.exec(content)) !== null) {
      const text = match[2].trim()
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-') || `heading-${index}`
      
      headings.push({
        level: parseInt(match[1], 10),
        id,
        text,
      })
      index++
    }
  }

  return headings
}

export function TableOfContents({ content, className }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const extracted = extractHeadings(content)
    setHeadings(extracted)
  }, [content])

  const handleScroll = useCallback(() => {
    if (!headings.length) return

    const scrollPosition = window.scrollY + 120

    for (let i = headings.length - 1; i >= 0; i--) {
      const element = document.getElementById(headings[i].id)
      if (element && element.offsetTop <= scrollPosition) {
        setActiveId(headings[i].id)
        return
      }
    }

    setActiveId(headings[0]?.id || '')
  }, [headings])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.scrollY - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
      setIsExpanded(false)
    }
  }

  if (!headings.length) return null

  return (
    <nav
      className={cn(
        'rounded-xl border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900',
        className
      )}
      aria-label="Daftar Isi"
    >
      {/* Mobile: collapsible */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'flex w-full items-center justify-between p-4',
            'text-left text-sm font-semibold text-stone-900 dark:text-white',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-500'
          )}
          aria-expanded={isExpanded}
        >
          <span className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Daftar Isi
          </span>
          <ChevronDown
            className={cn(
              'h-4 w-4 transition-transform duration-200',
              isExpanded && 'rotate-180'
            )}
          />
        </button>

        <div
          className={cn(
            'overflow-hidden transition-all duration-200',
            isExpanded ? 'max-h-96' : 'max-h-0'
          )}
        >
          <ul className="space-y-1 border-t border-stone-200 p-4 dark:border-stone-800">
            {headings.map((heading) => (
              <li key={heading.id}>
                <button
                  onClick={() => scrollToHeading(heading.id)}
                  className={cn(
                    'block w-full rounded-md px-3 py-2 text-left text-sm transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500',
                    heading.level === 3 && 'pl-6',
                    activeId === heading.id
                      ? 'bg-amber-50 font-medium text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-800 dark:hover:text-white'
                  )}
                >
                  {heading.text}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Desktop: sticky sidebar */}
      <div className="hidden lg:block">
        <div className="sticky top-24 p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-stone-900 dark:text-white">
            <List className="h-4 w-4" />
            Daftar Isi
          </h3>

          <ul className="space-y-1 border-l-2 border-stone-200 dark:border-stone-700">
            {headings.map((heading) => (
              <li key={heading.id}>
                <button
                  onClick={() => scrollToHeading(heading.id)}
                  className={cn(
                    'block w-full -ml-0.5 border-l-2 py-1.5 text-left text-sm transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2',
                    heading.level === 2 ? 'pl-4' : 'pl-7',
                    activeId === heading.id
                      ? 'border-amber-500 font-medium text-amber-700 dark:text-amber-400'
                      : 'border-transparent text-stone-600 hover:border-stone-300 hover:text-stone-900 dark:text-stone-400 dark:hover:border-stone-600 dark:hover:text-white'
                  )}
                >
                  {heading.text}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  )
}
