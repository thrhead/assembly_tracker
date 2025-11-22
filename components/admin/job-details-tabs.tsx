'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { JobDetailsView } from '@/components/job-details-view'
import { JobTimeline } from '@/components/charts/job-timeline'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MapPin, Save } from 'lucide-react'

// Dynamic imports to avoid SSR issues
const JobLocationMap = dynamic(
    () => import('@/components/map/job-location-map').then(mod => mod.JobLocationMap),
    { ssr: false, loading: () => <div className="h-[400px] bg-gray-100 rounded-lg animate-pulse" /> }
)

const ProgressCharts = dynamic(
    () => import('@/components/charts/progress-charts').then(mod => mod.ProgressCharts),
    { ssr: false, loading: () => <div className="h-[300px] bg-gray-100 rounded-lg animate-pulse" /> }
)

interface AdminJobDetailsTabsProps {
    job: any
}

export function AdminJobDetailsTabs({ job }: AdminJobDetailsTabsProps) {
    const [latitude, setLatitude] = useState(job.latitude?.toString() || '')
    const [longitude, setLongitude] = useState(job.longitude?.toString() || '')
    const [saving, setSaving] = useState(false)

    const handleSaveCoordinates = async () => {
        const lat = parseFloat(latitude)
        const lng = parseFloat(longitude)

        if (isNaN(lat) || isNaN(lng)) {
            alert('Lütfen geçerli koordinatlar girin')
            return
        }

        setSaving(true)
        try {
            const res = await fetch(`/api/admin/jobs/${job.id}/coordinates`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ latitude: lat, longitude: lng })
            })

            if (res.ok) {
                alert('Koordinatlar kaydedildi! Sayfa yenileniyor...')
                window.location.reload()
            } else {
                alert('Koordinatlar kaydedilemedi')
            }
        } catch (error) {
            console.error(error)
            alert('Bir hata oluştu')
        } finally {
            setSaving(false)
        }
    }

    const totalSteps = job.steps.length
    const completedSteps = job.steps.filter((s: any) => s.isCompleted).length
    const blockedSteps = job.steps.filter((s: any) => s.blockedAt).length

    return (
        <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
                <TabsTrigger value="timeline">Zaman Çizelgesi</TabsTrigger>
                <TabsTrigger value="analytics">Grafikler</TabsTrigger>
                <TabsTrigger value="map">Harita</TabsTrigger>
                <TabsTrigger value="details">Detaylar</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
                <JobDetailsView job={job} />
            </TabsContent>

            <TabsContent value="timeline" className="space-y-6">
                <JobTimeline
                    steps={job.steps}
                    scheduledDate={job.scheduledDate}
                    completedDate={job.completedDate}
                />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
                <ProgressCharts
                    totalSteps={totalSteps}
                    completedSteps={completedSteps}
                    blockedSteps={blockedSteps}
                    steps={job.steps}
                />
            </TabsContent>

            <TabsContent value="map" className="space-y-6">
                {job.latitude && job.longitude ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                İş Konumu
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <JobLocationMap
                                latitude={job.latitude}
                                longitude={job.longitude}
                                jobTitle={job.title}
                                location={job.location || undefined}
                            />
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <MapPin className="h-5 w-5" />
                                Konum Bilgisi Ekle
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-sm text-gray-600">
                                Bu iş için henüz konum bilgisi eklenmemiş. Aşağıdan koordinatları girebilirsiniz.
                            </p>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="latitude">Enlem (Latitude)</Label>
                                    <Input
                                        id="latitude"
                                        type="number"
                                        step="any"
                                        placeholder="Örn: 41.0082"
                                        value={latitude}
                                        onChange={(e) => setLatitude(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="longitude">Boylam (Longitude)</Label>
                                    <Input
                                        id="longitude"
                                        type="number"
                                        step="any"
                                        placeholder="Örn: 28.9784"
                                        value={longitude}
                                        onChange={(e) => setLongitude(e.target.value)}
                                    />
                                </div>
                            </div>

                            <Button onClick={handleSaveCoordinates} disabled={saving}>
                                <Save className="h-4 w-4 mr-2" />
                                {saving ? 'Kaydediliyor...' : 'Koordinatları Kaydet'}
                            </Button>

                            <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                                <p className="font-medium mb-1">💡 İpucu:</p>
                                <p>Google Maps&apos;ten koordinat almak için: Konuma sağ tıklayın → İlk satırdaki sayılara tıklayın</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">İş Bilgileri</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Durum:</span>
                                <span className="font-medium">{job.status}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Öncelik:</span>
                                <span className="font-medium">{job.priority}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Toplam Adım:</span>
                                <span className="font-medium">{totalSteps}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Tamamlanan:</span>
                                <span className="font-medium text-green-600">{completedSteps}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Bloklanan:</span>
                                <span className="font-medium text-red-600">{blockedSteps}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">Müşteri Bilgileri</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Şirket:</span>
                                <span className="font-medium">{job.customer.company}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">İsim:</span>
                                <span className="font-medium">{job.customer.user.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Email:</span>
                                <span className="font-medium">{job.customer.user.email}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Telefon:</span>
                                <span className="font-medium">{job.customer.user.phone}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>
        </Tabs>
    )
}
