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
  AlertTriangle,
  Globe,
  ChevronDown,
  ChevronUp,
  DollarSign
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { Json } from '@/lib/supabase/types'

const SUPPORTED_COUNTRIES = [
  { code: 'MY', name: 'Malaysia' },
  { code: 'SG', name: 'Singapore' },
  { code: 'BN', name: 'Brunei' },
]

const SUPPORTED_REGIONS = [
  { code: 'semenanjung', name: 'Semenanjung Malaysia', country: 'MY' },
  { code: 'sabah', name: 'Sabah', country: 'MY' },
  { code: 'sarawak', name: 'Sarawak', country: 'MY' },
  { code: 'singapore', name: 'Singapore', country: 'SG' },
  { code: 'brunei', name: 'Brunei', country: 'BN' },
]

interface RegionalPricing {
  region: string
  cost_per_kg: number
  min_cost?: number
}

interface ServiceForm {
  id: string
  code?: string
  name: string
  estimated_days: string
  base_cost: number
  cost_per_kg?: number
  tracking_available: boolean
  includes_insurance: boolean
  regional_pricing: RegionalPricing[]
  display_order: number
}

interface ProviderState {
  id: string
  name: string
  code: string
  logo_url: string | null
  services: ServiceForm[]
  countries: string[]
  is_active: boolean
  display_order: number
  created_at: string | null
  updated_at: string | null
}

export default function ShippingSettingsPage() {
  const [providers, setProviders] = useState<ProviderState[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProvider, setEditingProvider] = useState<ProviderState | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [expandedServices, setExpandedServices] = useState<number[]>([])
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    logo_url: '',
    is_active: true,
    countries: [] as string[],
    services: [] as ServiceForm[]
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
      
      const transformedData: ProviderState[] = (data || []).map(item => ({
        ...item,
        services: (item.services as unknown as ServiceForm[]) || [],
        countries: (item.countries as string[]) || [],
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
      const servicesData = formData.services.map((s, idx) => ({
        ...s,
        id: s.id || `${formData.code}-${idx}`,
        display_order: idx,
        regional_pricing: s.regional_pricing.filter(rp => rp.cost_per_kg > 0)
      }))

      if (editingProvider) {
        const { error } = await supabase
          .from('shipping_providers')
          .update({
            name: formData.name,
            code: formData.code,
            logo_url: formData.logo_url || null,
            is_active: formData.is_active,
            countries: formData.countries,
            services: servicesData as unknown as Json
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
            countries: formData.countries,
            services: servicesData as unknown as Json,
            display_order: providers.length
          })

        if (error) throw error
        setSuccess('Ekspedisi baru berhasil ditambahkan')
      }

      setShowForm(false)
      setEditingProvider(null)
      resetForm()
      fetchProviders()
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menyimpan ekspedisi'
      setError(errorMessage)
    } finally {
      setFormLoading(false)
    }
  }

  const handleToggleActive = async (provider: ProviderState) => {
    try {
      const { error } = await supabase
        .from('shipping_providers')
        .update({ is_active: !provider.is_active })
        .eq('id', provider.id)

      if (error) throw error
      fetchProviders()
    } catch {
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
    } catch {
      setError('Gagal menghapus ekspedisi')
    }
  }

  const handleEdit = (provider: ProviderState) => {
    setEditingProvider(provider)
    const services = (provider.services || []).map(s => ({
      ...s,
      regional_pricing: s.regional_pricing || []
    }))
    setFormData({
      name: provider.name,
      code: provider.code,
      logo_url: provider.logo_url || '',
      is_active: provider.is_active,
      countries: provider.countries || [],
      services
    })
    setExpandedServices([])
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      logo_url: '',
      is_active: true,
      countries: [],
      services: []
    })
    setExpandedServices([])
  }

  const toggleCountry = (countryCode: string) => {
    setFormData(prev => ({
      ...prev,
      countries: prev.countries.includes(countryCode)
        ? prev.countries.filter(c => c !== countryCode)
        : [...prev.countries, countryCode]
    }))
  }

  const addService = () => {
    const newService: ServiceForm = {
      id: '',
      name: '',
      estimated_days: '3-5 hari',
      base_cost: 0,
      cost_per_kg: 0,
      tracking_available: true,
      includes_insurance: false,
      regional_pricing: [],
      display_order: formData.services.length
    }
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, newService]
    }))
    setExpandedServices(prev => [...prev, formData.services.length])
  }

  const updateService = (index: number, field: keyof ServiceForm, value: unknown) => {
    const newServices = [...formData.services]
    newServices[index] = { ...newServices[index], [field]: value }
    setFormData({ ...formData, services: newServices })
  }

  const removeService = (index: number) => {
    setFormData({
      ...formData,
      services: formData.services.filter((_, i) => i !== index)
    })
    setExpandedServices(prev => prev.filter(i => i !== index))
  }

  const toggleServiceExpand = (index: number) => {
    setExpandedServices(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index) 
        : [...prev, index]
    )
  }

  const updateRegionalPricing = (serviceIndex: number, region: string, field: 'cost_per_kg' | 'min_cost', value: number) => {
    const newServices = [...formData.services]
    const service = newServices[serviceIndex]
    const existingIndex = service.regional_pricing.findIndex(rp => rp.region === region)
    
    if (existingIndex >= 0) {
      service.regional_pricing[existingIndex] = {
        ...service.regional_pricing[existingIndex],
        [field]: value
      }
    } else {
      service.regional_pricing.push({
        region,
        cost_per_kg: field === 'cost_per_kg' ? value : 0,
        min_cost: field === 'min_cost' ? value : undefined
      })
    }
    
    setFormData({ ...formData, services: newServices })
  }

  const getRegionalPrice = (service: ServiceForm, region: string, field: 'cost_per_kg' | 'min_cost'): number => {
    const rp = service.regional_pricing.find(r => r.region === region)
    if (!rp) return 0
    return field === 'cost_per_kg' ? rp.cost_per_kg : (rp.min_cost || 0)
  }

  const getCountryNames = (codes: string[]) => {
    if (!codes || codes.length === 0) return 'Semua negara'
    return codes.map(code => {
      const country = SUPPORTED_COUNTRIES.find(c => c.code === code)
      return country?.name || code
    }).join(', ')
  }

  const getAvailableRegions = () => {
    if (formData.countries.length === 0) return SUPPORTED_REGIONS
    return SUPPORTED_REGIONS.filter(r => formData.countries.includes(r.country))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan Ekspedisi</h1>
          <p className="text-gray-500">Kelola penyedia jasa pengiriman dan harga per region</p>
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
                      Kode: {provider.code} | {((provider.services as unknown as ServiceForm[]) || []).length} layanan
                    </p>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                      <Globe className="h-3 w-3" />
                      {getCountryNames(provider.countries)}
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
                    aria-label="Edit ekspedisi"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(provider.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    aria-label="Hapus ekspedisi"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-gray-200 flex-shrink-0">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  {editingProvider ? 'Edit Ekspedisi' : 'Tambah Ekspedisi Baru'}
                </h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama Ekspedisi</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Contoh: Skynet Express"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kode</label>
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toLowerCase() })}
                      placeholder="Contoh: skynet"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
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
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                  />
                </div>

                {/* Countries Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Negara Tujuan
                    <span className="text-gray-400 font-normal ml-1">(kosongkan untuk semua negara)</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SUPPORTED_COUNTRIES.map((country) => (
                      <button
                        key={country.code}
                        type="button"
                        onClick={() => toggleCountry(country.code)}
                        className={`px-3 py-1.5 text-sm rounded-lg border transition-colors ${
                          formData.countries.includes(country.code)
                            ? 'bg-amber-50 border-amber-300 text-amber-700'
                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {formData.countries.includes(country.code) && (
                          <Check className="h-3 w-3 inline mr-1" />
                        )}
                        {country.name}
                      </button>
                    ))}
                  </div>
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
                    <label className="block text-sm font-medium text-gray-700">
                      Layanan & Harga Regional
                    </label>
                    <button
                      type="button"
                      onClick={addService}
                      className="text-sm text-amber-600 hover:text-amber-700 flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      Tambah Layanan
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {formData.services.length === 0 && (
                      <p className="text-sm text-gray-400 italic py-4 text-center border border-dashed border-gray-200 rounded-lg">
                        Belum ada layanan. Klik &quot;Tambah Layanan&quot; untuk menambahkan.
                      </p>
                    )}
                    {formData.services.map((service, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                        {/* Service Header */}
                        <div 
                          className="p-3 bg-gray-50 flex items-center justify-between cursor-pointer"
                          onClick={() => toggleServiceExpand(index)}
                        >
                          <div className="flex items-center gap-3">
                            <button type="button" className="text-gray-400">
                              {expandedServices.includes(index) ? (
                                <ChevronUp className="h-5 w-5" />
                              ) : (
                                <ChevronDown className="h-5 w-5" />
                              )}
                            </button>
                            <div>
                              <span className="font-medium text-gray-900">
                                {service.name || 'Layanan Baru'}
                              </span>
                              <span className="text-gray-400 text-sm ml-2">
                                {service.regional_pricing.length > 0 
                                  ? `${service.regional_pricing.length} harga regional`
                                  : 'Harga dasar saja'}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); removeService(index); }}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Service Details */}
                        {expandedServices.includes(index) && (
                          <div className="p-4 space-y-4">
                            {/* Basic Service Info */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Nama Layanan</label>
                                <input
                                  type="text"
                                  placeholder="Standard"
                                  value={service.name}
                                  onChange={(e) => updateService(index, 'name', e.target.value)}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Est. Pengiriman</label>
                                <input
                                  type="text"
                                  placeholder="3-5 hari"
                                  value={service.estimated_days}
                                  onChange={(e) => updateService(index, 'estimated_days', e.target.value)}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Biaya Dasar (BND)</label>
                                <input
                                  type="number"
                                  placeholder="10"
                                  value={service.base_cost}
                                  onChange={(e) => updateService(index, 'base_cost', parseFloat(e.target.value) || 0)}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Default /Kg</label>
                                <input
                                  type="number"
                                  placeholder="5"
                                  value={service.cost_per_kg || ''}
                                  onChange={(e) => updateService(index, 'cost_per_kg', parseFloat(e.target.value) || 0)}
                                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-amber-500"
                                />
                              </div>
                            </div>

                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={service.tracking_available}
                                  onChange={(e) => updateService(index, 'tracking_available', e.target.checked)}
                                  className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                                />
                                Tracking
                              </label>
                              <label className="flex items-center gap-2 text-sm">
                                <input
                                  type="checkbox"
                                  checked={service.includes_insurance}
                                  onChange={(e) => updateService(index, 'includes_insurance', e.target.checked)}
                                  className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                                />
                                Asuransi
                              </label>
                            </div>

                            {/* Regional Pricing */}
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <DollarSign className="h-4 w-4 text-amber-500" />
                                <label className="text-sm font-medium text-gray-700">Harga Per Region</label>
                                <span className="text-xs text-gray-400">(opsional, override biaya dasar)</span>
                              </div>
                              
                              {getAvailableRegions().length === 0 ? (
                                <p className="text-sm text-gray-400 italic">
                                  Pilih negara tujuan terlebih dahulu untuk mengatur harga regional
                                </p>
                              ) : (
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="text-left text-gray-500 border-b">
                                        <th className="pb-2 font-medium">Region</th>
                                        <th className="pb-2 font-medium text-right">Biaya/Kg (BND)</th>
                                        <th className="pb-2 font-medium text-right">Min. Biaya (BND)</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {getAvailableRegions().map((region) => (
                                        <tr key={region.code} className="border-b border-gray-100">
                                          <td className="py-2">
                                            <span className="text-gray-700">{region.name}</span>
                                          </td>
                                          <td className="py-2">
                                            <input
                                              type="number"
                                              step="0.01"
                                              placeholder="0"
                                              value={getRegionalPrice(service, region.code, 'cost_per_kg') || ''}
                                              onChange={(e) => updateRegionalPricing(index, region.code, 'cost_per_kg', parseFloat(e.target.value) || 0)}
                                              className="w-24 px-2 py-1 text-sm border border-gray-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-amber-500"
                                            />
                                          </td>
                                          <td className="py-2">
                                            <input
                                              type="number"
                                              step="0.01"
                                              placeholder="0"
                                              value={getRegionalPrice(service, region.code, 'min_cost') || ''}
                                              onChange={(e) => updateRegionalPricing(index, region.code, 'min_cost', parseFloat(e.target.value) || 0)}
                                              className="w-24 px-2 py-1 text-sm border border-gray-300 rounded text-right focus:outline-none focus:ring-1 focus:ring-amber-500"
                                            />
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-4 border-t border-gray-200 flex gap-3 flex-shrink-0">
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
