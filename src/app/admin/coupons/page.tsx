'use client'

import { useState, useEffect } from 'react'
import { getAdminCoupons, createCoupon, updateCoupon, deleteCoupon, type AdminCoupon } from '@/lib/supabase/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Search, Plus, Edit, Trash2, Tag, Calendar, Percent, DollarSign } from 'lucide-react'

interface CouponFormData {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  min_purchase: number
  max_discount: number
  usage_limit: number
  start_date: string
  end_date: string
  is_active: boolean
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<AdminCoupon | null>(null)
  const [formData, setFormData] = useState<CouponFormData>({
    code: '',
    type: 'percentage',
    value: 0,
    min_purchase: 0,
    max_discount: 0,
    usage_limit: 0,
    start_date: '',
    end_date: '',
    is_active: true
  })

  const limit = 20

  useEffect(() => {
    loadCoupons()
  }, [page, search])

  const loadCoupons = async () => {
    setLoading(true)
    try {
      const result = await getAdminCoupons(page, limit, search)
      setCoupons(result.coupons)
      setTotal(result.total)
    } catch (error) {
      console.error('Error loading coupons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setSearch(searchInput)
    setPage(1)
  }

  const handleCreateCoupon = () => {
    setEditingCoupon(null)
    setFormData({
      code: '',
      type: 'percentage',
      value: 0,
      min_purchase: 0,
      max_discount: 0,
      usage_limit: 0,
      start_date: '',
      end_date: '',
      is_active: true
    })
    setShowForm(true)
  }

  const handleEditCoupon = (coupon: AdminCoupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      min_purchase: coupon.min_purchase || 0,
      max_discount: coupon.max_discount || 0,
      usage_limit: coupon.usage_limit || 0,
      start_date: new Date(coupon.start_date).toISOString().split('T')[0],
      end_date: new Date(coupon.end_date).toISOString().split('T')[0],
      is_active: coupon.is_active ?? true
    })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const couponData = {
        ...formData,
        min_purchase: formData.min_purchase || undefined,
        max_discount: formData.max_discount || undefined,
        usage_limit: formData.usage_limit || undefined,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString()
      }

      let success = false
      if (editingCoupon) {
        success = await updateCoupon(editingCoupon.id, couponData)
      } else {
        success = await createCoupon(couponData)
      }

      if (success) {
        setShowForm(false)
        await loadCoupons()
        alert(editingCoupon ? 'Kupon berhasil diperbarui!' : 'Kupon berhasil dibuat!')
      } else {
        alert('Gagal menyimpan kupon')
      }
    } catch (error) {
      console.error('Error saving coupon:', error)
      alert('Terjadi kesalahan saat menyimpan kupon')
    }
  }

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus kupon ini?')) return

    try {
      const success = await deleteCoupon(couponId)
      if (success) {
        await loadCoupons()
        alert('Kupon berhasil dihapus!')
      } else {
        alert('Gagal menghapus kupon')
      }
    } catch (error) {
      console.error('Error deleting coupon:', error)
      alert('Terjadi kesalahan saat menghapus kupon')
    }
  }

  const totalPages = Math.ceil(total / limit)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (coupon: AdminCoupon) => {
    const now = new Date()
    const startDate = new Date(coupon.start_date)
    const endDate = new Date(coupon.end_date)

    if (!coupon.is_active) {
      return <Badge variant="secondary">Nonaktif</Badge>
    }

    if (now < startDate) {
      return <Badge className="bg-blue-100 text-blue-800">Belum Dimulai</Badge>
    }

    if (now > endDate) {
      return <Badge className="bg-red-100 text-red-800">Kedaluwarsa</Badge>
    }

    if (coupon.usage_limit && coupon.used_count !== null && coupon.used_count >= coupon.usage_limit) {
      return <Badge className="bg-orange-100 text-orange-800">Habis</Badge>
    }

    return <Badge className="bg-green-100 text-green-800">Aktif</Badge>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Kelola Kupon</h1>
        <Button onClick={handleCreateCoupon}>
          <Plus className="h-4 w-4 mr-2" />
          Buat Kupon
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-2">
            <Input
              placeholder="Cari kode kupon..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button onClick={handleSearch} variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Coupons List */}
      <Card>
        <CardHeader>
          <CardTitle>
            Daftar Kupon ({total} total)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Memuat kupon...</p>
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Tidak ada kupon ditemukan</p>
            </div>
          ) : (
            <div className="space-y-4">
              {coupons.map((coupon) => (
                <div
                  key={coupon.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg font-mono">
                          {coupon.code}
                        </h3>
                        {getStatusBadge(coupon)}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          {coupon.type === 'percentage' ? (
                            <Percent className="h-4 w-4 text-gray-400" />
                          ) : (
                            <DollarSign className="h-4 w-4 text-gray-400" />
                          )}
                          <div>
                            <span className="text-gray-600">Diskon:</span>
                            <br />
                            <span className="font-medium">
                              {coupon.type === 'percentage' 
                                ? `${coupon.value}%` 
                                : formatCurrency(coupon.value)
                              }
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <div>
                            <span className="text-gray-600">Periode:</span>
                            <br />
                            <span className="font-medium">
                              {formatDate(coupon.start_date)} - {formatDate(coupon.end_date)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-gray-400" />
                          <div>
                            <span className="text-gray-600">Penggunaan:</span>
                            <br />
                            <span className="font-medium">
                              {coupon.used_count ?? 0} / {coupon.usage_limit || '∞'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-400" />
                          <div>
                            <span className="text-gray-600">Min. Pembelian:</span>
                            <br />
                            <span className="font-medium">
                              {coupon.min_purchase ? formatCurrency(coupon.min_purchase) : 'Tidak ada'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCoupon(coupon)}
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCoupon(coupon.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
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

      {/* Coupon Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? 'Edit Kupon' : 'Buat Kupon Baru'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="code">Kode Kupon</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                placeholder="DISKON10"
                required
              />
            </div>

            <div>
              <Label htmlFor="type">Tipe Diskon</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'percentage' | 'fixed') => 
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Persentase (%)</SelectItem>
                  <SelectItem value="fixed">Nominal (IDR)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="value">
                Nilai Diskon {formData.type === 'percentage' ? '(%)' : '(IDR)'}
              </Label>
              <Input
                id="value"
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                min="0"
                step={formData.type === 'percentage' ? '1' : '1000'}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Tanggal Mulai</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_date">Tanggal Berakhir</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="min_purchase">Minimum Pembelian (IDR)</Label>
              <Input
                id="min_purchase"
                type="number"
                value={formData.min_purchase}
                onChange={(e) => setFormData({ ...formData, min_purchase: Number(e.target.value) })}
                min="0"
                step="1000"
              />
            </div>

            {formData.type === 'percentage' && (
              <div>
                <Label htmlFor="max_discount">Maksimum Diskon (IDR)</Label>
                <Input
                  id="max_discount"
                  type="number"
                  value={formData.max_discount}
                  onChange={(e) => setFormData({ ...formData, max_discount: Number(e.target.value) })}
                  min="0"
                  step="1000"
                />
              </div>
            )}

            <div>
              <Label htmlFor="usage_limit">Batas Penggunaan</Label>
              <Input
                id="usage_limit"
                type="number"
                value={formData.usage_limit}
                onChange={(e) => setFormData({ ...formData, usage_limit: Number(e.target.value) })}
                min="0"
                placeholder="0 = Tidak terbatas"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              />
              <Label htmlFor="is_active">Aktif</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1">
                {editingCoupon ? 'Perbarui' : 'Buat'} Kupon
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Batal
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}