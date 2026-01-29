'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import { ApprovalDialog } from '@/components/approvals/approval-dialog'
import Link from '@/lib/navigation'
import { CheckCircle2 } from 'lucide-react'

// Define type for serialized approval data
type SerializedApproval = {
    id: string
    notes?: string | null
    createdAt?: string | null
    job?: {
        id?: string
        title?: string
        customer?: { company?: string } | null
    } | null
    requester?: { name?: string | null; email?: string } | null
}

interface ApprovalsListClientProps {
    approvals: SerializedApproval[]
}

export function ApprovalsListClient({ approvals }: ApprovalsListClientProps) {
    if (!approvals || !Array.isArray(approvals)) {
        return (
            <div className="p-8 text-center text-gray-500">
                Veri yüklenemedi veya onay bekleyen iş yok.
            </div>
        )
    }

    const formatDate = (dateString?: string | null) => {
        if (!dateString) return '-'
        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return 'Geçersiz Tarih'
            return formatDistanceToNow(date, {
                addSuffix: true,
                locale: tr
            })
        } catch (e) {
            return '-'
        }
    }

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {approvals.length === 0 && (
                <div className="col-span-full text-center py-12 bg-white rounded-lg border border-dashed">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">Onay bekleyen iş bulunmuyor</h3>
                    <p className="text-gray-500 mt-1">Tüm işler onaylandı</p>
                </div>
            )}

            {approvals.map((approval) => (
                <Card key={approval.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-2">
                            <CardTitle className="text-lg line-clamp-2">{approval.job?.title || 'Bilinmeyen İş'}</CardTitle>
                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 shrink-0">
                                Bekliyor
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Müşteri:</span> {approval.job?.customer?.company || 'Bilinmeyen Müşteri'}
                            </p>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Talep Eden:</span> {approval.requester?.name || approval.requester?.email || 'Bilinmiyor'}
                            </p>
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Talep Tarihi:</span>{' '}
                                {formatDate(approval.createdAt)}
                            </p>
                        </div>

                        {approval.notes && (
                            <div className="bg-gray-50 p-2 rounded">
                                <p className="text-xs text-gray-600">
                                    <span className="font-medium">Not:</span> {approval.notes}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-2">
                            {approval.job && (
                                <Button variant="outline" className="flex-1" asChild>
                                    <Link href={`/admin/jobs/${approval.job.id}`}>
                                        Detayları İncele
                                    </Link>
                                </Button>
                            )}
                            <ApprovalDialog approval={approval} />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
