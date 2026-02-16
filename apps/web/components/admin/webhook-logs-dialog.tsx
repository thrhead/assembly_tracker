
'use client'

import React, { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ActivityIcon, AlertCircleIcon, CheckCircle2Icon, ClockIcon, RotateCwIcon } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { toast } from 'sonner'

interface WebhookLog {
    id: string
    webhookId: string
    event: string
    statusCode: number | null
    status: 'PENDING' | 'SUCCESS' | 'FAILED'
    attemptCount: number
    error: string | null
    nextAttemptAt: string | null
    createdAt: string
    webhook: {
        url: string
        event: string
    }
}

interface WebhookLogsDialogProps {
    webhookId?: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function WebhookLogsDialog({ webhookId, open, onOpenChange }: WebhookLogsDialogProps) {
    const [logs, setLogs] = useState<WebhookLog[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (open) {
            fetchLogs()
        }
    }, [open, webhookId])

    const fetchLogs = async () => {
        setLoading(true)
        try {
            const url = webhookId
                ? `/api/admin/webhooks/logs?webhookId=${webhookId}`
                : '/api/admin/webhooks/logs'
            const res = await fetch(url)
            const data = await res.json()
            setLogs(data)
        } catch (error) {
            toast.error('Loglar yüklenirken hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    const retryWebhook = async (id: string) => {
        try {
            const res = await fetch('/api/admin/webhooks/logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ logId: id })
            })
            if (res.ok) {
                toast.success('Yeniden deneme başlatıldı')
                setTimeout(fetchLogs, 2000) // Refresh after a short delay
            } else {
                throw new Error()
            }
        } catch (error) {
            toast.error('İşlem başarısız')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <DialogTitle className="flex items-center gap-2">
                                <ActivityIcon className="w-5 h-5 text-primary" />
                                Webhook Gönderim Günlükleri
                            </DialogTitle>
                            <DialogDescription>
                                Tüm webhook gönderim denemelerini ve durumlarını buradan izleyebilirsiniz.
                            </DialogDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={fetchLogs} disabled={loading}>
                            <RotateCwIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Yenile
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 mt-4 border rounded-md overflow-auto">
                    <Table>
                        <TableHeader className="bg-muted/50 sticky top-0 z-10">
                            <TableRow>
                                <TableHead>Tarih</TableHead>
                                <TableHead>Olay</TableHead>
                                <TableHead>Durum</TableHead>
                                <TableHead>Deneme</TableHead>
                                <TableHead>Kod</TableHead>
                                <TableHead className="text-right">İşlem</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        Yükleniyor...
                                    </TableCell>
                                </TableRow>
                            ) : logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        Gönderim kaydı bulunamadı.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map((log) => (
                                    <TableRow key={log.id} className="group">
                                        <TableCell className="text-xs">
                                            {format(new Date(log.createdAt), 'dd.MM.yyyy HH:mm:ss', { locale: tr })}
                                        </TableCell>
                                        <TableCell>
                                            <code className="text-[10px] bg-secondary px-1.5 py-0.5 rounded">
                                                {log.event}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            {log.status === 'SUCCESS' ? (
                                                <div className="flex items-center gap-1.5 text-emerald-600 text-xs">
                                                    <CheckCircle2Icon className="w-3.5 h-3.5" />
                                                    Başarılı
                                                </div>
                                            ) : log.status === 'FAILED' ? (
                                                <div className="flex items-center gap-1.5 text-destructive text-xs">
                                                    <AlertCircleIcon className="w-3.5 h-3.5" />
                                                    Hata
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-amber-600 text-xs">
                                                    <ClockIcon className="w-3.5 h-3.5" />
                                                    Bekliyor
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-center text-xs">
                                            {log.attemptCount}
                                        </TableCell>
                                        <TableCell className="text-xs font-mono">
                                            {log.statusCode || '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {log.status !== 'SUCCESS' && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-2 text-[10px]"
                                                    onClick={() => retryWebhook(log.id)}
                                                >
                                                    <RotateCwIcon className="w-3 h-3 mr-1" />
                                                    Tekrar Dene
                                                </Button>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </DialogContent>
        </Dialog>
    )
}
