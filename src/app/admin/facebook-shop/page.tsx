import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FacebookShopSettings } from '@/components/admin/facebook/FacebookShopSettings'
import { FacebookProductSync } from '@/components/admin/facebook/FacebookProductSync'
import { FacebookSyncLogs } from '@/components/admin/facebook/FacebookSyncLogs'
import { Store } from 'lucide-react'

export const metadata = {
  title: 'Facebook Shop - Admin | Tenunan Songket',
  description: 'Kelola integrasi Facebook Shop dan sinkronisasi produk',
}

export default function FacebookShopPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Store className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Facebook Shop</h1>
          <p className="text-sm text-muted-foreground">
            Sinkronisasi produk ke Facebook Catalog untuk dijual di Facebook & Instagram Shop
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings">Pengaturan</TabsTrigger>
          <TabsTrigger value="products">Sinkronisasi Produk</TabsTrigger>
          <TabsTrigger value="logs">Riwayat Sinkron</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings" className="space-y-4">
          <FacebookShopSettings />
        </TabsContent>
        
        <TabsContent value="products" className="space-y-4">
          <FacebookProductSync />
        </TabsContent>
        
        <TabsContent value="logs" className="space-y-4">
          <FacebookSyncLogs />
        </TabsContent>
      </Tabs>
    </div>
  )
}
