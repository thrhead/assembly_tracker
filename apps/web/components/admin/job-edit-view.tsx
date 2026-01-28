'use client'

import { useState } from "react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Calendar as CalendarIcon, Save, Plus, X, Trash2, Edit2, Check, User, Briefcase, MapPin, Clock, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface JobEditViewProps {
    job: any
    workers: { id: string; name: string | null }[]
    teams: { id: string; name: string }[]
}

export function JobEditView({ job, workers, teams }: JobEditViewProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [isEditing, setIsEditing] = useState(false)

    // Form State
    const [startedAt, setStartedAt] = useState<Date | undefined>(job.startedAt ? new Date(job.startedAt) : undefined)
    const [completedDate, setCompletedDate] = useState<Date | undefined>(job.completedDate ? new Date(job.completedDate) : undefined)

    // Costs State
    const [costs, setCosts] = useState(job.costs)
    const [isAddingCost, setIsAddingCost] = useState(false)
    const [newCost, setNewCost] = useState({ description: '', amount: '', category: 'OTHER' })

    const totalCost = job.costs.reduce((sum: number, cost: any) => sum + cost.amount, 0)

    const handleSaveDates = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/admin/jobs/${job.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    startedAt,
                    completedDate
                })
            })

            if (!response.ok) throw new Error('Güncelleme başarısız')

            toast.success('Tarihler güncellendi')
            router.refresh()
            setIsEditing(false)
        } catch (error) {
            toast.error('Bir hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    const handleAddCost = async () => {
        if (!newCost.description || !newCost.amount) return

        setLoading(true)
        try {
            const response = await fetch(`/api/admin/jobs/${job.id}/costs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newCost,
                    amount: parseFloat(newCost.amount)
                })
            })

            if (!response.ok) throw new Error('Masraf ekleme başarısız')

            toast.success('Masraf eklendi')
            router.refresh()
            setIsAddingCost(false)
            setNewCost({ description: '', amount: '', category: 'OTHER' })
        } catch (error) {
            toast.error('Bir hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteCost = async (costId: string) => {
        if (!confirm('Bu masrafı silmek istediğinize emin misiniz?')) return

        setLoading(true)
        try {
            const response = await fetch(`/api/admin/jobs/${job.id}/costs?id=${costId}`, {
                method: 'DELETE'
            })

            if (!response.ok) throw new Error('Silme başarısız')

            toast.success('Masraf silindi')
            router.refresh()
        } catch (error) {
            toast.error('Bir hata oluştu')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Dates & Status Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-bold">İş Bilgileri</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => isEditing ? handleSaveDates() : setIsEditing(true)}>
                        {isEditing ? <Save className="h-4 w-4 mr-2" /> : <Edit2 className="h-4 w-4 mr-2" />}
                        {isEditing ? 'Kaydet' : 'Düzenle'}
                    </Button>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2 pt-4">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-500">Planlanan Başlangıç</label>
                                <div className="flex items-center p-2 bg-gray-50 rounded border">
                                    <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                                    {job.scheduledDate ? format(new Date(job.scheduledDate), "PPP HH:mm", { locale: tr }) : 'Belirtilmemiş'}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-500">Planlanan Bitiş</label>
                                <div className="flex items-center p-2 bg-gray-50 rounded border">
                                    <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                                    {job.scheduledEndDate ? format(new Date(job.scheduledEndDate), "PPP HH:mm", { locale: tr }) : 'Belirtilmemiş'}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-500">Gerçekleşen Başlangıç</label>
                                <div className="flex items-center p-2 bg-gray-50 rounded border">
                                    <CalendarIcon className="h-4 w-4 mr-2 text-green-600" />
                                    {job.startedAt ? format(new Date(job.startedAt), "PPP HH:mm", { locale: tr }) : 'Henüz başlamadı'}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-500">Gerçekleşen Bitiş</label>
                                <div className="flex items-center p-2 bg-gray-50 rounded border">
                                    <CalendarIcon className="h-4 w-4 mr-2 text-blue-600" />
                                    {job.completedDate ? format(new Date(job.completedDate), "PPP HH:mm", { locale: tr }) : 'Devam ediyor'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium text-gray-500">Durum</label>
                            <Badge className={cn("w-fit",
                                job.status === 'COMPLETED' ? 'bg-green-500' :
                                    job.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-yellow-500'
                            )}>
                                {job.status === 'COMPLETED' ? 'Tamamlandı' :
                                    job.status === 'IN_PROGRESS' ? 'Devam Ediyor' : 'Bekliyor'}
                            </Badge>
                        </div>
                        <div className="flex flex-col space-y-2">
                            <label className="text-sm font-medium text-gray-500">Konum</label>
                            <div className="flex items-center text-sm">
                                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                {job.location || 'Konum yok'}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Assignments Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-bold">Ekip ve Atamalar</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {job.assignments.map((assignment: any) => (
                            <div key={assignment.id} className="flex items-center justify-between p-2 border rounded-lg bg-gray-50">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Users className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="font-medium">{assignment.team ? assignment.team.name : assignment.worker?.name}</p>
                                        <p className="text-xs text-gray-500">{assignment.team ? 'Ekip' : 'Personel'}</p>
                                        {assignment.team && assignment.team.members && assignment.team.members.length > 0 ? (
                                            <div className="mt-1 text-sm text-gray-600">
                                                <span className="font-semibold">Üyeler: </span>
                                                {assignment.team.members.map((m: any) => m.user?.name || 'Bilinmiyor').join(', ')}
                                            </div>
                                        ) : assignment.team ? (
                                            <div className="mt-1 text-sm text-red-500">
                                                Bu ekipte üye bulunmuyor.
                                            </div>
                                        ) : null}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {job.assignments.length === 0 && (
                            <p className="text-sm text-gray-500 italic text-center py-2">Henüz atama yapılmamış.</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Costs Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-bold">Maliyetler</CardTitle>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">Toplam Maliyet</p>
                        <p className="text-2xl font-bold text-green-600">₺{totalCost.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</p>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        {job.costs.map((cost: any) => (
                            <div key={cost.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                        <span className="text-xs font-bold text-green-700">₺</span>
                                    </div>
                                    <div>
                                        <p className="font-medium">{cost.description}</p>
                                        <p className="text-xs text-gray-500">
                                            {cost.category} • {cost.createdBy?.name || 'Silinmiş Kullanıcı'} • {format(new Date(cost.date), 'd MMM', { locale: tr })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className="font-bold">₺{cost.amount.toLocaleString('tr-TR')}</span>
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteCost(cost.id)}>
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {job.costs.length === 0 && (
                            <p className="text-sm text-gray-500 italic text-center py-2">Henüz maliyet girişi yapılmamış.</p>
                        )}
                    </div>

                    {isAddingCost ? (
                        <div className="grid gap-3 p-4 bg-gray-50 rounded-lg border animate-in fade-in slide-in-from-top-2">
                            <Input
                                placeholder="Açıklama"
                                value={newCost.description}
                                onChange={e => setNewCost({ ...newCost, description: e.target.value })}
                            />
                            <div className="flex gap-2">
                                <Input
                                    type="number"
                                    placeholder="Tutar"
                                    value={newCost.amount}
                                    onChange={e => setNewCost({ ...newCost, amount: e.target.value })}
                                />
                                <Select
                                    value={newCost.category}
                                    onValueChange={v => setNewCost({ ...newCost, category: v })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="MATERIAL">Malzeme</SelectItem>
                                        <SelectItem value="LABOR">İşçilik</SelectItem>
                                        <SelectItem value="TRANSPORT">Ulaşım</SelectItem>
                                        <SelectItem value="FOOD">Yemek</SelectItem>
                                        <SelectItem value="OTHER">Diğer</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => setIsAddingCost(false)}>İptal</Button>
                                <Button size="sm" onClick={handleAddCost} disabled={loading}>Kaydet</Button>
                            </div>
                        </div>
                    ) : (
                        <Button variant="outline" className="w-full" onClick={() => setIsAddingCost(true)}>
                            <Plus className="h-4 w-4 mr-2" /> Yeni Maliyet Ekle
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
