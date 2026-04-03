import Link from 'next/link'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function BlogPostNotFound() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <FileQuestion className="h-24 w-24 text-stone-300 dark:text-stone-700" />
      
      <h1 className="mt-6 text-3xl font-bold text-stone-900 dark:text-white">
        Artikel Tidak Ditemukan
      </h1>
      
      <p className="mt-3 max-w-md text-lg text-stone-600 dark:text-stone-400">
        Maaf, artikel yang anda cari tidak wujud atau telah dialihkan.
      </p>
      
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/blog">
            Lihat Semua Artikel
          </Link>
        </Button>
        
        <Button variant="outline" asChild>
          <Link href="/">
            Kembali ke Beranda
          </Link>
        </Button>
      </div>
    </div>
  )
}
