"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ArrowLeft, Upload, X, Trash2, Loader2, Star, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { createProduct, updateProduct, deleteProduct, type Product } from '@/lib/supabase/products-client'
import { getCategories, type Category } from '@/lib/supabase/categories-client'
import { getColorsClient, getProductColorsClient, setProductColors } from '@/lib/supabase/colors.client'
import { uploadFile, generateFilePath, deleteFile } from '@/lib/supabase/storage'
import { createClient } from '@/lib/supabase/client'
import type { Color } from '@/lib/supabase/types'

interface ProductImage {
  id?: string
  url: string
  is_primary: boolean
  display_order: number
}

interface ProductFormProps {
  product?: Product
}

interface ProductFormData {
  title: string
  slug: string
  description: string
  price: string
  sale_price: string
  stock: string
  weight: string
  category_id: string
  is_active: boolean
  meta_title: string
  meta_description: string
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [colors, setColors] = useState<Color[]>([])
  const [selectedColorIds, setSelectedColorIds] = useState<string[]>([])
  const [primaryColorId, setPrimaryColorId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [images, setImages] = useState<ProductImage[]>(
    product?.images?.map((img, idx) => ({
      id: img.id,
      url: img.url,
      is_primary: img.is_primary ?? idx === 0,
      display_order: img.display_order ?? idx
    })) || []
  )
  const [formData, setFormData] = useState<ProductFormData>({
    title: product?.title || '',
    slug: product?.slug || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    sale_price: product?.sale_price?.toString() || '',
    stock: product?.stock?.toString() || '0',
    weight: product?.weight?.toString() || '0',
    category_id: product?.category_id || '',
    is_active: product?.is_active ?? true,
    meta_title: product?.meta_title || '',
    meta_description: product?.meta_description || ''
  })

  useEffect(() => {
    loadCategories()
    loadColors()
    if (product) {
      loadProductColors()
    }
  }, [])

  const loadProductColors = async () => {
    if (!product) return
    try {
      const productColors = await getProductColorsClient(product.id)
      const colorIds = productColors.map(pc => pc.color_id)
      setSelectedColorIds(colorIds)
      const primary = productColors.find(pc => pc.is_primary)
      if (primary) {
        setPrimaryColorId(primary.color_id)
      }
    } catch (error) {
      console.error('Error loading product colors:', error)
    }
  }

  const loadColors = async () => {
    try {
      const data = await getColorsClient()
      setColors(data)
    } catch (error) {
      console.error('Error loading colors:', error)
    }
  }

  const toggleColor = (colorId: string) => {
    setSelectedColorIds(prev => {
      if (prev.includes(colorId)) {
        // Remove color
        const newIds = prev.filter(id => id !== colorId)
        // If removed color was primary, clear primary
        if (primaryColorId === colorId) {
          setPrimaryColorId(newIds.length > 0 ? newIds[0] : null)
        }
        return newIds
      } else {
        // Add color
        const newIds = [...prev, colorId]
        // If no primary set, make this the primary
        if (!primaryColorId) {
          setPrimaryColorId(colorId)
        }
        return newIds
      }
    })
  }

  const handleSetPrimaryColor = (colorId: string) => {
    if (selectedColorIds.includes(colorId)) {
      setPrimaryColorId(colorId)
    }
  }

const loadCategories = async () => {
    try {
      const data = await getCategories()
      setCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast.error('Anda harus login untuk upload gambar')
      setUploading(false)
      return
    }

    try {
      const newImages: ProductImage[] = []
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const filePath = generateFilePath(user.id, file.name, 'products')
        
        const result = await uploadFile({
          bucket: 'products',
          path: filePath,
          file,
          upsert: false
        })

        if (result.success && result.url) {
          newImages.push({
            url: result.url,
            is_primary: images.length === 0 && i === 0,
            display_order: images.length + i
          })
        } else {
          toast.error(`Gagal upload ${file.name}: ${result.error}`)
        }
      }

      if (newImages.length > 0) {
        setImages(prev => [...prev, ...newImages])
        toast.success(`${newImages.length} gambar berhasil diupload`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Gagal upload gambar')
    } finally {
      setUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemoveImage = async (index: number) => {
    const imageToRemove = images[index]
    
    // Try to delete from storage if it's a new upload (no id means not saved to DB yet)
    if (!imageToRemove.id && imageToRemove.url.includes('supabase')) {
      try {
        const urlParts = imageToRemove.url.split('/products/')
        if (urlParts[1]) {
          await deleteFile('products', urlParts[1])
        }
      } catch (error) {
        console.error('Error deleting file from storage:', error)
      }
    }

    setImages(prev => {
      const newImages = prev.filter((_, i) => i !== index)
      // If removed image was primary, set first remaining as primary
      if (imageToRemove.is_primary && newImages.length > 0) {
        newImages[0].is_primary = true
      }
      return newImages.map((img, i) => ({ ...img, display_order: i }))
    })
  }

  const handleSetPrimary = (index: number) => {
    setImages(prev => prev.map((img, i) => ({
      ...img,
      is_primary: i === index
    })))
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleTitleChange = (title: string) => {
    setFormData(prev => ({
      ...prev,
      title,
      slug: product ? prev.slug : generateSlug(title)
    }))
  }

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const productData = {
        title: formData.title,
        slug: formData.slug,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
        stock: parseInt(formData.stock) || 0,
        weight: parseFloat(formData.weight) || 0,
        category_id: formData.category_id || null,
        is_active: formData.is_active,
        meta_title: formData.meta_title || null,
        meta_description: formData.meta_description || null,
        images: images.map((img, idx) => ({
          url: img.url,
          is_primary: img.is_primary,
          display_order: idx
        }))
      }

      let savedProductId: string

      if (product) {
        await updateProduct(product.id, productData)
        savedProductId = product.id
        toast.success('Produk berhasil diperbarui')
      } else {
        const newProduct = await createProduct(productData)
        savedProductId = newProduct.id
        toast.success('Produk berhasil ditambahkan')
      }

      // Save product colors
      if (selectedColorIds.length > 0) {
        await setProductColors(savedProductId, selectedColorIds, primaryColorId || undefined)
      } else if (product) {
        // Clear colors if none selected (only for existing products)
        await setProductColors(savedProductId, [], undefined)
      }

      router.push('/admin/products')
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error('Gagal menyimpan produk. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!product) return
    
    setDeleting(true)
    try {
      await deleteProduct(product.id)
      toast.success('Produk berhasil dihapus')
      router.push('/admin/products')
    } catch (error) {
      console.error('Error deleting product:', error)
      toast.error('Gagal menghapus produk. Silakan coba lagi.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Kembali
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Produk</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Nama Produk *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Masukkan nama produk"
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="produk-slug"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Deskripsi produk"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Harga & Stok</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Harga (IDR) *</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="0"
                    min="0"
                    step="1000"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="sale_price">Harga Diskon (IDR)</Label>
                  <Input
                    id="sale_price"
                    type="number"
                    value={formData.sale_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, sale_price: e.target.value }))}
                    placeholder="0"
                    min="0"
                    step="1000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stock">Stok</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                    placeholder="0"
                    min="0"
                  />
                </div>

                <div>
                  <Label htmlFor="weight">Berat (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                    placeholder="0"
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="meta_title">Meta Title</Label>
                <Input
                  id="meta_title"
                  value={formData.meta_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
                  placeholder="SEO title"
                />
              </div>

              <div>
                <Label htmlFor="meta_description">Meta Description</Label>
                <Textarea
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
                  placeholder="SEO description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
<Card>
            <CardHeader>
              <CardTitle>Pengaturan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category">Kategori</Label>
                <Select
                  value={formData.category_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category_id: value }))}
                >
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
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, is_active: checked as boolean }))
                  }
                />
                <Label htmlFor="is_active">Produk Aktif</Label>
              </div>
            </CardContent>
          </Card>

          {/* Color Selection Card */}
          <Card>
            <CardHeader>
              <CardTitle>Warna Produk</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Pilih warna yang ada pada produk ini
              </p>
              
              {/* Selected Colors */}
              {selectedColorIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedColorIds.map(colorId => {
                    const color = colors.find(c => c.id === colorId)
                    if (!color) return null
                    return (
                      <Badge 
                        key={colorId} 
                        variant={primaryColorId === colorId ? "default" : "secondary"}
                        className="flex items-center gap-1.5 pr-1 cursor-pointer"
                        onClick={() => handleSetPrimaryColor(colorId)}
                      >
                        <span 
                          className="w-3 h-3 rounded-full border border-white/30"
                          style={{ backgroundColor: color.hex_code || '#ccc' }}
                        />
                        {color.name}
                        {primaryColorId === colorId && (
                          <Star className="h-3 w-3 ml-1 fill-current" />
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleColor(colorId)
                          }}
                          className="ml-1 p-0.5 hover:bg-black/20 rounded"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )
                  })}
                </div>
              )}

              {/* Color Grid */}
              <div className="grid grid-cols-5 gap-2">
                {colors.map(color => {
                  const isSelected = selectedColorIds.includes(color.id)
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => toggleColor(color.id)}
                      className={`
                        relative w-full aspect-square rounded-lg border-2 transition-all
                        ${isSelected 
                          ? 'border-primary ring-2 ring-primary/30' 
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-400'
                        }
                      `}
                      style={{ backgroundColor: color.hex_code || '#ccc' }}
                      title={color.name}
                    >
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                          <Check className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {selectedColorIds.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Klik badge warna untuk set sebagai warna utama
                </p>
              )}
            </CardContent>
          </Card>

<Card>
            <CardHeader>
              <CardTitle>Gambar Produk</CardTitle>
            </CardHeader>
            <CardContent>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={handleImageUpload}
              />
              <div 
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Mengupload gambar...
                    </p>
                  </>
                ) : (
                  <>
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <p className="mt-2 text-sm text-muted-foreground">
                      Klik untuk upload gambar
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG, WEBP hingga 5MB
                    </p>
                  </>
                )}
              </div>
              
              {images.length > 0 && (
                <div className="mt-4 space-y-2">
                  <Label>Gambar ({images.length}):</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {images.map((image, index) => (
                      <div key={index} className="relative aspect-square bg-muted rounded-lg overflow-hidden group">
                        <Image
                          src={image.url}
                          alt={`Product image ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="150px"
                        />
                        {image.is_primary && (
                          <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            Utama
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {!image.is_primary && (
                            <Button
                              type="button"
                              size="sm"
                              variant="secondary"
                              onClick={() => handleSetPrimary(index)}
                            >
                              <Star className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="sm"
                            variant="destructive"
                            onClick={() => handleRemoveImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Menyimpan...' : (product ? 'Update Produk' : 'Simpan Produk')}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={() => router.back()}
            >
              Batal
            </Button>
            
            {/* Tombol Hapus - hanya tampil saat edit */}
            {product && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    type="button" 
                    variant="destructive" 
                    className="w-full"
                    disabled={deleting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deleting ? 'Menghapus...' : 'Hapus Produk'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Hapus Produk?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Apakah Anda yakin ingin menghapus produk &quot;{product.title}&quot;? 
                      Tindakan ini tidak dapat dibatalkan.
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
            )}
          </div>
        </div>
      </div>
    </form>
  )
}