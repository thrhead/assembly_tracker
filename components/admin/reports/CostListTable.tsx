"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface Cost {
    id: string;
    description: string;
    amount: number;
    category: string | null;
    status: string;
    date: Date;
    job: {
        title: string;
    };
    createdBy: {
        name: string | null;
    };
}

interface CostListTableProps {
    costs: Cost[];
}

const statusConfig: any = {
    'PENDING': { label: 'Onay Bekliyor', variant: 'warning', className: 'bg-yellow-100 text-yellow-800' },
    'APPROVED': { label: 'Onaylandı', variant: 'success', className: 'bg-green-100 text-green-800' },
    'REJECTED': { label: 'Reddedildi', variant: 'destructive', className: 'bg-red-100 text-red-800' }
};

export default function CostListTable({ costs }: CostListTableProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Masraf Listesi</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[120px]">Tarih</TableHead>
                                <TableHead>İş</TableHead>
                                <TableHead>Açıklama</TableHead>
                                <TableHead>Kategori</TableHead>
                                <TableHead>Personel</TableHead>
                                <TableHead>Durum</TableHead>
                                <TableHead className="text-right">Tutar</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {costs.length > 0 ? (
                                costs.map((cost) => (
                                    <TableRow key={cost.id}>
                                        <TableCell className="font-medium">
                                            {format(new Date(cost.date), 'dd MMM yyyy', { locale: tr })}
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate" title={cost.job.title}>
                                            {cost.job.title}
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate" title={cost.description}>
                                            {cost.description}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-normal bg-gray-50">
                                                {cost.category || '-'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{cost.createdBy.name}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={statusConfig[cost.status]?.className}>
                                                {statusConfig[cost.status]?.label || cost.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right font-bold">
                                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(cost.amount)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        Kayıt bulunamadı.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
