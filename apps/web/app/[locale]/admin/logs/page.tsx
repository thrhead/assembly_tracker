'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
    Monitor,
    Smartphone,
    Server,
    Search,
    Trash2,
    RefreshCcw,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

export default function LogsPage() {
    const t = useTranslations('Admin.logs')
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [level, setLevel] = useState('all')
    const [platform, setPlatform] = useState('all')
    const [search, setSearch] = useState('')
    const [page, setPage] = useState(1)
    const [pagination, setPagination] = useState({ totalPages: 1, total: 0 })

    const fetchLogs = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '50'
            })
            if (level !== 'all') params.append('level', level)
            if (platform !== 'all') params.append('platform', platform)
            if (search) params.append('search', search)

            const res = await fetch(`/api/admin/logs?${params.toString()}`)
            const data = await res.json()
            setLogs(data.logs || [])
            setPagination(data.pagination || { totalPages: 1 })
        } catch (error) {
            toast.error('Logs could not be loaded')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchLogs()
    }, [page, level, platform])

    const handlePrune = async () => {
        if (!confirm(t('pruneConfirm'))) return

        try {
            const res = await fetch('/api/admin/logs', { method: 'DELETE' })
            const data = await res.json()
            if (data.success) {
                toast.success(data.message)
                fetchLogs()
            }
        } catch (error) {
            toast.error('Prune failed')
        }
    }

    const getLevelBadge = (level: string) => {
        switch (level) {
            case 'ERROR': return <Badge variant="destructive">{level}</Badge>
            case 'WARN': return <Badge className="bg-yellow-500 text-white border-none">{level}</Badge>
            case 'AUDIT': return <Badge className="bg-blue-500 text-white border-none">{level}</Badge>
            case 'INFO': return <Badge variant="secondary">{level}</Badge>
            default: return <Badge variant="outline">{level}</Badge>
        }
    }

    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case 'mobile': return <Smartphone className="w-4 h-4 text-primary" />
            case 'web': return <Monitor className="w-4 h-4 text-primary" />
            case 'server': return <Server className="w-4 h-4 text-primary" />
            default: return null
        }
    }

    return (
        <div className="p-4 sm:p-6 space-y-6 max-w-[1600px] mx-auto min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                    <p className="text-muted-foreground">{t('subtitle')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => fetchLogs()} disabled={loading}>
                        <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button variant="destructive" onClick={handlePrune} className="shadow-sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        <span className="hidden sm:inline">{t('prune')}</span>
                    </Button>
                </div>
            </div>

            <Card className="shadow-sm border-border/50 overflow-hidden">
                <CardHeader className="bg-muted/30 pb-4">
                    <div className="flex flex-wrap gap-3">
                        <div className="flex-1 min-w-[240px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={t('message') + '...'}
                                    className="pl-9 bg-background"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Select value={level} onValueChange={(val) => { setLevel(val); setPage(1); }}>
                                <SelectTrigger className="w-[130px] bg-background">
                                    <SelectValue placeholder={t('level')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tümü</SelectItem>
                                    <SelectItem value="ERROR">ERROR</SelectItem>
                                    <SelectItem value="WARN">WARN</SelectItem>
                                    <SelectItem value="INFO">INFO</SelectItem>
                                    <SelectItem value="DEBUG">DEBUG</SelectItem>
                                    <SelectItem value="AUDIT">AUDIT</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={platform} onValueChange={(val) => { setPlatform(val); setPage(1); }}>
                                <SelectTrigger className="w-[130px] bg-background">
                                    <SelectValue placeholder={t('platform')} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tümü</SelectItem>
                                    <SelectItem value="web">Web</SelectItem>
                                    <SelectItem value="mobile">Mobile</SelectItem>
                                    <SelectItem value="server">Server</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="relative overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow className="hover:bg-transparent border-none">
                                    <TableHead className="w-[100px] font-bold">{t('level')}</TableHead>
                                    <TableHead className="w-[120px] font-bold">{t('platform')}</TableHead>
                                    <TableHead className="font-bold">{t('message')}</TableHead>
                                    <TableHead className="w-[200px] font-bold">{t('user')}</TableHead>
                                    <TableHead className="w-[180px] text-right font-bold">{t('time')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell colSpan={5} className="py-8">
                                                <div className="h-6 w-full bg-muted animate-pulse rounded" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-40 text-center text-muted-foreground">
                                            {t('noLogs')}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log: any) => (
                                        <TableRow key={log.id} className="cursor-default group hover:bg-muted/30 transition-colors">
                                            <TableCell className="py-4">{getLevelBadge(log.level)}</TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="p-1.5 bg-background rounded-md border border-border/50 shadow-sm">
                                                        {getPlatformIcon(log.platform)}
                                                    </div>
                                                    <span className="capitalize text-xs font-semibold">{log.platform}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex flex-col gap-1 max-w-xl">
                                                    <span className="font-medium text-sm leading-tight">{log.message}</span>
                                                    {log.stack && (
                                                        <details className="text-[10px] text-muted-foreground cursor-pointer">
                                                            <summary className="hover:text-primary outline-none">View Stack Trace</summary>
                                                            <pre className="mt-2 p-3 bg-secondary/50 rounded-lg overflow-x-auto border border-border font-mono whitespace-pre text-[9px]">
                                                                {log.stack}
                                                            </pre>
                                                        </details>
                                                    )}
                                                    {log.context && (
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {Object.entries(log.context).map(([key, val]) => (
                                                                <span key={key} className="text-[9px] bg-secondary px-1.5 py-0.5 rounded text-muted-foreground">
                                                                    {key}: {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm">{log.user?.name || 'Sistem'}</span>
                                                    <span className="text-[10px] text-muted-foreground truncate max-w-[150px]">{log.user?.email || 'automatic@system'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-4 text-right">
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-bold">{format(new Date(log.createdAt), 'HH:mm:ss')}</span>
                                                    <span className="text-[10px] text-muted-foreground">{format(new Date(log.createdAt), 'dd MMM yyyy')}</span>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex items-center justify-between px-6 py-4 bg-muted/20 border-t">
                        <p className="text-xs text-muted-foreground font-medium">
                            Toplam <span className="text-foreground font-bold">{pagination.total}</span> kayıt bulundu
                        </p>
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1 || loading}
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </Button>
                            <div className="text-xs font-bold select-none">
                                {page} / {pagination.totalPages}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={page === pagination.totalPages || loading}
                            >
                                <ChevronRight className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
