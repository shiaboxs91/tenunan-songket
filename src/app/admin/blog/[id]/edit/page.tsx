"use client"

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeft, 
  Save, 
  Send, 
  ImageIcon, 
  X, 
  Plus,
  Search,
  Loader2,
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
import { BlogEditor } from '@/components/admin/blog/BlogEditor'
import { compressImage } from '@/lib/image-compression'
import type { BlogCategory, BlogTag, BlogPost } from '@/lib/supabase/blog'

interface Product {
  id: string
  title: string
  slug: string
  price: number
  image_url?: string
}

interface EditBlogPostPageProps {
  params: Promise<{ id: string }>
}

export default function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [tags, setTags] = useState<BlogTag[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [productSearch, setProductSearch] = useState('')
  
  // Form state
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([])
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [canonicalUrl, setCanonicalUrl] = useState('')
  const [isFeatured, setIsFeatured] = useState(false)
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>('draft')

  useEffect(() => {
    loadData()
  }, [id])

  const loadData = async () => {
    setLoading(true)
    try {
      const [postRes, categoriesRes, tagsRes, productsRes] = await Promise.all([
        fetch(`/api/admin/blog/${id}`),
        fetch('/api/admin/blog/categories'),
        fetch('/api/admin/blog/tags'),
        fetch('/api/admin/products?limit=100')
      ])

      if (postRes.ok) {
        const post = await postRes.json()
        setTitle(post.title || '')
        setSlug(post.slug || '')
        setExcerpt(post.excerpt || '')
        setContent(post.content || '')
        setFeaturedImage(post.featured_image_url || '')
        setCategoryId(post.category_id || '')
        setSelectedTags(post.tag_ids || [])
        setMetaTitle(post.meta_title || '')
        setMetaDescription(post.meta_description || '')
        setCanonicalUrl(post.canonical_url || '')
        setIsFeatured(post.is_featured || false)
        setStatus(post.status || 'draft')
        
        // Load related products
        if (post.product_ids?.length) {
          const productsData = await fetch('/api/admin/products?limit=100').then(r => r.json())
          const relatedProducts = (productsData.products || productsData || [])
            .filter((p: Product) => post.product_ids.includes(p.id))
          setSelectedProducts(relatedProducts)
        }
      }

      if (categoriesRes.ok) {
        const data = await categoriesRes.json()
        setCategories(data || [])
      }

      if (tagsRes.ok) {
        const data = await tagsRes.json()
        setTags(data || [])
      }

      if (productsRes.ok) {
        const data = await productsRes.json()
        setProducts(data.products || data || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = useCallback((text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const originalFile = e.target.files?.[0]
    if (!originalFile) return

    const file = await compressImage(originalFile, 'blog')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'blog')

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const data = await res.json()
        setFeaturedImage(data.url)
      }
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const addProduct = (product: Product) => {
    if (!selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts(prev => [...prev, product])
    }
  }

  const removeProduct = (productId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.id !== productId))
  }

  const handleSave = async (newStatus?: 'draft' | 'published' | 'archived') => {
    if (!title.trim()) {
      alert('Judul artikel harus diisi')
      return
    }

    setSaving(true)

    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug: slug || generateSlug(title),
          excerpt,
          content,
          featured_image_url: featuredImage || null,
          category_id: categoryId || null,
          status: newStatus || status,
          meta_title: metaTitle || null,
          meta_description: metaDescription || null,
          canonical_url: canonicalUrl || null,
          is_featured: isFeatured,
          tag_ids: selectedTags,
          product_ids: selectedProducts.map(p => p.id)
        })
      })

      if (res.ok) {
        if (newStatus) setStatus(newStatus)
        alert('Artikel berhasil disimpan')
      } else {
        const error = await res.json()
        alert(error.message || 'Gagal menyimpan artikel')
      }
    } catch (error) {
      console.error('Error saving post:', error)
      alert('Gagal menyimpan artikel')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        router.push('/admin/blog')
      } else {
        alert('Gagal menghapus artikel')
      }
    } catch (error) {
      console.error('Error deleting post:', error)
      alert('Gagal menghapus artikel')
    }
  }

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(productSearch.toLowerCase())
  )

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto" />
          <p className="mt-2 text-muted-foreground">Memuat artikel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/blog">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Edit Artikel</h1>
            <p className="text-muted-foreground text-sm">
              {status === 'published' ? 'Dipublikasikan' : status === 'archived' ? 'Diarsipkan' : 'Draft'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleSave()}
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Simpan
          </Button>
          {status !== 'published' && (
            <Button 
              onClick={() => handleSave('published')}
              disabled={saving}
            >
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
              Publikasikan
            </Button>
          )}
          <Button 
            variant="destructive" 
            size="icon"
            onClick={() => setDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Judul Artikel</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Masukkan judul artikel..."
                    className="mt-1.5 text-lg font-medium"
                  />
                </div>
                <div>
                  <Label htmlFor="slug">Slug URL</Label>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-sm text-muted-foreground">/blog/</span>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(generateSlug(e.target.value))}
                      placeholder="url-artikel"
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Editor */}
          <Card>
            <CardHeader>
              <CardTitle>Konten</CardTitle>
            </CardHeader>
            <CardContent>
              <BlogEditor
                content={content}
                onChange={setContent}
                placeholder="Mulai menulis artikel..."
              />
            </CardContent>
          </Card>

          {/* Excerpt */}
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Tulis ringkasan singkat artikel (opsional)..."
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Ringkasan akan ditampilkan di halaman daftar blog dan hasil pencarian.
              </p>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="meta-title">Meta Title</Label>
                <Input
                  id="meta-title"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder={title || 'Judul untuk mesin pencari'}
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {metaTitle.length || title.length}/60 karakter
                </p>
              </div>
              <div>
                <Label htmlFor="meta-description">Meta Description</Label>
                <Textarea
                  id="meta-description"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  placeholder={excerpt || 'Deskripsi untuk mesin pencari'}
                  rows={2}
                  className="mt-1.5"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {metaDescription.length || excerpt.length}/160 karakter
                </p>
              </div>
              <div>
                <Label htmlFor="canonical-url">Canonical URL (opsional)</Label>
                <Input
                  id="canonical-url"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://example.com/original-article"
                  className="mt-1.5"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={status} onValueChange={(v: 'draft' | 'published' | 'archived') => setStatus(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Dipublikasikan</SelectItem>
                  <SelectItem value="archived">Diarsipkan</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Featured Image */}
          <Card>
            <CardHeader>
              <CardTitle>Gambar Utama</CardTitle>
            </CardHeader>
            <CardContent>
              {featuredImage ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100">
                  <Image
                    src={featuredImage}
                    alt="Featured"
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={() => setFeaturedImage('')}
                    className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed rounded-lg cursor-pointer hover:border-primary hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
                  <ImageIcon className="h-10 w-10 text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Klik untuk upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </CardContent>
          </Card>

          {/* Category */}
          <Card>
            <CardHeader>
              <CardTitle>Kategori</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
                {tags.length === 0 && (
                  <p className="text-sm text-muted-foreground">Belum ada tag</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Related Products */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Produk Terkait</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setProductDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Tambah
              </Button>
            </CardHeader>
            <CardContent>
              {selectedProducts.length > 0 ? (
                <div className="space-y-2">
                  {selectedProducts.map((product) => (
                    <div 
                      key={product.id} 
                      className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg"
                    >
                      <div className="w-10 h-10 relative bg-slate-200 rounded overflow-hidden flex-shrink-0">
                        {product.image_url && (
                          <Image
                            src={product.image_url}
                            alt={product.title}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.title}</p>
                        <p className="text-xs text-muted-foreground">{formatPrice(product.price)}</p>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => removeProduct(product.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Belum ada produk terkait
                </p>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="featured">Artikel Unggulan</Label>
                <Switch
                  id="featured"
                  checked={isFeatured}
                  onCheckedChange={setIsFeatured}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Product Selection Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Pilih Produk Terkait</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Cari produk..."
                className="pl-10"
              />
            </div>
            <div className="max-h-[300px] overflow-y-auto space-y-2">
              {filteredProducts.map((product) => {
                const isSelected = selectedProducts.some(p => p.id === product.id)
                return (
                  <div
                    key={product.id}
                    className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                      isSelected 
                        ? 'bg-primary/10 border border-primary' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent'
                    }`}
                    onClick={() => isSelected ? removeProduct(product.id) : addProduct(product)}
                  >
                    <div className="w-12 h-12 relative bg-slate-100 rounded overflow-hidden flex-shrink-0">
                      {product.image_url && (
                        <Image
                          src={product.image_url}
                          alt={product.title}
                          fill
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{product.title}</p>
                      <p className="text-sm text-muted-foreground">{formatPrice(product.price)}</p>
                    </div>
                    {isSelected && (
                      <Badge variant="default">Dipilih</Badge>
                    )}
                  </div>
                )
              })}
              {filteredProducts.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Tidak ada produk ditemukan
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Artikel?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Artikel akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
