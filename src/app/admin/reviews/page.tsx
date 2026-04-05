'use client'

import { useState, useEffect } from 'react'
import { getAllReviews, updateReviewStatus, deleteReview, type Review } from '@/lib/supabase/reviews'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Star, MessageSquare, CheckCircle, XCircle, Trash2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

type ReviewWithProduct = Review & { product?: { id: string; title: string; slug: string } }

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewWithProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filter, setFilter] = useState<'all' | 'published' | 'pending'>('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const limit = 20

  useEffect(() => {
    loadReviews()
  }, [page, filter])

  const loadReviews = async () => {
    setLoading(true)
    try {
      const result = await getAllReviews(page, limit, filter)
      setReviews(result.data as ReviewWithProduct[])
      setTotal(result.total)
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (reviewId: string, publish: boolean) => {
    setActionLoading(reviewId)
    const success = await updateReviewStatus(reviewId, publish)
    if (success) {
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, is_published: publish } : r))
    }
    setActionLoading(null)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setActionLoading(deleteId)
    const success = await deleteReview(deleteId)
    if (success) {
      setReviews(prev => prev.filter(r => r.id !== deleteId))
      setTotal(prev => prev - 1)
    }
    setActionLoading(null)
    setDeleteId(null)
  }

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter as 'all' | 'published' | 'pending')
    setPage(1)
  }

  const totalPages = Math.ceil(total / limit)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Kelola Ulasan</h1>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">
                {total} ulasan ditemukan
              </p>
            </div>
            <Select value={filter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Ulasan</SelectItem>
                <SelectItem value="published">Dipublikasi</SelectItem>
                <SelectItem value="pending">Menunggu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Ulasan ({total} total)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Memuat ulasan...</p>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Tidak ada ulasan ditemukan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  <div className="flex flex-col gap-3">
                    {/* Header row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        {renderStars(review.rating)}
                        <Badge variant={review.is_published ? 'default' : 'secondary'}>
                          {review.is_published ? 'Dipublikasi' : 'Menunggu'}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(review.created_at)}
                      </span>
                    </div>

                    {/* Product info */}
                    <div className="text-sm">
                      <span className="text-muted-foreground">Produk: </span>
                      {review.product ? (
                        <Link
                          href={`/admin/products`}
                          className="font-medium hover:underline"
                        >
                          {review.product.title}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">Produk tidak ditemukan</span>
                      )}
                    </div>

                    {/* Reviewer info */}
                    <div className="text-sm">
                      <span className="text-muted-foreground">Oleh: </span>
                      <span className="font-medium">
                        {review.profile?.full_name || 'Anonim'}
                      </span>
                    </div>

                    {/* Review text */}
                    {review.review_text && (
                      <p className="text-sm bg-muted/50 rounded-md p-3">
                        {review.review_text}
                      </p>
                    )}

                    {/* Review images */}
                    {review.images && Array.isArray(review.images) && review.images.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {(review.images as string[]).map((img, idx) => (
                          <a
                            key={idx}
                            href={img}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block"
                          >
                            <Image
                              src={img}
                              alt={`Review image ${idx + 1}`}
                              width={80}
                              height={80}
                              className="rounded-md object-cover h-20 w-20 border hover:opacity-80 transition-opacity"
                            />
                          </a>
                        ))}
                      </div>
                    )}

                    {/* Helpful count */}
                    <div className="text-xs text-muted-foreground">
                      {review.helpful_count || 0} orang merasa terbantu
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2 border-t">
                      {review.is_published ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(review.id, false)}
                          disabled={actionLoading === review.id}
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Sembunyikan
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(review.id, true)}
                          disabled={actionLoading === review.id}
                        >
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Publikasi
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteId(review.id)}
                        disabled={actionLoading === review.id}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Sebelumnya
              </Button>
              <span className="text-sm text-gray-600">
                Halaman {page} dari {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Selanjutnya
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Ulasan?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus ulasan ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
