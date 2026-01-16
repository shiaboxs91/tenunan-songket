'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Settings, 
  Save, 
  Upload,
  Loader2,
  Check,
  AlertTriangle,
  X,
  Globe,
  Phone,
  Share2,
  Search
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { SiteSettings, SiteSettingsGeneral, SiteSettingsContact, SiteSettingsSocial, SiteSettingsSEO } from '@/lib/supabase/types'

const defaultSettings: SiteSettings = {
  general: {
    site_name: 'Tenunan Songket',
    tagline: 'Keindahan Warisan Budaya',
    logo_url: '',
    favicon_url: ''
  },
  contact: {
    email: '',
    phone: '',
    whatsapp: '',
    address: ''
  },
  social: {
    instagram: '',
    facebook: '',
    twitter: '',
    tiktok: ''
  },
  seo: {
    meta_title: '',
    meta_description: '',
    keywords: []
  }
}

type TabType = 'general' | 'contact' | 'social' | 'seo'

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('general')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [keywordInput, setKeywordInput] = useState('')

  const supabase = createClient()

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')

      if (error) throw error

      if (data && data.length > 0) {
        const settingsMap: Record<string, any> = {}
        data.forEach(item => {
          settingsMap[item.key] = item.value
        })
        
        setSettings({
          general: settingsMap.general || defaultSettings.general,
          contact: settingsMap.contact || defaultSettings.contact,
          social: settingsMap.social || defaultSettings.social,
          seo: settingsMap.seo || defaultSettings.seo
        })
      }
    } catch (err) {
      console.error('Error fetching settings:', err)
      setError('Gagal memuat pengaturan')
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      const settingsToSave = [
        { key: 'general', value: JSON.parse(JSON.stringify(settings.general)) },
        { key: 'contact', value: JSON.parse(JSON.stringify(settings.contact)) },
        { key: 'social', value: JSON.parse(JSON.stringify(settings.social)) },
        { key: 'seo', value: JSON.parse(JSON.stringify(settings.seo)) }
      ]

      for (const setting of settingsToSave) {
        const { error } = await supabase
          .from('site_settings')
          .upsert(
            { key: setting.key, value: setting.value, updated_at: new Date().toISOString() },
            { onConflict: 'key' }
          )

        if (error) throw error
      }

      setSuccess('Pengaturan berhasil disimpan')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan pengaturan')
    } finally {
      setSaving(false)
    }
  }

  const updateGeneral = (field: keyof SiteSettingsGeneral, value: string) => {
    setSettings({
      ...settings,
      general: { ...settings.general, [field]: value }
    })
  }

  const updateContact = (field: keyof SiteSettingsContact, value: string) => {
    setSettings({
      ...settings,
      contact: { ...settings.contact, [field]: value }
    })
  }

  const updateSocial = (field: keyof SiteSettingsSocial, value: string) => {
    setSettings({
      ...settings,
      social: { ...settings.social, [field]: value }
    })
  }

  const updateSEO = (field: keyof SiteSettingsSEO, value: string | string[]) => {
    setSettings({
      ...settings,
      seo: { ...settings.seo, [field]: value }
    })
  }

  const addKeyword = () => {
    if (keywordInput.trim() && !settings.seo.keywords.includes(keywordInput.trim())) {
      updateSEO('keywords', [...settings.seo.keywords, keywordInput.trim()])
      setKeywordInput('')
    }
  }

  const removeKeyword = (keyword: string) => {
    updateSEO('keywords', settings.seo.keywords.filter(k => k !== keyword))
  }

  const tabs = [
    { id: 'general' as TabType, label: 'Umum', icon: Globe },
    { id: 'contact' as TabType, label: 'Kontak', icon: Phone },
    { id: 'social' as TabType, label: 'Media Sosial', icon: Share2 },
    { id: 'seo' as TabType, label: 'SEO', icon: Search }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pengaturan Situs</h1>
          <p className="text-gray-500">Kelola informasi dan konfigurasi situs</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50 transition-colors"
        >
          {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          Simpan
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

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama Situs</label>
                  <input
                    type="text"
                    value={settings.general.site_name}
                    onChange={(e) => updateGeneral('site_name', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Nama toko Anda"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tagline</label>
                  <input
                    type="text"
                    value={settings.general.tagline}
                    onChange={(e) => updateGeneral('tagline', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Slogan atau tagline"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL Logo</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={settings.general.logo_url}
                      onChange={(e) => updateGeneral('logo_url', e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="https://..."
                    />
                  </div>
                  {settings.general.logo_url && (
                    <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={settings.general.logo_url} 
                        alt="Logo Preview" 
                        className="h-12 object-contain"
                        onError={(e) => (e.currentTarget.style.display = 'none')}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">URL Favicon</label>
                  <input
                    type="text"
                    value={settings.general.favicon_url}
                    onChange={(e) => updateGeneral('favicon_url', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={settings.contact.email}
                    onChange={(e) => updateContact('email', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telepon</label>
                  <input
                    type="tel"
                    value={settings.contact.phone}
                    onChange={(e) => updateContact('phone', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="+673 xxx xxxx"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                  <input
                    type="tel"
                    value={settings.contact.whatsapp}
                    onChange={(e) => updateContact('whatsapp', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="+673 xxx xxxx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
                  <textarea
                    value={settings.contact.address}
                    onChange={(e) => updateContact('address', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    rows={3}
                    placeholder="Alamat lengkap toko"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Social Tab */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                  <input
                    type="text"
                    value={settings.social.instagram}
                    onChange={(e) => updateSocial('instagram', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                  <input
                    type="text"
                    value={settings.social.facebook}
                    onChange={(e) => updateSocial('facebook', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="https://facebook.com/..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Twitter/X</label>
                  <input
                    type="text"
                    value={settings.social.twitter}
                    onChange={(e) => updateSocial('twitter', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="https://twitter.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">TikTok</label>
                  <input
                    type="text"
                    value={settings.social.tiktok}
                    onChange={(e) => updateSocial('tiktok', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="https://tiktok.com/@..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                <input
                  type="text"
                  value={settings.seo.meta_title}
                  onChange={(e) => updateSEO('meta_title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Judul untuk mesin pencari"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {settings.seo.meta_title.length}/60 karakter (disarankan)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                <textarea
                  value={settings.seo.meta_description}
                  onChange={(e) => updateSEO('meta_description', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  rows={3}
                  placeholder="Deskripsi singkat untuk mesin pencari"
                />
                <p className="mt-1 text-sm text-gray-500">
                  {settings.seo.meta_description.length}/160 karakter (disarankan)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Keywords</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Tambah keyword..."
                  />
                  <button
                    type="button"
                    onClick={addKeyword}
                    className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                  >
                    Tambah
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {settings.seo.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeKeyword(keyword)}
                        className="hover:text-amber-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* SEO Preview */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Preview di Google</h4>
                <div className="bg-white p-4 rounded border border-gray-200">
                  <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                    {settings.seo.meta_title || settings.general.site_name || 'Judul Halaman'}
                  </div>
                  <div className="text-green-700 text-sm">
                    www.tenunansongket.com
                  </div>
                  <div className="text-gray-600 text-sm mt-1">
                    {settings.seo.meta_description || 'Deskripsi halaman akan muncul di sini...'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
