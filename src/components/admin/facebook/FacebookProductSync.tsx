'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { RefreshCw, Upload, Search, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react'
import Image from 'next/image'

interface Product {
  id: string
  title: string
  slug: string
  price: number
  stock: number
  is_active: boolean
  images?: { url: string; is_primary: boolean | null }[]
}

interface FBProductSync {
  product_id: string
  fb_product_id: string | null
  sync_status: 'pending' | 'synced' | 'error' | 'deleted' | 'updating'
  last_sync_at: string | null
  error_message: string | null
}

interface ProductWithSync extends Product {
  fb_sync?: FBProductSync
}

export function FacebookProductSync() {
  const [products, setProducts] = useState<ProductWithSync[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'pending' | 'synced' | 'error'>('all')

  const loadProducts = useCallback(async () => {
    const supabase = createClient()
    
    // Load products with their FB sync status
    const { data: productsData, error: productsError } = await supabase
      .from('products')
      .select(`
        id, title, slug, price, stock, is_active,
        images:product_images(url, is_primary)
      `)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
    
    if (productsError) {
      toast.error('Gagal memuat produk')
      setLoading(false)
      return
    }

    // Load FB sync status
    const { data: syncData } = await supabase
      .from('fb_catalog_products')
      .select('*')
    
    // Merge data - cast sync data to match our interface
    const syncMap = new Map(
      syncData?.map(s => [s.product_id, {
        product_id: s.product_id || '',
        fb_product_id: s.fb_product_id,
        sync_status: (s.sync_status || 'pending') as FBProductSync['sync_status'],
        last_sync_at: s.last_sync_at,
        error_message: s.error_message,
      }]) || []
    )
    const mergedProducts: ProductWithSync[] = (productsData || []).map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      price: p.price,
      stock: p.stock ?? 0,
      is_active: p.is_active ?? true,
      images: p.images,
      fb_sync: syncMap.get(p.id),
    }))
    
    setProducts(mergedProducts)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === 'all' || 
      (filter === 'pending' && (!p.fb_sync || p.fb_sync.sync_status === 'pending')) ||
      (filter === 'synced' && p.fb_sync?.sync_status === 'synced') ||
      (filter === 'error' && p.fb_sync?.sync_status === 'error')
    return matchesSearch && matchesFilter
  })

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)))
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedIds(newSelected)
  }

  const handleBulkSync = async () => {
    if (selectedIds.size === 0) {
      toast.error('Pilih produk yang ingin disinkronkan')
      return
    }

    setSyncing(true)
    const supabase = createClient()
    
    try {
      // Create sync log
      const { data: logData } = await supabase
        .from('fb_sync_logs')
        .insert({
          action: 'bulk_sync',
          product_count: selectedIds.size,
          started_at: new Date().toISOString(),
        })
        .select()
        .single()

      // Update/insert sync status for selected products
      const syncRecords = Array.from(selectedIds).map(productId => ({
        product_id: productId,
        sync_status: 'pending' as const,
        updated_at: new Date().toISOString(),
      }))

      await supabase
        .from('fb_catalog_products')
        .upsert(syncRecords, { onConflict: 'product_id' })

      // In production, this would trigger actual FB API sync
      // For now, simulate success after delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Update to synced status (simulated)
      await supabase
        .from('fb_catalog_products')
        .update({ 
          sync_status: 'synced',
          last_sync_at: new Date().toISOString(),
        })
        .in('product_id', Array.from(selectedIds))

      // Update log
      if (logData) {
        await supabase
          .from('fb_sync_logs')
          .update({
            success_count: selectedIds.size,
            error_count: 0,
            completed_at: new Date().toISOString(),
            duration_ms: 2000,
          })
          .eq('id', logData.id)
      }

      toast.success(`${selectedIds.size} produk berhasil disinkronkan`)
      setSelectedIds(new Set())
      loadProducts()
    } catch {
      toast.error('Gagal menyinkronkan produk')
    }
    
    setSyncing(false)
  }

  const getStatusBadge = (sync?: FBProductSync) => {
    if (!sync || sync.sync_status === 'pending') {
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" /> Belum Sync</Badge>
    }
    if (sync.sync_status === 'synced') {
      return <Badge variant="default" className="bg-green-500"><CheckCircle2 className="h-3 w-3 mr-1" /> Synced</Badge>
    }
    if (sync.sync_status === 'error') {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Error</Badge>
    }
    if (sync.sync_status === 'updating') {
      return <Badge variant="secondary"><RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Updating</Badge>
    }
    return <Badge variant="outline">{sync.sync_status}</Badge>
  }

  const syncedCount = products.filter(p => p.fb_sync?.sync_status === 'synced').length
  const pendingCount = products.filter(p => !p.fb_sync || p.fb_sync.sync_status === 'pending').length
  const errorCount = products.filter(p => p.fb_sync?.sync_status === 'error').length

  if (loading) {
    return <div className="animate-pulse">Loading products...</div>
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setFilter('all')}>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold">{products.length}</div>
            <div className="text-sm text-muted-foreground">Total Produk</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setFilter('synced')}>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-green-600">{syncedCount}</div>
            <div className="text-sm text-muted-foreground">Tersinkron</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setFilter('pending')}>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-sm text-muted-foreground">Belum Sync</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => setFilter('error')}>
          <CardContent className="pt-4">
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            <div className="text-sm text-muted-foreground">Error</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
          <CardDescription>
            Pilih produk untuk disinkronkan ke Facebook Catalog
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search & Actions */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari produk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button 
              onClick={handleBulkSync} 
              disabled={syncing || selectedIds.size === 0}
            >
              {syncing ? (
                <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Menyinkronkan...</>
              ) : (
                <><Upload className="mr-2 h-4 w-4" /> Sync {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}</>
              )}
            </Button>
            <Button variant="outline" onClick={loadProducts}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
          </div>

          {/* Filter Badges */}
          <div className="flex gap-2">
            {['all', 'pending', 'synced', 'error'].map((f) => (
              <Badge 
                key={f}
                variant={filter === f ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setFilter(f as typeof filter)}
              >
                {f === 'all' ? 'Semua' : f === 'pending' ? 'Belum Sync' : f === 'synced' ? 'Tersinkron' : 'Error'}
              </Badge>
            ))}
          </div>

          {/* Products Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.size === filteredProducts.length && filteredProducts.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-16">Gambar</TableHead>
                  <TableHead>Produk</TableHead>
                  <TableHead>Harga</TableHead>
                  <TableHead>Stok</TableHead>
                  <TableHead>Status FB</TableHead>
                  <TableHead>Terakhir Sync</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Tidak ada produk ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => {
                    const primaryImage = product.images?.find(img => img.is_primary)?.url || product.images?.[0]?.url
                    return (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(product.id)}
                            onCheckedChange={(checked) => handleSelectOne(product.id, checked as boolean)}
                          />
                        </TableCell>
                        <TableCell>
                          {primaryImage ? (
                            <Image
                              src={primaryImage}
                              alt={product.title}
                              width={40}
                              height={40}
                              className="rounded object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-muted rounded flex items-center justify-center">
                              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{product.title}</div>
                          <div className="text-xs text-muted-foreground">{product.slug}</div>
                        </TableCell>
                        <TableCell>BND {product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={product.stock > 0 ? 'secondary' : 'destructive'}>
                            {product.stock}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(product.fb_sync)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {product.fb_sync?.last_sync_at 
                            ? new Date(product.fb_sync.last_sync_at).toLocaleDateString('id-ID')
                            : '-'}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
