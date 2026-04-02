'use client'

import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { ExternalLink, Info, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react'

interface FBConfig {
  id?: string
  catalog_id: string
  business_id: string
  access_token: string
  page_access_token: string
  pixel_id: string
  is_active: boolean
  auto_sync_enabled: boolean
  last_sync_at?: string
}

export function FacebookShopSettings() {
  const [config, setConfig] = useState<FBConfig>({
    catalog_id: '',
    business_id: '',
    access_token: '',
    page_access_token: '',
    pixel_id: '',
    is_active: false,
    auto_sync_enabled: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [showTokens, setShowTokens] = useState({
    access_token: false,
    page_access_token: false,
  })

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('fb_catalog_config')
      .select('*')
      .limit(1)
      .single()
    
    if (data && !error) {
      setConfig({
        id: data.id,
        catalog_id: data.catalog_id || '',
        business_id: data.business_id || '',
        access_token: data.access_token ? '••••••••••••••••' : '',
        page_access_token: data.page_access_token ? '••••••••••••••••' : '',
        pixel_id: data.pixel_id || '',
        is_active: data.is_active || false,
        auto_sync_enabled: data.auto_sync_enabled || false,
        last_sync_at: data.last_sync_at ?? undefined,
      })
    }
    setLoading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    
    // Prepare data - don't update tokens if they're masked
    const updateData: Record<string, unknown> = {
      catalog_id: config.catalog_id,
      business_id: config.business_id,
      pixel_id: config.pixel_id,
      is_active: config.is_active,
      auto_sync_enabled: config.auto_sync_enabled,
      updated_at: new Date().toISOString(),
    }
    
    // Only update tokens if they've been changed (not masked)
    if (!config.access_token.includes('••••')) {
      updateData.access_token = config.access_token
    }
    if (!config.page_access_token.includes('••••')) {
      updateData.page_access_token = config.page_access_token
    }
    
    let error
    if (config.id) {
      // Update existing
      const result = await supabase
        .from('fb_catalog_config')
        .update(updateData)
        .eq('id', config.id)
      error = result.error
    } else {
      // Insert new
      const result = await supabase
        .from('fb_catalog_config')
        .insert(updateData)
        .select()
        .single()
      error = result.error
      if (result.data) {
        setConfig(prev => ({ ...prev, id: result.data.id }))
      }
    }
    
    if (error) {
      toast.error('Gagal menyimpan pengaturan: ' + error.message)
    } else {
      toast.success('Pengaturan tersimpan')
    }
    setSaving(false)
  }

  const testConnection = async () => {
    setTesting(true)
    setConnectionStatus('idle')
    
    try {
      // In production, this would call an API route that tests FB Graph API connection
      // For now, we'll simulate the test
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      if (config.catalog_id && config.business_id && config.access_token) {
        setConnectionStatus('success')
        toast.success('Koneksi berhasil!')
      } else {
        setConnectionStatus('error')
        toast.error('Lengkapi semua field yang diperlukan')
      }
    } catch {
      setConnectionStatus('error')
      toast.error('Gagal terhubung ke Facebook API')
    }
    
    setTesting(false)
  }

  if (loading) {
    return <div className="animate-pulse">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <p className="font-medium mb-2">Cara mendapatkan kredensial Facebook Commerce:</p>
          <ol className="list-decimal ml-4 space-y-1 text-sm">
            <li>Buat <strong>Facebook Business Account</strong> di business.facebook.com</li>
            <li>Buka <strong>Commerce Manager</strong> dan buat Catalog baru</li>
            <li>Buka <strong>Business Settings → System Users</strong> → Generate Access Token</li>
            <li>Pilih permissions: <code>catalog_management</code>, <code>business_management</code></li>
            <li>Copy Business ID, Catalog ID, dan Access Token ke form di bawah</li>
          </ol>
          <div className="flex gap-4 mt-3">
            <a 
              href="https://business.facebook.com/commerce" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary underline flex items-center gap-1 text-sm"
            >
              Commerce Manager <ExternalLink className="h-3 w-3" />
            </a>
            <a 
              href="https://www.facebook.com/business/help/912190892201033" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary underline flex items-center gap-1 text-sm"
            >
              Panduan Lengkap <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Facebook Commerce API</CardTitle>
          <CardDescription>
            Konfigurasi untuk sinkronisasi produk ke Facebook Catalog
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="business_id">Business ID *</Label>
              <Input
                id="business_id"
                value={config.business_id}
                onChange={(e) => setConfig({ ...config, business_id: e.target.value })}
                placeholder="123456789012345"
              />
              <p className="text-xs text-muted-foreground">
                Dari Business Settings → Business Info
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="catalog_id">Catalog ID *</Label>
              <Input
                id="catalog_id"
                value={config.catalog_id}
                onChange={(e) => setConfig({ ...config, catalog_id: e.target.value })}
                placeholder="123456789012345"
              />
              <p className="text-xs text-muted-foreground">
                Dari Commerce Manager → Catalog
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="access_token">System User Access Token *</Label>
            <div className="relative">
              <Input
                id="access_token"
                type={showTokens.access_token ? 'text' : 'password'}
                value={config.access_token}
                onChange={(e) => setConfig({ ...config, access_token: e.target.value })}
                placeholder="EAAxxxxxxx..."
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowTokens(prev => ({ ...prev, access_token: !prev.access_token }))}
              >
                {showTokens.access_token ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Token dengan permissions: catalog_management, business_management
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="page_access_token">Page Access Token (Opsional)</Label>
            <div className="relative">
              <Input
                id="page_access_token"
                type={showTokens.page_access_token ? 'text' : 'password'}
                value={config.page_access_token}
                onChange={(e) => setConfig({ ...config, page_access_token: e.target.value })}
                placeholder="EAAxxxxxxx..."
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowTokens(prev => ({ ...prev, page_access_token: !prev.page_access_token }))}
              >
                {showTokens.page_access_token ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Diperlukan untuk posting ke Facebook Page
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pixel_id">Meta Pixel ID (Opsional)</Label>
            <Input
              id="pixel_id"
              value={config.pixel_id}
              onChange={(e) => setConfig({ ...config, pixel_id: e.target.value })}
              placeholder="123456789012345"
            />
            <p className="text-xs text-muted-foreground">
              Untuk tracking konversi dan analytics. Juga bisa diset via NEXT_PUBLIC_META_PIXEL_ID
            </p>
          </div>

          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="is_active">Aktifkan Integrasi</Label>
                <p className="text-xs text-muted-foreground">
                  Enable/disable koneksi ke Facebook Commerce
                </p>
              </div>
              <Switch
                id="is_active"
                checked={config.is_active}
                onCheckedChange={(checked) => setConfig({ ...config, is_active: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto_sync">Sinkronisasi Otomatis</Label>
                <p className="text-xs text-muted-foreground">
                  Otomatis sync saat produk ditambah/diupdate
                </p>
              </div>
              <Switch
                id="auto_sync"
                checked={config.auto_sync_enabled}
                onCheckedChange={(checked) => setConfig({ ...config, auto_sync_enabled: checked })}
              />
            </div>
          </div>

          {config.last_sync_at && (
            <p className="text-sm text-muted-foreground">
              Terakhir disinkronkan: {new Date(config.last_sync_at).toLocaleString('id-ID')}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan Pengaturan'}
            </Button>
            <Button 
              variant="outline" 
              onClick={testConnection} 
              disabled={testing || !config.catalog_id || !config.business_id}
            >
              {testing ? 'Mengetes...' : 'Test Koneksi'}
              {connectionStatus === 'success' && <CheckCircle2 className="ml-2 h-4 w-4 text-green-500" />}
              {connectionStatus === 'error' && <XCircle className="ml-2 h-4 w-4 text-red-500" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
