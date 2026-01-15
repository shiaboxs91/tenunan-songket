import { notFound } from 'next/navigation'
import { ProductForm } from '@/components/admin/ProductForm'
import { getProductById } from '@/lib/supabase/products'

interface EditProductPageProps {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params
  const product = await getProductById(id)

  if (!product) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Produk</h1>
        <p className="text-muted-foreground">
          Edit produk: {product.title}
        </p>
      </div>

      <ProductForm product={product} />
    </div>
  )
}