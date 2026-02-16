'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { KeyIcon, PlusIcon, Trash2Icon, CopyIcon, CheckIcon, ShieldCheckIcon, ClockIcon } from 'lucide-react'
import { toast } from 'sonner'
import { format, formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'

interface ApiKey {
    id: string
    name: string
    scopes: string[]
    isActive: boolean
    lastUsedAt: string | null
    createdAt: string
}

const AVAILABLE_SCOPES = [
    { id: 'jobs:read', label: 'İşleri Görüntüle' },
    { id: 'jobs:write', label: 'İşleri Düzenle/Oluştur' },
    { id: 'teams:read', label: 'Ekipleri Görüntüle' },
    { id: 'costs:read', label: 'Maliyetleri Görüntüle' },
    { id: 'analytics:read', label: 'Raporları Görüntüle' }
]

export function ApiKeyManager() {
    const [keys, setKeys] = useState<ApiKey[]>([])
    const [loading, setLoading] = useState(true)
    const [newName, setNewName] = useState('')
    const [selectedScopes, setSelectedScopes] = useState<string[]>(['jobs:read'])
    const [creating, setCreating] = useState(false)
    const [newKeyData, setNewKeyData] = useState<{ name: string, apiKey: string } | null>(null)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        fetchKeys()
    }, [])

    const fetchKeys = async () => {
        try {
            const res = await fetch('/api/admin/api-keys')
            const data = await res.json()
            setKeys(data)
        } catch (error) {
            toast.error('Anahtarlar yüklenirken hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    const createKey = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newName.trim()) return

        setCreating(true)
        try {
            const res = await fetch('/api/admin/api-keys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    name: newName,
                    scopes: selectedScopes
                })
            })
            const data = await res.json()
            setNewKeyData(data)
            setNewName('')
            setSelectedScopes(['jobs:read'])
            fetchKeys()
            toast.success('API anahtarı oluşturuldu')
        } catch (error) {
            toast.error('Anahtar oluşturulamadı')
        } finally {
            setCreating(false)
        }
    }

    const toggleScope = (scopeId: string) => {
        setSelectedScopes(prev => 
            prev.includes(scopeId) 
                ? prev.filter(s => s !== scopeId) 
                : [...prev, scopeId]
        )
    }

    const toggleStatus = async (id: string, currentStatus: boolean) => {
        try {
            await fetch(`/api/admin/api-keys/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus })
            })
            setKeys(keys.map(k => k.id === id ? { ...k, isActive: !currentStatus } : k))
            toast.success('Durum güncellendi')
        } catch (error) {
            toast.error('Güncelleme başarısız')
        }
    }

    const deleteKey = async (id: string) => {
        if (!confirm('Bu API anahtarını silmek istediğinize emin misiniz?')) return

        try {
            await fetch(`/api/admin/api-keys/${id}`, { method: 'DELETE' })
            setKeys(keys.filter(k => k.id !== id))
            toast.success('Anahtar silindi')
        } catch (error) {
            toast.error('Silme işlemi başarısız')
        }
    }

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
        toast.info('Panoya kopyalandı')
    }

    return (
        <div className="space-y-6">
            <Card className="p-6 border-border bg-card/50 backdrop-blur-sm">
                <div className="flex items-center gap-4 mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <KeyIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Yeni API Erişimi Tanımla</h3>
                        <p className="text-xs text-muted-foreground">Dış sistemler için yetkilendirilmiş anahtarlar oluşturun.</p>
                    </div>
                </div>

                <form onSubmit={createKey} className="space-y-6">
                    <div className="flex gap-4 items-end max-w-md">
                        <div className="flex-1 space-y-2">
                            <Label htmlFor="keyName">Anahtar İsmi</Label>
                            <Input
                                id="keyName"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Örn: SAP Entegrasyonu"
                                className="bg-background"
                            />
                        </div>
                        <Button type="submit" disabled={creating || !newName.trim() || selectedScopes.length === 0}>
                            <PlusIcon className="w-4 h-4 mr-2" />
                            Oluştur
                        </Button>
                    </div>

                    <div className="space-y-3">
                        <Label>Yetki Kapsamı (Scopes)</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {AVAILABLE_SCOPES.map(scope => (
                                <div key={scope.id} className="flex items-center space-x-2 p-2 rounded-lg border border-transparent hover:bg-muted/50 transition-colors">
                                    <Checkbox 
                                        id={scope.id} 
                                        checked={selectedScopes.includes(scope.id)}
                                        onCheckedChange={() => toggleScope(scope.id)}
                                    />
                                    <label htmlFor={scope.id} className="text-xs font-medium leading-none cursor-pointer">
                                        {scope.label}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </form>

                {newKeyData && (
                    <Alert className="mt-6 border-primary/50 bg-primary/5">
                        <ShieldCheckIcon className="h-4 w-4 text-primary" />
                        <AlertTitle className="font-bold text-primary">Yeni API Anahtarınız Hazır!</AlertTitle>
                        <AlertDescription className="space-y-4">
                            <p className="text-sm mt-2">
                                Bu anahtar güvenlik nedeniyle **sadece bir kez** gösterilecektir. Lütfen güvenli bir yere kaydedin.
                            </p>
                            <div className="flex items-center gap-2 p-3 bg-background rounded-lg border border-primary/20 break-all font-mono text-xs select-all">
                                <span>{newKeyData.apiKey}</span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 ml-auto shrink-0"
                                    onClick={() => copyToClipboard(newKeyData.apiKey)}
                                >
                                    {copied ? <CheckIcon className="h-4 w-4 text-emerald-500" /> : <CopyIcon className="h-4 w-4" />}
                                </Button>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setNewKeyData(null)}>
                                Anladım, Güvenli Bir Yere Kaydettim
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {loading ? (
                    Array.from({ length: 2 }).map((_, i) => (
                        <Card key={i} className="p-6 h-40 animate-pulse bg-muted/20" />
                    ))
                ) : keys.length > 0 ? (
                    keys.map((key) => (
                        <Card key={key.id} className="p-5 border-border hover:border-primary/30 transition-all flex flex-col gap-4">
                            <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                    <h4 className="font-bold text-sm">{key.name}</h4>
                                    <p className="text-[10px] text-muted-foreground">
                                        Oluşturulma: {format(new Date(key.createdAt), 'd MMM yyyy', { locale: tr })}
                                    </p>
                                </div>
                                <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${key.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-muted text-muted-foreground'}`}>
                                    {key.isActive ? 'Aktif' : 'Pasif'}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-1">
                                {key.scopes.map(scope => (
                                    <Badge key={scope} variant="secondary" className="text-[9px] px-1.5 py-0">
                                        {scope}
                                    </Badge>
                                ))}
                            </div>

                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-muted">
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <ClockIcon className="w-3 h-3" />
                                    <span className="text-[10px]">
                                        {key.lastUsedAt 
                                            ? `Son kullanım: ${formatDistanceToNow(new Date(key.lastUsedAt), { addSuffix: true, locale: tr })}`
                                            : 'Hiç kullanılmadı'}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className={`text-[10px] h-7 px-2 ${key.isActive ? 'text-amber-600' : 'text-emerald-600'}`}
                                        onClick={() => toggleStatus(key.id, key.isActive)}
                                    >
                                        {key.isActive ? 'Durdur' : 'Aktif Et'}
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-[10px] h-7 px-2 text-destructive"
                                        onClick={() => deleteKey(key.id)}
                                    >
                                        <Trash2Icon className="w-3 h-3 mr-1" />
                                        Sil
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full p-12 text-center bg-muted/10 rounded-2xl border-2 border-dashed border-muted">
                        <p className="text-muted-foreground text-sm">Henüz bir API anahtarı oluşturulmamış.</p>
                    </div>
                )}
            </div>
        </div>
    )
}