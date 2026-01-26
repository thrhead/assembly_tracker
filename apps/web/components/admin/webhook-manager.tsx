
'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ActivityIcon, GlobeIcon, PlusIcon, Trash2Icon, ZapIcon } from 'lucide-react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { WebhookLogsDialog } from './webhook-logs-dialog'

interface Webhook {
    id: string
    url: string
    event: string
    isActive: boolean
    createdAt: string
}

const EVENTS = [
    { value: 'job.created', label: 'Yeni İş Oluşturuldu' },
    { value: 'job.updated', label: 'İş Güncellendi' },
    { value: 'job.completed', label: 'İş Tamamlandı' }
]

export function WebhookManager() {
    const [webhooks, setWebhooks] = useState<Webhook[]>([])
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState({ url: '', event: 'job.updated', secret: '' })
    const [submitting, setSubmitting] = useState(false)
    const [logsOpen, setLogsOpen] = useState(false)
    const [selectedWebhookId, setSelectedWebhookId] = useState<string | undefined>()

    useEffect(() => {
        fetchWebhooks()
    }, [])

    const fetchWebhooks = async () => {
        try {
            const res = await fetch('/api/admin/webhooks')
            const data = await res.json()
            setWebhooks(data)
        } catch (error) {
            toast.error('Webhooklar yüklenirken hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    const openLogs = (id?: string) => {
        setSelectedWebhookId(id)
        setLogsOpen(true)
    }

    const createWebhook = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.url.trim()) return

        setSubmitting(true)
        try {
            const res = await fetch('/api/admin/webhooks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            if (!res.ok) throw new Error()
            setFormData({ url: '', event: 'job.updated', secret: '' })
            fetchWebhooks()
            toast.success('Webhook başarıyla eklendi')
        } catch (error) {
            toast.error('Webhook eklenemedi')
        } finally {
            setSubmitting(false)
        }
    }

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await fetch(`/api/admin/webhooks/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus })
            })
            setWebhooks(webhooks.map(w => w.id === id ? { ...w, isActive: !currentStatus } : w))
            toast.success('Durum güncellendi')
        } catch (error) {
            toast.error('Güncelleme başarısız')
        }
    }

    const deleteWebhook = async (id: string) => {
        if (!confirm('Bu Webhook kaydını silmek istediğinize emin misiniz?')) return

        try {
            await fetch(`/api/admin/webhooks/${id}`, { method: 'DELETE' })
            setWebhooks(webhooks.filter(w => w.id !== id))
            toast.success('Webhook silindi')
        } catch (error) {
            toast.error('Silme işlemi başarısız')
        }
    }

    return (
        <div className="space-y-6">
            <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                            <ZapIcon className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Webhooks</h3>
                            <p className="text-xs text-muted-foreground">Olay bazlı anlık veri akışı (HTTP POST) tanımlayın.</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => openLogs()}>
                        <ActivityIcon className="w-4 h-4 mr-2" />
                        Tüm Günlükleri Gör
                    </Button>
                </div>

                <form onSubmit={createWebhook} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="md:col-span-2 space-y-2">
                        <Label>Hedef URL</Label>
                        <Input
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            placeholder="https://sisteminiz.com/webhook"
                            className="bg-background"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Olay Türü</Label>
                        <Select
                            value={formData.event}
                            onValueChange={(v) => setFormData({ ...formData, event: v })}
                        >
                            <SelectTrigger className="bg-background">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {EVENTS.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" disabled={submitting || !formData.url.trim()}>
                        <PlusIcon className="w-4 h-4 mr-2" />
                        Ekle
                    </Button>
                </form>
            </Card>

            <div className="space-y-3">
                {loading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                        <Card key={i} className="p-4 h-20 animate-pulse bg-muted/20" />
                    ))
                ) : webhooks.length > 0 ? (
                    webhooks.map((webhook) => (
                        <Card key={webhook.id} className="p-4 border-border flex items-center justify-between group hover:border-primary/30 transition-all">
                            <div className="flex items-center gap-4 shrink-0 overflow-hidden">
                                <div className={`p-2 rounded-full ${webhook.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
                                    <GlobeIcon className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold truncate max-w-[300px]">{webhook.url}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] px-1.5 py-0.5 bg-secondary rounded text-muted-foreground font-mono">
                                            {webhook.event}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground italic">
                                            {format(new Date(webhook.createdAt), 'd MMM yyyy', { locale: tr })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-[10px] h-8 text-primary"
                                    onClick={() => openLogs(webhook.id)}
                                >
                                    Günlükler
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`text-[10px] h-8 ${webhook.isActive ? 'text-amber-600' : 'text-emerald-600'}`}
                                    onClick={() => toggleStatus(webhook.id, webhook.isActive)}
                                >
                                    {webhook.isActive ? 'Durdur' : 'Başlat'}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => deleteWebhook(webhook.id)}
                                >
                                    <Trash2Icon className="w-4 h-4" />
                                </Button>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="p-8 text-center bg-muted/10 rounded-xl border-2 border-dashed border-muted text-muted-foreground text-xs">
                        Kayıtlı Webhook bulunamadı.
                    </div>
                )}
            </div>

            <WebhookLogsDialog
                open={logsOpen}
                onOpenChange={setLogsOpen}
                webhookId={selectedWebhookId}
            />
        </div>
    )
}
