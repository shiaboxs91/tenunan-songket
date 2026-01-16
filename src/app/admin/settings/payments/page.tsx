'use client'

import { useState, useEffect } from 'react'
import { 
  CreditCard, 
  Plus, 
  Edit2, 
  Trash2, 
  X,
  Loader2,
  Check,
  AlertTriangle,
  Building2,
  Wallet
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { PaymentMethod, BankAccount } from '@/lib/supabase/types'

export default function PaymentSettingsPage() {
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'bank_transfer' as 'stripe' | 'bank_transfer' | 'manual',
    instructions: '',
    is_active: true,
    stripe_publishable_key: '',
    stripe_secret_key: '',
    bank_accounts: [] as BankAccount[]
  })
  const [formLoading, setFormLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchMethods()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const fetchMethods = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .order('display_order', { ascending: true })

      if (error) throw error
      // Cast the data to PaymentMethod[] since DB returns string for type
      const methods = (data || []).map(item => ({
        ...item,
        type: item.type as PaymentMethod['type'],
        config: item.config,
        is_active: item.is_active ?? true,
        display_order: item.display_order ?? 0
      })) as PaymentMethod[]
      setMethods(methods)
    } catch (err) {
      console.error('Error fetching methods:', err)
      setError('Gagal memuat data pembayaran')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setError(null)

    try {
      let config: any = {}
      
      if (formData.type === 'stripe') {
        config = {
          publishable_key: formData.stripe_publishable_key,
          secret_key: formData.stripe_secret_key
        }
      } else if (formData.type === 'bank_transfer') {
        config = {
          bank_accounts: formData.bank_accounts
        }
      }

      if (editingMethod) {
        const { error } = await supabase
          .from('payment_methods')
          .update({
            name: formData.name,
            code: formData.code,
            type: formData.type,
            config,
            instructions: formData.instructions,
            is_active: formData.is_active
          })
          .eq('id', editingMethod.id)

        if (error) throw error
        setSuccess('Metode pembayaran berhasil diperbarui')
      } else {
        const { error } = await supabase
          .from('payment_methods')
          .insert({
            name: formData.name,
            code: formData.code,
            type: formData.type,
            config,
            instructions: formData.instructions,
            is_active: formData.is_active,
            display_order: methods.length
          })

        if (error) throw error
        setSuccess('Metode pembayaran baru berhasil ditambahkan')
      }

      setShowForm(false)
      setEditingMethod(null)
      resetForm()
      fetchMethods()
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan metode pembayaran')
    } finally {
      setFormLoading(false)
    }
  }

  const handleToggleActive = async (method: PaymentMethod) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_active: !method.is_active })
        .eq('id', method.id)

      if (error) throw error
      fetchMethods()
    } catch (err) {
      setError('Gagal mengubah status')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus metode pembayaran ini?')) return

    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', id)

      if (error) throw error
      setSuccess('Metode pembayaran berhasil dihapus')
      fetchMethods()
    } catch (err) {
      setError('Gagal menghapus metode pembayaran')
    }
  }

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method)
    const config = method.config as any
    setFormData({
      name: method.name,
      code: method.code,
      type: method.type,
      instructions: method.instructions || '',
      is_active: method.is_active,
      stripe_publishable_key: config?.publishable_key || '',
      stripe_secret_key: config?.secret_key || '',
      bank_accounts: config?.bank_accounts || []
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      type: 'bank_transfer',
      instructions: '',
      is_active: true,
      stripe_publishable_key: '',
      stripe_secret_key: '',
      bank_accounts: []
    })
  }

  const addBankAccount = () => {
    setFormData({
      ...formData,
      bank_accounts: [...formData.bank_accounts, { bank_name: '', account_number: '', account_holder: '' }]
    })
  }

  const updateBankAccount = (index: number, field: keyof BankAccount, value: string) => {
    const newAccounts = [...formData.bank_accounts]
    newAccounts[index] = { ...newAccounts[index], [field]: value }
    setFormData({ ...formData, bank_accounts: newAccounts })
  }

  const removeBankAccount = (index: number) => {
    setFormData({
      ...formData,
      bank_accounts: formData.bank_accounts.filter((_, i) => i !== index)
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'stripe': return <CreditCard className="h-6 w-6 text-purple-500" />
      case 'bank_transfer': return <Building2 className="h-6 w-6 text-blue-500" />
      default: return <Wallet className="h-6 w-6 text-gray-500" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'stripe': return 'Stripe'
      case 'bank_transfer': return 'Transfer Bank'
      case 'manual': return 'Manual'
      default: return type
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan Pembayaran</h1>
          <p className="text-gray-500">Kelola metode pembayaran</p>
        </div>
        <button
          onClick={() => { resetForm(); setEditingMethod(null); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Tambah Metode
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

      {/* Methods List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-500" />
          </div>
        ) : methods.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <CreditCard className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Belum ada metode pembayaran</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {methods.map((method) => (
              <div key={method.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getTypeIcon(method.type)}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{method.name}</h3>
                    <p className="text-sm text-gray-500">
                      {getTypeLabel(method.type)} | Kode: {method.code}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleActive(method)}
                    className={`px-3 py-1 text-sm rounded-full ${
                      method.is_active 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {method.is_active ? 'Aktif' : 'Nonaktif'}
                  </button>
                  <button
                    onClick={() => handleEdit(method)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(method.id)}
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
                  {editingMethod ? 'Edit Metode Pembayaran' : 'Tambah Metode Pembayaran'}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipe</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="bank_transfer">Transfer Bank</option>
                  <option value="stripe">Stripe</option>
                  <option value="manual">Manual</option>
                </select>
              </div>

              {/* Stripe Config */}
              {formData.type === 'stripe' && (
                <div className="space-y-4 p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-medium text-purple-900">Konfigurasi Stripe</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Publishable Key</label>
                    <input
                      type="text"
                      value={formData.stripe_publishable_key}
                      onChange={(e) => setFormData({ ...formData, stripe_publishable_key: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="pk_..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
                    <input
                      type="password"
                      value={formData.stripe_secret_key}
                      onChange={(e) => setFormData({ ...formData, stripe_secret_key: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="sk_..."
                    />
                  </div>
                </div>
              )}

              {/* Bank Transfer Config */}
              {formData.type === 'bank_transfer' && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-blue-900">Rekening Bank</h4>
                    <button type="button" onClick={addBankAccount} className="text-sm text-blue-600 hover:text-blue-700">
                      + Tambah Rekening
                    </button>
                  </div>
                  
                  {formData.bank_accounts.map((account, index) => (
                    <div key={index} className="p-3 bg-white rounded-lg border border-blue-200">
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Nama Bank"
                          value={account.bank_name}
                          onChange={(e) => updateBankAccount(index, 'bank_name', e.target.value)}
                          className="px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                        <input
                          type="text"
                          placeholder="No. Rekening"
                          value={account.account_number}
                          onChange={(e) => updateBankAccount(index, 'account_number', e.target.value)}
                          className="px-2 py-1 text-sm border border-gray-300 rounded"
                        />
                        <div className="flex gap-1">
                          <input
                            type="text"
                            placeholder="Nama Pemilik"
                            value={account.account_holder}
                            onChange={(e) => updateBankAccount(index, 'account_holder', e.target.value)}
                            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                          />
                          <button type="button" onClick={() => removeBankAccount(index)} className="p-1 text-red-500">
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instruksi Pembayaran</label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  rows={3}
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
