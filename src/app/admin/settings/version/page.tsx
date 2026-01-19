'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  GitBranch, 
  Plus, 
  Check, 
  X,
  Loader2,
  AlertTriangle,
  Star,

  Calendar,
  FileText
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { isValidVersion } from '@/lib/supabase/version-client'
import type { AppVersion } from '@/lib/supabase/types'

export default function VersionManagementPage() {
  const [versions, setVersions] = useState<AppVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    version: '',
    release_notes: '',
    is_mandatory: false,
    is_current: false
  })
  const [formLoading, setFormLoading] = useState(false)

  const supabase = createClient()

  const fetchVersions = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('app_versions')
        .select('*')
        .order('released_at', { ascending: false })

      if (error) throw error
      
      const mapped = (data || []).map(item => ({
        ...item,
        is_mandatory: item.is_mandatory ?? false,
        is_current: item.is_current ?? false
      })) as AppVersion[]
      
      setVersions(mapped)
    } catch (err) {
      console.error('Error fetching versions:', err)
      setError('Gagal memuat data versi')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchVersions()
  }, [fetchVersions])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setError(null)

    // Validate version format
    if (!isValidVersion(formData.version)) {
      setError('Format versi tidak valid (gunakan x.y.z)')
      setFormLoading(false)
      return
    }

    try {
      // Check if version already exists
      const { data: existing } = await supabase
        .from('app_versions')
        .select('id')
        .eq('version', formData.version)
        .single()

      if (existing) {
        setError('Versi sudah ada')
        setFormLoading(false)
        return
      }

      // If setting as current, unset other current versions
      if (formData.is_current) {
        await supabase
          .from('app_versions')
          .update({ is_current: false })
          .eq('is_current', true)
      }

      const { error } = await supabase
        .from('app_versions')
        .insert({
          version: formData.version,
          release_notes: formData.release_notes || null,
          is_mandatory: formData.is_mandatory,
          is_current: formData.is_current,
          released_at: new Date().toISOString()
        })

      if (error) throw error

      setSuccess('Versi baru berhasil ditambahkan')
      setShowForm(false)
      resetForm()
      fetchVersions()
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan versi')
    } finally {
      setFormLoading(false)
    }
  }

  const handleSetCurrent = async (id: string) => {
    try {
      // Unset all current versions
      await supabase
        .from('app_versions')
        .update({ is_current: false })
        .eq('is_current', true)

      // Set new current version
      const { error } = await supabase
        .from('app_versions')
        .update({ is_current: true })
        .eq('id', id)

      if (error) throw error
      
      setSuccess('Versi aktif berhasil diubah')
      fetchVersions()
    } catch (err) {
      setError('Gagal mengubah versi aktif')
    }
  }

  const handleToggleMandatory = async (version: AppVersion) => {
    try {
      const { error } = await supabase
        .from('app_versions')
        .update({ is_mandatory: !version.is_mandatory })
        .eq('id', version.id)

      if (error) throw error
      fetchVersions()
    } catch (err) {
      setError('Gagal mengubah status mandatory')
    }
  }



  const resetForm = () => {
    setFormData({
      version: '',
      release_notes: '',
      is_mandatory: false,
      is_current: false
    })
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const currentVersion = versions.find(v => v.is_current)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Versi</h1>
          <p className="text-gray-500">Kelola versi aplikasi dan update</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Tambah Versi
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

      {/* Current Version Card */}
      {currentVersion && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Star className="h-6 w-6" />
            <span className="text-sm font-medium opacity-90">Versi Aktif</span>
          </div>
          <div className="text-3xl font-bold mb-2">v{currentVersion.version}</div>
          <div className="flex items-center gap-4 text-sm opacity-90">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {formatDate(currentVersion.released_at)}
            </span>
            {currentVersion.is_mandatory && (
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                Wajib Update
              </span>
            )}
          </div>
        </div>
      )}

      {/* Versions List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">Riwayat Versi</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-500" />
          </div>
        ) : versions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <GitBranch className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Belum ada versi</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {versions.map((version) => (
              <div key={version.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-semibold text-gray-900">
                        v{version.version}
                      </span>
                      {version.is_current && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                          Aktif
                        </span>
                      )}
                      {version.is_mandatory && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                          Wajib
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(version.released_at)}
                    </div>
                    {version.release_notes && (
                      <div className="mt-2 text-sm text-gray-600 flex items-start gap-2">
                        <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{version.release_notes}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!version.is_current && (
                      <button
                        onClick={() => handleSetCurrent(version.id)}
                        className="px-3 py-1 text-sm text-amber-600 hover:bg-amber-50 rounded-lg"
                      >
                        Set Aktif
                      </button>
                    )}
                    <button
                      onClick={() => handleToggleMandatory(version)}
                      className={`px-3 py-1 text-sm rounded-lg ${
                        version.is_mandatory
                          ? 'bg-red-100 text-red-700'
                          : 'text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {version.is_mandatory ? 'Wajib' : 'Opsional'}
                    </button>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Version Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Tambah Versi Baru</h2>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nomor Versi
                </label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="1.0.0"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">Format: major.minor.patch (contoh: 1.2.3)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catatan Rilis
                </label>
                <textarea
                  value={formData.release_notes}
                  onChange={(e) => setFormData({ ...formData, release_notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  rows={3}
                  placeholder="Deskripsi perubahan pada versi ini..."
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_mandatory"
                    checked={formData.is_mandatory}
                    onChange={(e) => setFormData({ ...formData, is_mandatory: e.target.checked })}
                    className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="is_mandatory" className="text-sm text-gray-700">
                    Update wajib (pengguna harus update)
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_current"
                    checked={formData.is_current}
                    onChange={(e) => setFormData({ ...formData, is_current: e.target.checked })}
                    className="rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                  />
                  <label htmlFor="is_current" className="text-sm text-gray-700">
                    Set sebagai versi aktif
                  </label>
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
