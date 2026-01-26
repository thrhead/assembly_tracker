
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { DownloadIcon, FileIcon, SearchIcon, Trash2Icon, RefreshCwIcon, ArrowLeftIcon } from 'lucide-react'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Link } from '@/lib/navigation'
import { toast } from 'sonner'

interface StoredReport {
    filename: string
    createdAt: string
}

export default function ExportsPage() {
    const [reports, setReports] = useState<StoredReport[]>([])
    const [loading, setLoading] = useState(true)
    const [selected, setSelected] = useState<string[]>([])
    const [search, setSearch] = useState('')

    useEffect(() => {
        fetchReports()
    }, [])

    const fetchReports = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/reports/list') // Need to create this
            const data = await res.json()
            setReports(data)
        } catch (error) {
            toast.error('Raporlar yüklenirken hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    const toggleSelect = (id: string) => {
        setSelected(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        )
    }

    const selectAll = () => {
        if (selected.length === filteredReports.length) {
            setSelected([])
        } else {
            setSelected(filteredReports.map(r => r.filename))
        }
    }

    const filteredReports = reports.filter(r =>
        r.filename.toLowerCase().includes(search.toLowerCase())
    )

    const downloadSelected = async () => {
        if (selected.length === 0) return
        toast.info(`${selected.length} dosya indiriliyor...`)

        // Simple sequential download or ZIP (ZIP is better but requires jszip lib)
        // For now, we'll open them or trigger download
        for (const filename of selected) {
            window.open(`/api/v1/reports/download/${filename}`, '_blank')
        }
    }

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/reports">
                        <Button variant="ghost" size="icon">
                            <ArrowLeftIcon className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold">Dışa Aktarmalar</h1>
                        <p className="text-sm text-muted-foreground">Oluşturulan PDF raporlarını yönetin ve indirin.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={fetchReports} disabled={loading}>
                        <RefreshCwIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                        Yenile
                    </Button>
                    {selected.length > 0 && (
                        <Button onClick={downloadSelected}>
                            <DownloadIcon className="w-4 h-4 mr-2" />
                            {selected.length} Dosyayı İndir
                        </Button>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3 border-b">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                className="w-full pl-9 pr-4 py-2 bg-muted/50 rounded-md text-sm outline-none focus:ring-1 focus:ring-primary"
                                placeholder="Dosya adı ile ara..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Checkbox
                                checked={selected.length > 0 && selected.length === filteredReports.length}
                                onCheckedChange={selectAll}
                            />
                            <span className="text-muted-foreground">Tümünü Seç</span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y max-h-[60vh] overflow-auto">
                        {loading && reports.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground">Yükleniyor...</div>
                        ) : filteredReports.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground">Rapor bulunamadı.</div>
                        ) : (
                            filteredReports.map((report) => (
                                <div key={report.filename} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <Checkbox
                                            checked={selected.includes(report.filename)}
                                            onCheckedChange={() => toggleSelect(report.filename)}
                                        />
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                                                <FileIcon className="w-5 h-5 text-red-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-sm">{report.filename}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {format(new Date(report.createdAt), 'dd MMMM yyyy, HH:mm', { locale: tr })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="ghost" size="icon" onClick={() => window.open(`/api/v1/reports/download/${report.filename}`, '_blank')}>
                                            <DownloadIcon className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
