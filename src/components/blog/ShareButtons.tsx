'use client'

import { useState } from 'react'
import { Facebook, Twitter, LinkIcon, Check, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ShareButtonsProps {
  url: string
  title: string
  description?: string
  className?: string
}

export function ShareButtons({ url, title, description = '', className }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const encodedUrl = encodeURIComponent(url)
  const encodedTitle = encodeURIComponent(title)
  const encodedDescription = encodeURIComponent(description)

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const textArea = document.createElement('textarea')
      textArea.value = url
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const buttonBaseStyles = cn(
    'flex items-center justify-center rounded-full transition-all duration-200',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2'
  )

  const iconButtonStyles = cn(
    buttonBaseStyles,
    'h-10 w-10 border border-stone-200 bg-white text-stone-600',
    'hover:border-stone-300 hover:bg-stone-50 hover:text-stone-900',
    'dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400',
    'dark:hover:border-stone-600 dark:hover:bg-stone-700 dark:hover:text-white'
  )

  return (
    <div
      className={cn(
        'flex items-center gap-2',
        'flex-row md:flex-col',
        className
      )}
    >
      <span className="sr-only">Bagikan artikel ini</span>
      
      <a
        href={shareLinks.whatsapp}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(iconButtonStyles, 'hover:border-green-500 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20 dark:hover:text-green-400')}
        aria-label="Bagikan ke WhatsApp"
      >
        <MessageCircle className="h-5 w-5" />
      </a>

      <a
        href={shareLinks.facebook}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(iconButtonStyles, 'hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400')}
        aria-label="Bagikan ke Facebook"
      >
        <Facebook className="h-5 w-5" />
      </a>

      <a
        href={shareLinks.twitter}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(iconButtonStyles, 'hover:border-sky-500 hover:bg-sky-50 hover:text-sky-600 dark:hover:bg-sky-900/20 dark:hover:text-sky-400')}
        aria-label="Bagikan ke Twitter/X"
      >
        <Twitter className="h-5 w-5" />
      </a>

      <button
        onClick={handleCopyLink}
        className={cn(
          iconButtonStyles,
          copied && 'border-green-500 bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
        )}
        aria-label={copied ? 'Link tersalin!' : 'Salin link'}
      >
        {copied ? (
          <Check className="h-5 w-5" />
        ) : (
          <LinkIcon className="h-5 w-5" />
        )}
      </button>

      {copied && (
        <span
          className={cn(
            'absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-stone-900 px-2 py-1 text-xs text-white',
            'md:-right-20 md:bottom-auto md:left-auto md:translate-x-0',
            'dark:bg-stone-700'
          )}
          role="status"
          aria-live="polite"
        >
          Link tersalin!
        </span>
      )}
    </div>
  )
}
