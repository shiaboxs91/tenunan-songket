'use client'

import { useState, useEffect } from 'react'
import { 
  Shield, 
  Plus, 
  Trash2, 
  Mail, 
  Calendar,
  AlertTriangle,
  X,
  Loader2,
  Pencil,
  Key
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AdminUser {
  id: string
  user_id: string
  email: string
  full_name: string | null
  role: string
  created_at: string | null
}

export default function AdminUsersPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: ''
  })
  const [editFormData, setEditFormData] = useState({
    full_name: '',
    new_password: ''
  })
  const [formLoading, setFormLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchAdmins()
  }, [])

  const fetchAdmins = async () => {
    setLoading(true)
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, role, created_at')
        .eq('role', 'admin')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform data to match AdminUser type
      const transformedAdmins: AdminUser[] = (profiles || []).map(p => ({
        id: p.id,
        user_id: p.user_id,
        email: 'Memuat...',
        full_name: p.full_name,
        role: p.role || 'admin',
        created_at: p.created_at,
        is_active: true
      }))

      setAdmins(transformedAdmins)
    } catch (err) {
      console.error('Error fetching admins:', err)
      setError('Gagal memuat daftar admin')
    } finally {
      setLoading(false)
    }
  }

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormLoading(true)
    setError(null)

    // Validate email domain
    const emailDomain = formData.email.split('@')[1]?.toLowerCase()
    const blockedDomains = ['example.com', 'test.com', 'localhost']
    if (blockedDomains.includes(emailDomain)) {
      setError('Gunakan email asli, bukan email test (example.com, test.com)')
      setFormLoading(false)
      return
    }

    try {
      // Create user via Supabase Auth with emailRedirectTo for confirmation
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (authError) {
        // Handle specific error messages
        if (authError.message.includes('invalid') || authError.message.includes('Invalid')) {
          throw new Error('Email tidak valid. Gunakan email asli yang bisa menerima konfirmasi.')
        }
        if (authError.message.includes('already registered')) {
          throw new Error('Email sudah terdaftar. Gunakan email lain.')
        }
        throw authError
      }

      if (authData.user) {
        // Check if profile exists, if not create it
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', authData.user.id)
          .single()

        if (existingProfile) {
          // Update existing profile
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ role: 'admin', full_name: formData.full_name })
            .eq('user_id', authData.user.id)

          if (profileError) throw profileError
        } else {
          // Create new profile
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({ 
              user_id: authData.user.id, 
              role: 'admin', 
              full_name: formData.full_name 
            })

          if (profileError) throw profileError
        }
      }

      setSuccess('Admin baru berhasil ditambahkan. Email konfirmasi telah dikirim.')
      setShowAddForm(false)
      setFormData({ email: '', password: '', full_name: '' })
      fetchAdmins()
    } catch (err: any) {
      console.error('Add admin error:', err)
      setError(err.message || 'Gagal menambahkan admin')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteAdmin = async (userId: string) => {
    if (admins.length <= 1) {
      setError('Tidak dapat menghapus admin terakhir')
      setDeleteConfirm(null)
      return
    }

    try {
      // Delete profile (user will remain but without admin access)
      const { error } = await supabase
        .from('profiles')
        .update({ role: 'customer' })
        .eq('user_id', userId)

      if (error) throw error

      setSuccess('Admin berhasil dihapus')
      setDeleteConfirm(null)
      fetchAdmins()
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus admin')
    }
  }

  const handleEditAdmin = (admin: AdminUser) => {
    setEditingAdmin(admin)
    setEditFormData({
      full_name: admin.full_name || '',
      new_password: ''
    })
    setShowEditForm(true)
  }

  const handleUpdateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAdmin) return
    
    setFormLoading(true)
    setError(null)

    try {
      // Update profile name
      if (editFormData.full_name !== editingAdmin.full_name) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ full_name: editFormData.full_name })
          .eq('user_id', editingAdmin.user_id)

        if (profileError) throw profileError
      }

      // Update password if provided
      if (editFormData.new_password && editFormData.new_password.length >= 8) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: editFormData.new_password
        })

        if (passwordError) {
          throw new Error('Gagal mengubah password: ' + passwordError.message)
        }
      }

      setSuccess('Admin berhasil diperbarui')
      setShowEditForm(false)
      setEditingAdmin(null)
      setEditFormData({ full_name: '', new_password: '' })
      fetchAdmins()
    } catch (err: any) {
      console.error('Update admin error:', err)
      setError(err.message || 'Gagal memperbarui admin')
    } finally {
      setFormLoading(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Admin</h1>
          <p className="text-gray-500">Kelola akun administrator</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Tambah Admin
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {error}
          </div>
          <button onClick={() => setError(null)}>
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center justify-between">
          {success}
          <button onClick={() => setSuccess(null)}>
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Admin List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-500" />
            <p className="mt-2 text-gray-500">Memuat data...</p>
          </div>
        ) : admins.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Shield className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Belum ada admin terdaftar</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {admins.map((admin) => (
              <div key={admin.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <Shield className="h-6 w-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {admin.full_name || 'Tanpa Nama'}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {admin.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(admin.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 text-sm rounded-full">
                    Admin
                  </span>
                  {deleteConfirm === admin.user_id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteAdmin(admin.user_id)}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                      >
                        Konfirmasi
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded-lg hover:bg-gray-300"
                      >
                        Batal
                      </button>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEditAdmin(admin)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit admin"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(admin.user_id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hapus admin"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Admin Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Tambah Admin Baru</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleAddAdmin} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  minLength={8}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Minimal 8 karakter</p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
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
                  Tambah Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditForm && editingAdmin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Edit Admin</h2>
                <button
                  onClick={() => {
                    setShowEditForm(false)
                    setEditingAdmin(null)
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            <form onSubmit={handleUpdateAdmin} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={editFormData.full_name}
                  onChange={(e) => setEditFormData({ ...editFormData, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <span className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Password Baru
                  </span>
                </label>
                <input
                  type="password"
                  value={editFormData.new_password}
                  onChange={(e) => setEditFormData({ ...editFormData, new_password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  minLength={8}
                  placeholder="Kosongkan jika tidak ingin mengubah"
                />
                <p className="text-xs text-gray-500 mt-1">Minimal 8 karakter. Kosongkan jika tidak ingin mengubah password.</p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false)
                    setEditingAdmin(null)
                  }}
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
