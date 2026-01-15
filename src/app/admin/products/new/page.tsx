import { ProductForm } from '@/components/admin/ProductForm'

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Tambah Produk Baru</h1>
        <p className="text-muted-foreground">
          Buat produk tenunan songket baru
        </p>
      </div>

      <ProductForm />
    </div>
  )
}