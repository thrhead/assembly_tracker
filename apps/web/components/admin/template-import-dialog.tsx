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
import { FileSpreadsheetIcon, Loader2Icon, DownloadIcon, AlertCircleIcon, CheckCircleIcon } from 'lucide-react'
import * as XLSX from 'xlsx'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function TemplateImportDialog() {
    const [open, setOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [result, setResult] = useState<{ success: boolean; count?: number; errors?: string[] } | null>(null)
    const router = useRouter()

    const downloadTemplate = () => {
        const templateData = [
            {
                "Template Name": "Duvar Tipi Klima Montajı",
                "Description": "Standart duvar tipi klima montaj adımları",
                "Step Title": "Hazırlık",
                "SubStep Title": "Montaj yerinin belirlenmesi"
            },
            {
                "Template Name": "Duvar Tipi Klima Montajı",
                "Description": "Standart duvar tipi klima montaj adımları",
                "Step Title": "Hazırlık",
                "SubStep Title": "Gerekli ekipmanların kontrolü"
            },
            {
                "Template Name": "Duvar Tipi Klima Montajı",
                "Description": "Standart duvar tipi klima montaj adımları",
                "Step Title": "İç Ünite Montajı",
                "SubStep Title": "Montaj sacının sabitlenmesi"
            }
        ]

        const worksheet = XLSX.utils.json_to_sheet(templateData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Template")
        XLSX.writeFile(workbook, "Sablon_Yukleme_Formati.xlsx")
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
            const res = await fetch("/api/admin/templates/import", {
                method: "POST",
                body: formData,
            })

            if (!res.ok) {
                throw new Error(await res.text() || "Yükleme başarısız")
            }

            const data = await res.json()
            setResult(data)

            if (data.success && (!data.errors || data.errors.length === 0)) {
                toast.success(`${data.count} şablon başarıyla oluşturuldu`)
                setTimeout(() => {
                    setOpen(false)
                    setFile(null)
                    setResult(null)
                    router.refresh()
                }, 2000)
            } else if (data.success && data.errors?.length > 0) {
                toast.warning(`${data.count} şablon oluşturuldu ancak bazı hatalar var.`)
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
                <Button variant="outline" className="gap-2">
                    <FileSpreadsheetIcon className="h-4 w-4" />
                    Excel ile Şablon Yükle
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Excel ile İş Şablonu Yükle</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="bg-blue-50 p-4 rounded-lg flex items-start gap-3">
                        <AlertCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div className="text-sm text-blue-800">
                            <p className="font-medium mb-1">Bilgilendirme</p>
                            <p>1. Şablon formatını indirin.</p>
                            <p>2. &quot;Template Name&quot; (Şablon Adı) aynı olan satırlar gruplanır.</p>
                            <p>3. Aynı şablona ait adımlar ve alt adımlar otomatik oluşturulur.</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4">
                        <Button variant="outline" onClick={downloadTemplate} className="w-full">
                            <DownloadIcon className="h-4 w-4 mr-2" />
                            Formatı İndir
                        </Button>

                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="template-file">Excel Dosyası</Label>
                            <Input id="template-file" type="file" accept=".xlsx, .xls" onChange={handleFileChange} />
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
                                <p className="text-sm text-green-700 mb-2">{result.count} şablon oluşturuldu.</p>
                            )}
                            {result.errors && result.errors.length > 0 && (
                                <div className="text-sm text-red-700 max-h-[150px] overflow-y-auto">
                                    <ul className="list-disc pl-5 space-y-1">
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
