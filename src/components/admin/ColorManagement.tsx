"use client"

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, GripVertical, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { toast } from 'sonner'
import { 
  getAllColorsClient, 
  createColor, 
  updateColor, 
  deleteColor,
  reorderColors
} from '@/lib/supabase/colors.client'
import type { Color } from '@/lib/supabase/types'

interface ColorFormData {
  name: string
  slug: string
  hex_code: string
  is_active: boolean
}

export function ColorManagement() {
  const [colors, setColors] = useState<Color[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [colorToDelete, setColorToDelete] = useState<Color | null>(null)
  const [editingColor, setEditingColor] = useState<Color | null>(null)
  const [formData, setFormData] = useState<ColorFormData>({
    name: '',
    slug: '',
    hex_code: '#000000',
    is_active: true
  })

  useEffect(() => {
    loadColors()
  }, [])

  const loadColors = async () => {
    setLoading(true)
    try {
      const data = await getAllColorsClient()
      setColors(data)
    } catch (error) {
      console.error('Error loading colors:', error)
      toast.error('Gagal memuat data warna')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: editingColor ? prev.slug : generateSlug(name)
    }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      hex_code: '#000000',
      is_active: true
    })
    setEditingColor(null)
  }

  const handleEdit = (color: Color) => {
    setEditingColor(color)
    setFormData({
      name: color.name,
      slug: color.slug,
      hex_code: color.hex_code || '#000000',
      is_active: color.is_active ?? true
    })
    setDialogOpen(true)
  }

  const handleOpenNew = () => {
    resetForm()
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Nama warna harus diisi')
      return
    }

    setSaving(true)
    
    try {
      const colorData = {
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        hex_code: formData.hex_code,
        is_active: formData.is_active
      }

      if (editingColor) {
        await updateColor(editingColor.id, colorData)
        toast.success('Warna berhasil diperbarui')
      } else {
        await createColor({
          ...colorData,
          display_order: colors.length
        })
        toast.success('Warna berhasil ditambahkan')
      }

      await loadColors()
      setDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error('Error saving color:', error)
      toast.error('Gagal menyimpan warna')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!colorToDelete) return

    try {
      await deleteColor(colorToDelete.id)
      toast.success('Warna berhasil dihapus')
      await loadColors()
    } catch (error) {
      console.error('Error deleting color:', error)
      toast.error('Gagal menghapus warna')
    } finally {
      setColorToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const handleReorder = async (colorId: string, direction: 'up' | 'down') => {
    const index = colors.findIndex(c => c.id === colorId)
    if (index === -1) return
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === colors.length - 1) return

    const newColors = [...colors]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    ;[newColors[index], newColors[swapIndex]] = [newColors[swapIndex], newColors[index]]

    setColors(newColors)

    try {
      await reorderColors(newColors.map((c, i) => ({ id: c.id, display_order: i })))
    } catch (error) {
      console.error('Error reordering:', error)
      toast.error('Gagal mengubah urutan')
      loadColors()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Memuat data warna...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Daftar Warna</h2>
          <p className="text-sm text-muted-foreground">
            {colors.length} warna tersedia
          </p>
        </div>
        
        <Button onClick={handleOpenNew}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Warna
        </Button>
      </div>

      {colors.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">Belum ada warna</p>
            <Button className="mt-4" onClick={handleOpenNew}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Warna Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {colors.map((color, index) => (
                <div 
                  key={color.id} 
                  className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  {/* Reorder */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleReorder(color.id, 'up')}
                      disabled={index === 0}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded disabled:opacity-30"
                    >
                      <GripVertical className="h-4 w-4 rotate-90" />
                    </button>
                    <button
                      onClick={() => handleReorder(color.id, 'down')}
                      disabled={index === colors.length - 1}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded disabled:opacity-30"
                    >
                      <GripVertical className="h-4 w-4 -rotate-90" />
                    </button>
                  </div>

                  {/* Color Preview */}
                  <div 
                    className="w-12 h-12 rounded-lg border-2 border-slate-200 dark:border-slate-700 shadow-sm flex-shrink-0"
                    style={{ backgroundColor: color.hex_code || '#cccccc' }}
                    title={color.hex_code || 'No color'}
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{color.name}</h3>
                      {!color.is_active && (
                        <Badge variant="secondary">Nonaktif</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span>/{color.slug}</span>
                      <span className="font-mono">{color.hex_code}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(color)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => {
                        setColorToDelete(color)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => {
        if (!open) resetForm()
        setDialogOpen(open)
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingColor ? 'Edit Warna' : 'Tambah Warna Baru'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Color Preview */}
            <div className="flex justify-center">
              <div 
                className="w-24 h-24 rounded-xl border-4 border-slate-200 dark:border-slate-700 shadow-lg"
                style={{ backgroundColor: formData.hex_code }}
              />
            </div>

            {/* Hex Code */}
            <div>
              <Label htmlFor="hex_code">Kode Warna (Hex)</Label>
              <div className="flex gap-2 mt-1.5">
                <input
                  type="color"
                  value={formData.hex_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, hex_code: e.target.value }))}
                  className="w-12 h-10 rounded border cursor-pointer"
                />
                <Input
                  id="hex_code"
                  value={formData.hex_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, hex_code: e.target.value }))}
                  placeholder="#000000"
                  className="flex-1 font-mono"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <Label htmlFor="name">Nama Warna *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Contoh: Merah Maroon"
                className="mt-1.5"
                required
              />
            </div>

            {/* Slug */}
            <div>
              <Label htmlFor="slug">Slug URL</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: generateSlug(e.target.value) }))}
                placeholder="merah-maroon"
                className="mt-1.5"
              />
            </div>

            {/* Active */}
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="is_active">Status Aktif</Label>
                <p className="text-sm text-muted-foreground">
                  Warna aktif akan tampil di filter
                </p>
              </div>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, is_active: checked }))
                }
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingColor ? 'Simpan' : 'Tambah'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Warna?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus warna &quot;{colorToDelete?.name}&quot;?
              Produk yang menggunakan warna ini akan kehilangan referensi warnanya.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setColorToDelete(null)}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
