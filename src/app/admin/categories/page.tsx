import { CategoryManagement } from '@/components/admin/CategoryManagement'

export default function AdminCategoriesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Kategori</h1>
        <p className="text-muted-foreground">
          Kelola kategori produk tenunan songket
        </p>
      </div>

      <CategoryManagement />
    </div>
  )
}