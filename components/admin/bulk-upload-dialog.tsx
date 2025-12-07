'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UploadIcon, FileSpreadsheetIcon, Loader2Icon, DownloadIcon, AlertCircleIcon, CheckCircleIcon } from 'lucide-react'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function BulkUploadDialog() {
    const [open, setOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<{ success: boolean; count?: number; errors?: string[] } | null>(null)
    const router = useRouter()

    const downloadTemplate = () => {
        const templateData = [
            {
                "Job Title": "Örnek İş 1",
                "Description": "İş açıklaması buraya",
                "Customer Company": "Müşteri Firma Adı",
                "Priority": "MEDIUM",
                "Date": "2024-01-01",
                "Step Title": "Hazırlık",
                "SubStep Title": "Malzeme Kontrolü"
            },
            {
                "Job Title": "Örnek İş 1",
                "Description": "İş açıklaması buraya",
                "Customer Company": "Müşteri Firma Adı",
                "Priority": "MEDIUM",
                "Date": "2024-01-01",
                "Step Title": "Hazırlık",
                "SubStep Title": "Ekipman Hazırlığı"
            },
            {
                "Job Title": "Örnek İş 1",
                "Description": "İş açıklaması buraya",
                "Customer Company": "Müşteri Firma Adı",
                "Priority": "MEDIUM",
                "Date": "2024-01-01",
                "Step Title": "Montaj",
                "SubStep Title": "Ana Ünite Montajı"
            }
        ]

        const worksheet = XLSX.utils.json_to_sheet(templateData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Template")
        XLSX.writeFile(workbook, "Is_Yukleme_Sablonu.xlsx")
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            setResult(null)
        }
    }

    const handleUpload = async () => {
        if (!file) return

        setIsLoading(true)
        setResult(null)

        const formData = new FormData()
        formData.append("file", file)

        try {
            const res = await fetch("/api/admin/jobs/bulk-import", {
                method: "POST",
                body: formData,
            })

            if (!res.ok) {
                throw new Error(await res.text() || "Upload failed")
            }

            const data = await res.json()
            setResult(data)

            if (data.success && (!data.errors || data.errors.length === 0)) {
                toast.success(`${data.count} iş başarıyla oluşturuldu`)
                setTimeout(() => {
                    setOpen(false)
                    setFile(null)
                    setResult(null)
                    router.refresh()
                }, 2000)
            } else if (data.success && data.errors?.length > 0) {
                toast.warning(`${data.count} iş oluşturuldu ancak bazı hatalar var.`)
                router.refresh()
            }

        } catch (error: any) {
            console.error("Upload error:", error)
            toast.error(error.message || "Dosya yüklenirken bir hata oluştu")
            setResult({ success: false, errors: [error.message] })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="secondary" className="gap-2">
                    <FileSpreadsheetIcon className="h-4 w-4" />
                    Toplu Yükle
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Excel ile Toplu İş Yükle</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                        <AlertCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Nasıl kullanılır?</p>
                            <p>1. Şablonu indirin.</p>
                            <p>2. İşlerinizi şablona uygun şekilde doldurun.</p>
                            <p>3. Doldurduğunuz dosyayı buraya yükleyin.</p>
                            <p className="mt-2 text-xs opacity-80">* Aynı "Job Title"a sahip satırlar tek bir iş olarak gruplanır.</p>
                            <p className="text-xs opacity-80">* Müşteri ismi sistemde kayıtlı olmalıdır.</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Button variant="outline" onClick={downloadTemplate} className="w-full">
                            <DownloadIcon className="h-4 w-4 mr-2" />
                            Örnek Şablonu İndir
                        </Button>

                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="excel-file">Excel Dosyası</Label>
                            <Input id="excel-file" type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
                        </div>
                    </div>

                    {result && (
                        <div className={`rounded-lg p-4 ${result.success && (!result.errors || result.errors.length === 0) ? 'bg-green-50' : 'bg-red-50'}`}>
                            <div className="flex items-center gap-2 mb-2">
                                {result.success && (!result.errors || result.errors.length === 0) ? (
                                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                ) : (
                                    <AlertCircleIcon className="h-5 w-5 text-red-600" />
                                )}
                                <span className={`font-medium ${result.success && (!result.errors || result.errors.length === 0) ? 'text-green-800' : 'text-red-800'}`}>
                                    {result.success ? "İşlem Tamamlandı" : "Hata Oluştu"}
                                </span>
                            </div>
                            {result.count !== undefined && (
                                <p className="text-sm text-green-700 mb-2">{result.count} iş başarıyla oluşturuldu.</p>
                            )}
                            {result.errors && result.errors.length > 0 && (
                                <div className="text-sm text-red-700 max-h-[150px] overflow-y-auto">
                                    <p className="font-medium">Hatalar:</p>
                                    <ul className="list-disc pl-5 space-y-1 mt-1">
                                        {result.errors.map((err, i) => (
                                            <li key={i}>{err}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button variant="outline" onClick={() => setOpen(false)}>İptal</Button>
                        <Button onClick={handleUpload} disabled={!file || isLoading}>
                            {isLoading && <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />}
                            Yükle
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
