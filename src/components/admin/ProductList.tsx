"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Edit, Eye, Search, LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getProductsClient, type Product } from '@/lib/supabase/products-client'
import { getCategories, type Category } from '@/lib/supabase/categories-client'

type ViewMode = 'grid' | 'list'

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProductsClient({ includeInactive: true }),
        getCategories()
      ])
      
      setProducts(productsData)
      setCategories(categoriesData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.slug.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = selectedCategory === 'all' || 
                           product.category_id === selectedCategory
    
    const matchesStatus = statusFilter === 'all' ||
                         (statusFilter === 'active' && product.is_active && !product.is_deleted) ||
                         (statusFilter === 'inactive' && (!product.is_active || product.is_deleted))
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Memuat produk...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari produk..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-9"
                />
              </div>
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-40 h-9">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-28 h-9">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua</SelectItem>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Tidak Aktif</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                className="h-9 px-3 rounded-r-none"
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="h-9 px-3 rounded-l-none"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Count */}
      <div className="text-sm text-muted-foreground">
        {filteredProducts.length} produk ditemukan
      </div>

      {/* Products */}
      {filteredProducts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Tidak ada produk ditemukan</p>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        /* Grid View - Smaller cards, more columns */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredProducts.map((product) => {
            const primaryImage = product.images?.find(img => img.is_primary)?.url || 
                                product.images?.[0]?.url
            const category = categories.find(c => c.id === product.category_id)
            
            return (
              <Card key={product.id} className="overflow-hidden group">
                <div className="aspect-square relative bg-muted">
                  {primaryImage ? (
                    <Image
                      src={primaryImage}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-xs text-muted-foreground">No Image</span>
                    </div>
                  )}
                  {/* Status Badge Overlay */}
                  <div className="absolute top-1 right-1">
                    {product.is_active && !product.is_deleted ? (
                      <Badge variant="default" className="text-[10px] px-1.5 py-0">Aktif</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Off</Badge>
                    )}
                  </div>
                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button asChild size="sm" variant="secondary" className="h-7 px-2" title="Edit">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Edit className="h-3 w-3" />
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="secondary" className="h-7 px-2" title="Lihat Detail">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Eye className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
                
                <CardContent className="p-2">
                  <h3 className="text-xs font-medium line-clamp-2 leading-tight mb-1">{product.title}</h3>
                  <p className="text-xs font-semibold text-primary">{formatPrice(Number(product.price))}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground">{category?.name || '-'}</span>
                    <span className="text-[10px] text-muted-foreground">Stok: {product.stock}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        /* List View */
        <Card>
          <div className="divide-y">
            {filteredProducts.map((product) => {
              const primaryImage = product.images?.find(img => img.is_primary)?.url || 
                                  product.images?.[0]?.url
              const category = categories.find(c => c.id === product.category_id)
              
              return (
                <div key={product.id} className="flex items-center gap-4 p-3 hover:bg-muted/50">
                  {/* Image */}
                  <div className="w-14 h-14 relative bg-muted rounded flex-shrink-0">
                    {primaryImage ? (
                      <Image
                        src={primaryImage}
                        alt={product.title}
                        fill
                        className="object-cover rounded"
                        sizes="56px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <span className="text-[10px] text-muted-foreground">No Img</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium truncate">{product.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{category?.name || '-'}</span>
                      <span>•</span>
                      <span>Stok: {product.stock}</span>
                    </div>
                  </div>
                  
                  {/* Price */}
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatPrice(Number(product.price))}</p>
                    {product.sale_price && (
                      <p className="text-xs text-muted-foreground line-through">
                        {formatPrice(Number(product.sale_price))}
                      </p>
                    )}
                  </div>
                  
                  {/* Status */}
                  <div className="w-16 text-center">
                    {product.is_active && !product.is_deleted ? (
                      <Badge variant="default" className="text-xs">Aktif</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Off</Badge>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex gap-1">
                    <Button asChild size="sm" variant="ghost" className="h-8 w-8 p-0" title="Edit">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="ghost" className="h-8 w-8 p-0" title="Lihat Detail">
                      <Link href={`/admin/products/${product.id}/edit`}>
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}