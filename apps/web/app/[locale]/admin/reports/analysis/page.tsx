"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Loader2Icon,
  TrendingDownIcon,
  TrendingUpIcon,
  AlertCircleIcon,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface VarianceReport {
  id: string;
  jobNo: string;
  title: string;
  customerName: string;
  status: string;
  plannedCost: number;
  actualCost: number;
  costVariance: number;
  costVarianceColor: "red" | "green";
  plannedDuration: number;
  actualDuration: number;
  timeVariance: number;
  timeVarianceColor: "red" | "green";
}

export default function AnalysisPage() {
  const [data, setData] = useState<VarianceReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/reports/variance");
        if (!res.ok) throw new Error("Veri alınamadı");
        const jsonData = await res.json();
        setData(jsonData);
      } catch (error) {
        console.error("Report fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2Icon className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Tahmin vs Gerçek Analizi
        </h1>
        <p className="text-muted-foreground">
          İşlerin planlanan bütçe ve süreleri ile gerçekleşen değerlerin
          karşılaştırması.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Toplam İş</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bütçe Aşımı Olan İşler
            </CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {data.filter((i) => i.costVariance > 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Süre Aşımı Olan İşler
            </CardTitle>
            <AlertCircleIcon className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {data.filter((i) => i.timeVariance > 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Bütçe Tasarrufu
            </CardTitle>
            <TrendingDownIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(
                data.reduce(
                  (acc, curr) =>
                    acc +
                    (curr.costVariance < 0 ? Math.abs(curr.costVariance) : 0),
                  0,
                ),
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detaylı Analiz Tablosu</CardTitle>
          <CardDescription>
            Pozitif sapmalar bütçe/süre aşımını, negatif sapmalar tasarrufu
            gösterir.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>İş No</TableHead>
                <TableHead>Başlık</TableHead>
                <TableHead>Müşteri</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">Planlanan Maliyet</TableHead>
                <TableHead className="text-right">Gerçek Maliyet</TableHead>
                <TableHead className="text-right">Maliyet Sapması</TableHead>
                <TableHead className="text-right">Planlanan Süre</TableHead>
                <TableHead className="text-right">Gerçek Süre</TableHead>
                <TableHead className="text-right">Süre Sapması</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">
                    {row.jobNo || "-"}
                  </TableCell>
                  <TableCell>{row.title}</TableCell>
                  <TableCell>{row.customerName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{row.status}</Badge>
                  </TableCell>

                  {/* Cost Columns */}
                  <TableCell className="text-right font-mono text-xs">
                    {formatCurrency(row.plannedCost)}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {formatCurrency(row.actualCost)}
                  </TableCell>
                  <TableCell
                    className={`text-right font-bold ${row.costVariance > 0 ? "text-red-500" : "text-green-500"}`}
                  >
                    {formatCurrency(row.costVariance)}
                  </TableCell>

                  {/* Time Columns */}
                  <TableCell className="text-right font-mono text-xs">
                    {row.plannedDuration > 0
                      ? `${row.plannedDuration} dk`
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right font-mono text-xs">
                    {row.actualDuration > 0 ? `${row.actualDuration} dk` : "-"}
                  </TableCell>
                  <TableCell
                    className={`text-right font-bold ${row.timeVariance > 0 ? "text-red-500" : "text-green-500"}`}
                  >
                    {row.timeVariance !== 0
                      ? `${row.timeVariance > 0 ? "+" : ""}${row.timeVariance} dk`
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="h-24 text-center">
                    Analiz edilecek veri bulunamadı.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
