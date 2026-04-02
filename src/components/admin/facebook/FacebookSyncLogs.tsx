'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { RefreshCw, CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react'

interface SyncLog {
  id: string
  action: string
  product_count: number | null
  success_count: number | null
  error_count: number | null
  error_details: unknown
  started_at: string | null
  completed_at: string | null
  duration_ms: number | null
  created_by: string | null
}

export function FacebookSyncLogs() {
  const [logs, setLogs] = useState<SyncLog[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const loadLogs = useCallback(async () => {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('fb_sync_logs')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(50)
    
    if (error) {
      toast.error('Gagal memuat riwayat sync')
    } else {
      setLogs(data || [])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadLogs()
  }, [loadLogs])

  const getActionBadge = (action: string) => {
    const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
      bulk_sync: { label: 'Bulk Sync', variant: 'default' },
      initial_sync: { label: 'Initial Sync', variant: 'default' },
      create: { label: 'Create', variant: 'secondary' },
      update: { label: 'Update', variant: 'secondary' },
      delete: { label: 'Delete', variant: 'outline' },
    }
    const config = variants[action] || { label: action, variant: 'outline' as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getStatusIcon = (log: SyncLog) => {
    if (!log.completed_at) {
      return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />
    }
    if (log.error_count === 0) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    }
    if ((log.success_count ?? 0) > 0) {
      return <CheckCircle2 className="h-4 w-4 text-yellow-500" />
    }
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const formatDuration = (ms: number | null) => {
    if (!ms) return '-'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  const hasErrorDetails = (details: unknown): details is Array<unknown> => {
    return Array.isArray(details) && details.length > 0
  }

  if (loading) {
    return <div className="animate-pulse">Loading logs...</div>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Riwayat Sinkronisasi</CardTitle>
          <CardDescription>
            Log semua operasi sinkronisasi ke Facebook Catalog
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={loadLogs}>
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Belum ada riwayat sinkronisasi
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Waktu</TableHead>
                  <TableHead>Aksi</TableHead>
                  <TableHead className="text-right">Produk</TableHead>
                  <TableHead className="text-right">Berhasil</TableHead>
                  <TableHead className="text-right">Gagal</TableHead>
                  <TableHead className="text-right">Durasi</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <>
                    <TableRow key={log.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>{getStatusIcon(log)}</TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {log.started_at ? new Date(log.started_at).toLocaleDateString('id-ID') : '-'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {log.started_at ? new Date(log.started_at).toLocaleTimeString('id-ID') : '-'}
                        </div>
                      </TableCell>
                      <TableCell>{getActionBadge(log.action)}</TableCell>
                      <TableCell className="text-right">{log.product_count ?? 0}</TableCell>
                      <TableCell className="text-right text-green-600">{log.success_count ?? 0}</TableCell>
                      <TableCell className="text-right text-red-600">{log.error_count ?? 0}</TableCell>
                      <TableCell className="text-right">{formatDuration(log.duration_ms)}</TableCell>
                      <TableCell>
                        {hasErrorDetails(log.error_details) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                          >
                            {expandedId === log.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                    {expandedId === log.id && log.error_details && (
                      <TableRow>
                        <TableCell colSpan={8} className="bg-muted/30">
                          <div className="p-4">
                            <h4 className="font-medium mb-2">Error Details:</h4>
                            <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.error_details, null, 2)}
                            </pre>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
