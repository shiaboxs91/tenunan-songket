'use client'

import { useState, useEffect } from 'react'
import { 
  Truck, 
  Plus, 
  Edit2, 
  Trash2, 
  X,
  Loader2,
  Check,
  AlertTriangle
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { ShippingProvider, ShippingService, Json } from '@/lib/supabase/types'

export default function ShippingSettingsPage() {
  const [providers, setProviders] = useState<ShippingProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProvider, setEditingProvider] = useState<ShippingProvider | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    logo_url: '',
    is_active: true,
    services: [] as ShippingService[]
  })
  const [formLoading, setFormLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchProviders()
  }, [])

  const fetchProviders = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('shipping_providers')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) throw error
      
      // Transform data to match ShippingProvider type
      const transformedData: ShippingProvider[] = (data || []).map(item => ({
        ...item,
        services: (item.services as unknown as ShippingService[]) || [],
        is_active: item.is_active ?? true,
        display_order: item.display_order ?? 0
      }))
      
      setProviders(transformedData)
    } catch (err) {
      console.error('Error fetching providers:', err)
      setError('Gagal memuat data ekspedisi')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setError(null)

    try {
      if (editingProvider) {
        const { error } = await supabase
          .from('shipping_providers')
          .update({
            name: formData.name,
            code: formData.code,
            logo_url: formData.logo_url || null,
            is_active: formData.is_active,
            services: formData.services as unknown as Json
          })
          .eq('id', editingProvider.id)

        if (error) throw error
        setSuccess('Ekspedisi berhasil diperbarui')
      } else {
        const { error } = await supabase
          .from('shipping_providers')
          .insert({
            name: formData.name,
            code: formData.code,
            logo_url: formData.logo_url || null,
            is_active: formData.is_active,
            services: formData.services as unknown as Json,
            display_order: providers.length
          })

        if (error) throw error
        setSuccess('Ekspedisi baru berhasil ditambahkan')
      }

      setShowForm(false)
      setEditingProvider(null)
      resetForm()
      fetchProviders()
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan ekspedisi')
    } finally {
      setFormLoading(false)
    }
  }

  const handleToggleActive = async (provider: ShippingProvider) => {
    try {
      const { error } = await supabase
        .from('shipping_providers')
        .update({ is_active: !provider.is_active })
        .eq('id', provider.id)

      if (error) throw error
      fetchProviders()
    } catch (err) {
      setError('Gagal mengubah status')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus ekspedisi ini?')) return

    try {
      const { error } = await supabase
        .from('shipping_providers')
        .delete()
        .eq('id', id)

      if (error) throw error
      setSuccess('Ekspedisi berhasil dihapus')
      fetchProviders()
    } catch (err) {
      setError('Gagal menghapus ekspedisi')
    }
  }

  const handleEdit = (provider: ShippingProvider) => {
    setEditingProvider(provider)
    setFormData({
      name: provider.name,
      code: provider.code,
      logo_url: provider.logo_url || '',
      is_active: provider.is_active,
      services: provider.services || []
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      logo_url: '',
      is_active: true,
      services: []
    })
  }

  const addService = () => {
    setFormData({
      ...formData,
      services: [...formData.services, { code: '', name: '', estimated_days: '', base_cost: 0, cost_per_kg: 0 }]
    })
  }

  const updateService = (index: number, field: keyof ShippingService, value: string | number) => {
    const newServices = [...formData.services]
    newServices[index] = { ...newServices[index], [field]: value }
    setFormData({ ...formData, services: newServices })
  }

  const removeService = (index: number) => {
    setFormData({
      ...formData,
      services: formData.services.filter((_, i) => i !== index)
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan Ekspedisi</h1>
          <p className="text-gray-500">Kelola penyedia jasa pengiriman</p>
        </div>
        <button
          onClick={() => { resetForm(); setEditingProvider(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Tambah Ekspedisi
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {error}
          </div>
          <button onClick={() => setError(null)}><X className="h-5 w-5" /></button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5" />
            {success}
          </div>
          <button onClick={() => setSuccess(null)}><X className="h-5 w-5" /></button>
        </div>
      )}

      {/* Providers List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-500" />
          </div>
        ) : providers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Truck className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Belum ada ekspedisi terdaftar</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {providers.map((provider) => (
              <div key={provider.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Truck className="h-6 w-6 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{provider.name}</h3>
                    <p className="text-sm text-gray-500">
                      Kode: {provider.code} | {provider.services?.length || 0} layanan
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleActive(provider)}
                    className={`px-3 py-1 text-sm rounded-full ${
                      provider.is_active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {provider.is_active ? 'Aktif' : 'Nonaktif'}
                  </button>
                  <button
                    onClick={() => handleEdit(provider)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(provider.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {editingProvider ? 'Edit Ekspedisi' : 'Tambah Ekspedisi Baru'}
                </h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kode</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase() })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL Logo (opsional)</label>
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">Aktif</label>
              </div>

              {/* Services */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Layanan</label>
                  <button
                    type="button"
                    onClick={addService}
                    className="text-sm text-amber-600 hover:text-amber-700"
                  >
                    + Tambah Layanan
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.services.map((service, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                        <input
                          type="text"
                          placeholder="Kode"
                          value={service.code}
                          onChange={(e) => updateService(index, 'code', e.target.value)}
                          className="px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          placeholder="Nama"
                          value={service.name}
                          onChange={(e) => updateService(index, 'name', e.target.value)}
                          className="px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          placeholder="Est. Hari"
                          value={service.estimated_days}
                          onChange={(e) => updateService(index, 'estimated_days', e.target.value)}
                          className="px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                        <div className="flex gap-1">
                          <input
                            type="number"
                            placeholder="Biaya Dasar"
                            value={service.base_cost}
                            onChange={(e) => updateService(index, 'base_cost', parseInt(e.target.value) || 0)}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                          />
                          <input
                            type="number"
                            placeholder="Biaya/Kg"
                            value={service.cost_per_kg || 0}
                            onChange={(e) => updateService(index, 'cost_per_kg', parseInt(e.target.value) || 0)}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                            title="Biaya per Kg (Opsional)"
                          />
                          <button
                            type="button"
                            onClick={() => removeService(index)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {formLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
