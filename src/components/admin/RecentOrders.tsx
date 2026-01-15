"use client"

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface RecentOrder {
  id: string
  order_number: string
  total: number
  status: string | null
  created_at: string | null
  user: {
    full_name: string | null
    email: string
  }
}

interface RecentOrdersProps {
  orders: RecentOrder[]
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

function formatDate(dateString: string | null): string {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getStatusBadge(status: string | null) {
  if (!status) return <Badge variant="secondary">Unknown</Badge>
  
  const statusConfig = {
    pending_payment: { label: 'Menunggu Pembayaran', variant: 'secondary' as const },
    paid: { label: 'Dibayar', variant: 'default' as const },
    processing: { label: 'Diproses', variant: 'default' as const },
    shipped: { label: 'Dikirim', variant: 'default' as const },
    delivered: { label: 'Terkirim', variant: 'default' as const },
    completed: { label: 'Selesai', variant: 'default' as const },
    cancelled: { label: 'Dibatalkan', variant: 'destructive' as const },
    refunded: { label: 'Dikembalikan', variant: 'destructive' as const }
  }

  const config = statusConfig[status as keyof typeof statusConfig] || { 
    label: status, 
    variant: 'secondary' as const 
  }

  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  )
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pesanan Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Belum ada pesanan
            </p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <Link 
                    href={`/admin/orders/${order.id}`}
                    className="font-medium hover:underline"
                  >
                    {order.order_number}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {order.user.full_name || order.user.email}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-medium">{formatCurrency(Number(order.total))}</p>
                  {getStatusBadge(order.status)}
                </div>
              </div>
            ))
          )}
        </div>
        
        {orders.length > 0 && (
          <div className="mt-4 text-center">
            <Link 
              href="/admin/orders"
              className="text-sm text-primary hover:underline"
            >
              Lihat Semua Pesanan
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}