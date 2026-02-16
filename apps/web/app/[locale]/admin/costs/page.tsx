'use client'

import { useEffect, useState, Suspense } from 'react'
import Image from 'next/image'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { toast } from 'sonner'
import { CheckCircle2Icon, XCircleIcon, ExternalLinkIcon, Loader2, Trash2, AlertTriangle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { CostListSkeleton } from '@/components/skeletons/cost-list-skeleton'
import ReportFilters from '@/components/admin/reports/ReportFilters'
import { useRouter } from '@/lib/navigation'
import { useSearchParams } from 'next/navigation'
import { getJobsListForFilter, getCategoriesForFilter } from '@/lib/data/reports'

interface Cost {
    id: string
    amount: number
    currency: string
    category: string
    description: string
    date: string
    status: string
    receiptUrl?: string
    rejectionReason?: string
    job: {
        title: string
        customer: {
            company: string
        }
    }
    createdBy: {
        name: string
        email: string
    }
    approvedBy?: {
        name: string
    }
}

function CostsTable() {
    const searchParams = useSearchParams()
    const [costs, setCosts] = useState<Cost[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null)
    const [rejectDialog, setRejectDialog] = useState<{ id: string, open: boolean }>({ id: '', open: false })
    const [rejectionReason, setRejectionReason] = useState('')
    const [processing, setProcessing] = useState<string | null>(null)

    // Delete states
    const [deleteDialog, setDeleteDialog] = useState<{ id: string, open: boolean }>({ id: '', open: false })
    const [doubleConfirmDialog, setDoubleConfirmDialog] = useState(false)
    const [deleting, setDeleting] = useState(false)

    // Data for filters
    const [filterJobs, setFilterJobs] = useState<any[]>([])
    const [filterCategories, setFilterCategories] = useState<string[]>([])

    useEffect(() => {
        // Fetch filter options
        const loadFilters = async () => {
            // Hardcoded categories as requested
            setFilterCategories(['Yemek', 'Yol', 'Yakıt', 'Konaklama', 'Malzeme', 'Diğer', 'OTHER']);

            try {
                // Fetch basic jobs list for filter
                const res = await fetch('/api/admin/jobs?limit=100');
                if (res.ok) {
                    const data = await res.json();
                    // API returns array of jobs, not { jobs: [...] }
                    if (Array.isArray(data)) {
                        setFilterJobs(data.map((j: any) => ({
                            id: j.id,
                            title: j.customer?.company ? `${j.title} - ${j.customer.company}` : j.title
                        })));
                    } else if (data.jobs && Array.isArray(data.jobs)) {
                        // Fallback in case API changes
                        setFilterJobs(data.jobs.map((j: any) => ({
                            id: j.id,
                            title: j.customer?.company ? `${j.title} - ${j.customer.company}` : j.title
                        })));
                    }
                }
            } catch (e) {
                console.error(e)
            }
        }
        loadFilters()
    }, [])

    useEffect(() => {
        fetchCosts()
    }, [searchParams])

    const fetchCosts = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams(searchParams.toString())
            // Fix: ReportFilters uses 'jobStatus' but our API expects 'status' for Cost Status if we wanted that. 
            // But ReportFilters 'jobStatus' is strictly for Job Status (Active/Completed). 
            // If we want to filter by Cost Status (Pending vs Approved), we need a separate filter or map it.
            // For now, just pass all params. API needs to handle 'jobStatus' if we want that filter to work.
            const res = await fetch(`/api/admin/costs?${params.toString()}`)
            if (res.ok) {
                const data = await res.json()
                setCosts(data)
            }
        } catch (error) {
            console.error('Failed to fetch costs:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateStatus = async (id: string, status: 'APPROVED' | 'REJECTED', reason?: string) => {
        setProcessing(id)
        try {
            const res = await fetch(`/api/admin/costs/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, rejectionReason: reason })
            })

            if (res.ok) {
                fetchCosts()
                setRejectDialog({ id: '', open: false })
                setRejectionReason('')
                toast.success('Durum güncellendi')
            } else {
                toast.error('İşlem başarısız')
            }
        } catch (error) {
            console.error(error)
            toast.error('Bir hata oluştu')
        } finally {
            setProcessing(null)
        }
    }

    const handleDelete = async () => {
        if (!deleteDialog.id) return
        setDeleting(true)
        try {
            const res = await fetch(`/api/admin/costs/${deleteDialog.id}`, {
                method: 'DELETE'
            })
            if (res.ok) {
                toast.success('Masraf silindi')
                fetchCosts()
                setDeleteDialog({ id: '', open: false })
                setDoubleConfirmDialog(false)
            } else {
                toast.error('Silme işlemi başarısız')
            }
        } catch (error) {
            console.error(error)
            toast.error('Bir hata oluştu')
        } finally {
            setDeleting(false)
        }
    }

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency }).format(amount)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED':
                return <Badge className="bg-green-600">Onaylandı</Badge>
            case 'REJECTED':
                return <Badge variant="destructive">Reddedildi</Badge>
            default:
                return <Badge variant="secondary">Bekliyor</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                {/* Filters - Passing empty arrays for now as fetching them in client component requires API endpoints or server wrapper */}
                {/* To make it work properly, one should refactor this page to Server Component, but that's a larger task. */}
                {/* We will rely on the Filter component's internal state for dates/status, but Dropdowns for Jobs/Categories might be empty without data. */}
                {/* Let's try to pass simple static options or skip job/category filter for now? User asked for filters. */}
                {/* WORKAROUND: We will assume ReportFilters handles URL state correctly, we just need to render it. */}
                {/* For Job/Category data, we really need a server wrapper. Let's create a server wrapper in the same file if possible? No, 'use client' is at top. */}
                {/* I will add a fetch for filter data in the useEffect. */}

                <Suspense fallback={<div>Filtreler yükleniyor...</div>}>
                    <ReportFilters
                        jobs={filterJobs} // Needs data
                        categories={filterCategories} // Needs data
                    />
                </Suspense>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Tüm Masraflar</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <CostListSkeleton />
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tarih</TableHead>
                                    <TableHead>İş / Müşteri</TableHead>
                                    <TableHead>Ekleyen</TableHead>
                                    <TableHead>Kategori</TableHead>
                                    <TableHead>Açıklama</TableHead>
                                    <TableHead>Tutar</TableHead>
                                    <TableHead>Fiş</TableHead>
                                    <TableHead>Durum</TableHead>
                                    <TableHead className="text-right">İşlemler</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {costs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                                            Kayıt bulunamadı
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    costs.map((cost) => (
                                        <TableRow key={cost.id}>
                                            <TableCell>
                                                {format(new Date(cost.date), 'd MMM yyyy', { locale: tr })}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{cost.job.title}</div>
                                                <div className="text-xs text-muted-foreground">{cost.job.customer.company}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{cost.createdBy.name}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{cost.category}</Badge>
                                            </TableCell>
                                            <TableCell className="max-w-[200px] truncate" title={cost.description}>
                                                {cost.description}
                                            </TableCell>
                                            <TableCell className="font-bold">
                                                {formatCurrency(cost.amount, cost.currency)}
                                            </TableCell>
                                            <TableCell>
                                                {cost.receiptUrl ? (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setSelectedReceipt(cost.receiptUrl!)}
                                                    >
                                                        <ExternalLinkIcon className="h-4 w-4" />
                                                    </Button>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {getStatusBadge(cost.status)}
                                                {cost.status === 'REJECTED' && cost.rejectionReason && (
                                                    <div className="text-xs text-red-500 mt-1">{cost.rejectionReason}</div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    {cost.status === 'PENDING' && (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-green-600 hover:text-green-700 hover:bg-green-50"
                                                                onClick={() => handleUpdateStatus(cost.id, 'APPROVED')}
                                                                disabled={processing === cost.id}
                                                            >
                                                                {processing === cost.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2Icon className="h-4 w-4" />}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                onClick={() => setRejectDialog({ id: cost.id, open: true })}
                                                                disabled={processing === cost.id}
                                                            >
                                                                <XCircleIcon className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-gray-400 hover:text-red-600 hover:bg-red-50"
                                                        onClick={() => setDeleteDialog({ id: cost.id, open: true })}
                                                        title="Sil"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Receipt Preview Dialog */}
            <Dialog open={!!selectedReceipt} onOpenChange={(open) => !open && setSelectedReceipt(null)}>
                <DialogContent className="max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Fiş Görüntüle</DialogTitle>
                    </DialogHeader>
                    {selectedReceipt && (
                        <div className="relative h-[60vh] w-full rounded-md overflow-hidden bg-black/5 flex items-center justify-center">
                            <Image 
                                src={selectedReceipt} 
                                alt="Receipt" 
                                fill 
                                className="object-contain" 
                                unoptimized 
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Rejection Dialog */}
            <Dialog open={rejectDialog.open} onOpenChange={(open) => setRejectDialog(prev => ({ ...prev, open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Red Nedeni</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Açıklama</Label>
                            <Input
                                placeholder="Neden reddedildiğini yazın..."
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setRejectDialog({ id: '', open: false })}>İptal</Button>
                            <Button
                                variant="destructive"
                                onClick={() => handleUpdateStatus(rejectDialog.id, 'REJECTED', rejectionReason)}
                                disabled={!rejectionReason || processing === rejectDialog.id}
                            >
                                {processing === rejectDialog.id && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Reddet
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog 1 */}
            <Dialog open={deleteDialog.open && !doubleConfirmDialog} onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Maliyet Silinecek</DialogTitle>
                        <DialogDescription>
                            Bu maliyet kaydını silmek istediğinizden emin misiniz?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog({ id: '', open: false })}>İptal</Button>
                        <Button variant="destructive" onClick={() => setDoubleConfirmDialog(true)}>Sil</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog 2 (Double Confirm) */}
            <Dialog open={doubleConfirmDialog} onOpenChange={(open) => {
                if (!open) {
                    setDoubleConfirmDialog(false)
                    setDeleteDialog({ id: '', open: false })
                }
            }}>
                <DialogContent className="border-red-500 border-2">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            DİKKAT! Kesin Olarak Siliniyor
                        </DialogTitle>
                        <DialogDescription className="font-bold text-gray-700 pt-2">
                            Bu işlem geri alınamaz! Veritabanından kalıcı olarak silinecektir. Devam etmek istiyor musunuz?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-red-50 p-3 rounded-md text-sm text-red-800 my-2">
                        Onayladıktan sonra bu kayda bir daha ulaşılamayacaktır.
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setDoubleConfirmDialog(false)
                            setDeleteDialog({ id: '', open: false })
                        }}>Vazgeç</Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleting}
                            className="bg-red-700 hover:bg-red-800"
                        >
                            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Evet, Kalıcı Olarak Sil
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default function CostsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Maliyet Yönetimi</h2>
            </div>
            <Suspense fallback={<CostListSkeleton />}>
                <CostsTable />
            </Suspense>
        </div>
    )
}
