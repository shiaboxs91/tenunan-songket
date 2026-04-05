import { ColorManagement } from '@/components/admin/ColorManagement'

export default function AdminColorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Warna</h1>
        <p className="text-muted-foreground">
          Kelola kategori warna untuk produk tenunan songket
        </p>
      </div>

      <ColorManagement />
    </div>
  )
}
